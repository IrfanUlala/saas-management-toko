import { ConvexError, v } from "convex/values";
import schema from "./schema";
import { mutation, query } from "./_generated/server";
import { requireStoreManager } from "./lib/access";

const paymentMethod = v.union(
  v.literal("cash"),
  v.literal("bankTransfer"),
  v.literal("debitCard"),
  v.literal("creditCard"),
  v.literal("qris"),
  v.literal("eWallet"),
  v.literal("other"),
);

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      purchase: schema.doc("purchases"),
      items: v.array(schema.doc("purchaseItems")),
      payments: v.array(schema.doc("purchasePayments")),
    }),
  ),
  handler: async (ctx) => {
    const access = await requireStoreManager(ctx);
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_store_and_time", (q) =>
        q.eq("storeId", access.store._id),
      )
      .order("desc")
      .take(200);
    return await Promise.all(
      purchases.map(async (purchase) => {
        const [items, payments] = await Promise.all([
          ctx.db
            .query("purchaseItems")
            .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
            .take(200),
          ctx.db
            .query("purchasePayments")
            .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
            .order("desc")
            .take(200),
        ]);
        return { purchase, items, payments };
      }),
    );
  },
});

export const create = mutation({
  args: {
    vendorId: v.id("vendors"),
    invoiceNumber: v.optional(v.string()),
    amountPaid: v.number(),
    note: v.optional(v.string()),
    method: paymentMethod,
    lines: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        unitCost: v.number(),
      }),
    ),
  },
  returns: v.id("purchases"),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    if (
      !Number.isFinite(args.amountPaid) ||
      args.amountPaid < 0 ||
      args.lines.length === 0 ||
      args.lines.length > 200
    ) {
      throw new ConvexError("Periksa jumlah pembayaran dan barang pembelian.");
    }
    const vendor = await ctx.db.get(args.vendorId);
    if (
      !vendor ||
      vendor.storeId !== access.store._id ||
      vendor.status !== "active"
    ) {
      throw new ConvexError("Pilih vendor aktif dari toko ini.");
    }

    const now = Date.now();
    const preparedLines = await Promise.all(
      args.lines.map(async (line) => {
        if (
          !Number.isFinite(line.quantity) ||
          !Number.isFinite(line.unitCost) ||
          line.quantity <= 0 ||
          line.unitCost < 0
        ) {
          throw new ConvexError("Jumlah dan harga beli harus valid.");
        }
        const product = await ctx.db.get(line.productId);
        if (
          !product ||
          product.storeId !== access.store._id ||
          product.status !== "active"
        ) {
          throw new ConvexError("Produk pembelian tidak ditemukan atau nonaktif.");
        }
        const unit = await ctx.db.get(product.baseUnitId);
        if (!unit) throw new ConvexError("Satuan produk tidak ditemukan.");
        return { ...line, product, unit };
      }),
    );
    const subtotal = preparedLines.reduce(
      (sum, line) => sum + line.quantity * line.unitCost,
      0,
    );
    if (!Number.isFinite(subtotal)) {
      throw new ConvexError("Total pembelian melebihi batas yang didukung.");
    }

    const settings = await ctx.db
      .query("storeSettings")
      .withIndex("by_store", (q) => q.eq("storeId", access.store._id))
      .unique();
    if (!settings) throw new ConvexError("Pengaturan nomor pembelian belum tersedia.");
    const purchaseNumber = `PB-${new Date(now).getFullYear()}-${String(
      settings.nextPurchaseNumber,
    ).padStart(4, "0")}`;
    await ctx.db.patch(settings._id, {
      nextPurchaseNumber: settings.nextPurchaseNumber + 1,
      updatedAt: now,
    });

    const paid = args.amountPaid;
    const purchaseId = await ctx.db.insert("purchases", {
      storeId: access.store._id,
      purchaseNumber,
      vendorId: vendor._id,
      vendorName: vendor.name,
      invoiceNumber: args.invoiceNumber?.trim() || undefined,
      createdBy: access.userId,
      status: "received",
      paymentStatus:
        paid >= subtotal ? "paid" : paid > 0 ? "partial" : "unpaid",
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: subtotal,
      amountPaid: paid,
      note: args.note?.trim() || undefined,
      purchasedAt: now,
      receivedAt: now,
      updatedAt: now,
    });

    for (const line of preparedLines) {
      const lineTotal = line.quantity * line.unitCost;
      await ctx.db.insert("purchaseItems", {
        storeId: access.store._id,
        purchaseId,
        productId: line.product._id,
        productName: line.product.name,
        sku: line.product.sku,
        unitId: line.unit._id,
        unitName: line.unit.abbreviation,
        quantity: line.quantity,
        baseQuantity: line.quantity,
        unitCost: line.unitCost,
        discountAmount: 0,
        lineTotal,
        receivedBaseQuantity: line.quantity,
      });

      const inventory = await ctx.db
        .query("inventoryLevels")
        .withIndex("by_store_and_product", (q) =>
          q.eq("storeId", access.store._id).eq("productId", line.product._id),
        )
        .unique();
      const before = inventory?.quantity ?? 0;
      const after = before + line.quantity;
      if (inventory) {
        await ctx.db.patch(inventory._id, { quantity: after, updatedAt: now });
      } else {
        await ctx.db.insert("inventoryLevels", {
          storeId: access.store._id,
          productId: line.product._id,
          quantity: after,
          updatedAt: now,
        });
      }
      await ctx.db.insert("inventoryMovements", {
        storeId: access.store._id,
        productId: line.product._id,
        type: "purchase",
        quantityChange: line.quantity,
        quantityBefore: before,
        quantityAfter: after,
        referenceType: "purchase",
        referenceId: purchaseId,
        performedBy: access.userId,
        createdAt: now,
      });
      await ctx.db.patch(line.product._id, {
        purchasePrice: line.unitCost,
        updatedAt: now,
      });
    }

    if (paid > 0) {
      await ctx.db.insert("purchasePayments", {
        storeId: access.store._id,
        purchaseId,
        method: args.method,
        amount: paid,
        paidAt: now,
        recordedBy: access.userId,
      });
    }
    return purchaseId;
  },
});
