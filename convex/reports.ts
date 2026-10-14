import { v } from "convex/values";
import schema from "./schema";
import { query } from "./_generated/server";
import { requireStoreManager } from "./lib/access";

export const productStockMovements = query({
  args: { productId: v.id("products") },
  returns: v.object({
    product: v.union(schema.doc("products"), v.null()),
    quantity: v.number(),
    movements: v.array(schema.doc("inventoryMovements")),
  }),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product || product.storeId !== access.store._id) {
      return { product: null, quantity: 0, movements: [] };
    }
    const level = await ctx.db
      .query("inventoryLevels")
      .withIndex("by_store_and_product", (q) =>
        q.eq("storeId", access.store._id).eq("productId", product._id),
      )
      .unique();
    const movements = await ctx.db
      .query("inventoryMovements")
      .withIndex("by_store_and_product_and_time", (q) =>
        q.eq("storeId", access.store._id).eq("productId", product._id),
      )
      .order("desc")
      .take(500);
    return { product, quantity: level?.quantity ?? 0, movements };
  },
});

export const overview = query({
  args: { from: v.number(), through: v.number() },
  returns: v.object({
    sales: v.array(schema.doc("sales")),
    purchases: v.array(schema.doc("purchases")),
    expenses: v.array(schema.doc("expenses")),
    stock: v.array(v.object({ product: schema.doc("products"), quantity: v.number() })),
  }),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const [sales, purchases, expenses, levels] = await Promise.all([
      ctx.db.query("sales").withIndex("by_store_and_time", (q) => q.eq("storeId", access.store._id).gte("soldAt", args.from).lte("soldAt", args.through)).order("desc").take(500),
      ctx.db.query("purchases").withIndex("by_store_and_time", (q) => q.eq("storeId", access.store._id).gte("purchasedAt", args.from).lte("purchasedAt", args.through)).order("desc").take(500),
      ctx.db.query("expenses").withIndex("by_store_and_time", (q) => q.eq("storeId", access.store._id).gte("incurredAt", args.from).lte("incurredAt", args.through)).order("desc").take(500),
      ctx.db.query("inventoryLevels").withIndex("by_store", (q) => q.eq("storeId", access.store._id)).take(500),
    ]);
    const stock = await Promise.all(levels.map(async (level) => {
      const product = await ctx.db.get(level.productId);
      return product && product.storeId === access.store._id ? { product, quantity: level.quantity } : null;
    }));
    return { sales, purchases, expenses, stock: stock.filter((row): row is NonNullable<typeof row> => row !== null) };
  },
});
