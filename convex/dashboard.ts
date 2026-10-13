import { v } from "convex/values";
import schema from "./schema";
import { query } from "./_generated/server";
import { requireStore } from "./lib/access";

function startOfLocalDay(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(timestamp);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const offsetText = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  })
    .formatToParts(timestamp)
    .find((part) => part.type === "timeZoneName")?.value;
  const offsetMatch = offsetText?.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMinutes = offsetMatch
    ? (offsetMatch[1] === "-" ? -1 : 1) *
      (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3]))
    : 0;
  return (
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
    ) -
    offsetMinutes * 60_000
  );
}

export const summary = query({
  args: {},
  returns: v.object({
    salesToday: v.number(),
    salesTodayCount: v.number(),
    purchasesWeekTotal: v.number(),
    purchasesWeekCount: v.number(),
    productCount: v.number(),
    lowStockCount: v.number(),
    weeklySales: v.array(
      v.object({ dayStart: v.number(), total: v.number() }),
    ),
    recentSales: v.array(
      v.object({
        sale: schema.doc("sales"),
        itemCount: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const access = await requireStore(ctx);
    const now = Date.now();
    const settings = await ctx.db
      .query("storeSettings")
      .withIndex("by_store", (q) => q.eq("storeId", access.store._id))
      .unique();
    const timezone = settings?.timezone ?? "Asia/Jakarta";
    const todayStart = startOfLocalDay(now, timezone);
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

    const [sales, purchases, products, recentSales] = await Promise.all([
      ctx.db
        .query("sales")
        .withIndex("by_store_and_time", (q) =>
          q.eq("storeId", access.store._id).gte("soldAt", weekStart),
        )
        .take(1000),
      ctx.db
        .query("purchases")
        .withIndex("by_store_and_time", (q) =>
          q.eq("storeId", access.store._id).gte("purchasedAt", weekStart),
        )
        .take(1000),
      ctx.db
        .query("products")
        .withIndex("by_store_and_status", (q) =>
          q.eq("storeId", access.store._id).eq("status", "active"),
        )
        .take(200),
      ctx.db
        .query("sales")
        .withIndex("by_store_and_time", (q) =>
          q.eq("storeId", access.store._id),
        )
        .order("desc")
        .take(5),
    ]);

    const weeklyTotals = new Map<number, number>();
    let salesToday = 0;
    let salesTodayCount = 0;
    for (const sale of sales) {
      if (sale.status !== "completed") continue;
      const dayStart = startOfLocalDay(sale.soldAt, timezone);
      weeklyTotals.set(dayStart, (weeklyTotals.get(dayStart) ?? 0) + sale.totalAmount);
      if (dayStart === todayStart) {
        salesToday += sale.totalAmount;
        salesTodayCount += 1;
      }
    }

    const lowStockCount = await Promise.all(
      products.map(async (product) => {
        const inventory = await ctx.db
          .query("inventoryLevels")
          .withIndex("by_store_and_product", (q) =>
            q.eq("storeId", access.store._id).eq("productId", product._id),
          )
          .unique();
        return (inventory?.quantity ?? 0) <= product.lowStockThreshold ? 1 : 0;
      }),
    );

    return {
      salesToday,
      salesTodayCount,
      purchasesWeekTotal: purchases.reduce(
        (sum, purchase) =>
          sum + (purchase.status === "cancelled" ? 0 : purchase.totalAmount),
        0,
      ),
      purchasesWeekCount: purchases.filter(
        (purchase) => purchase.status !== "cancelled",
      ).length,
      productCount: products.length,
      lowStockCount: lowStockCount.reduce<number>(
        (sum, count) => sum + count,
        0,
      ),
      weeklySales: Array.from({ length: 7 }, (_, index) => {
        const dayStart = weekStart + index * 24 * 60 * 60 * 1000;
        return { dayStart, total: weeklyTotals.get(dayStart) ?? 0 };
      }),
      recentSales: await Promise.all(
        recentSales.map(async (sale) => ({
          sale,
          itemCount: (
            await ctx.db
              .query("saleItems")
              .withIndex("by_sale", (q) => q.eq("saleId", sale._id))
              .take(200)
          ).length,
        })),
      ),
    };
  },
});
