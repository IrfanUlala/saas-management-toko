import { ConvexError, v } from "convex/values";
import schema from "./schema";
import { mutation, query } from "./_generated/server";
import { requireStore, requireStoreManager } from "./lib/access";

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
      sale: schema.doc("sales"),
      items: v.array(schema.doc("saleItems")),
      payments: v.array(schema.doc("salePayments")),
    }),
  ),
  handler: async (ctx) => {
    const access = await requireStore(ctx);
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_store_and_time", (q) =>
        q.eq("storeId", access.store._id),
      )
      .order("desc")
      .take(200);
    return await Promise.all(
      sales.map(async (sale) => {
        const [items, payments] = await Promise.all([
          ctx.db
            .query("saleItems")
            .withIndex("by_sale", (q) => q.eq("saleId", sale._id))
            .take(200),
          ctx.db
            .query("salePayments")
            .withIndex("by_sale", (q) => q.eq("saleId", sale._id))
            .take(200),
        ]);
        return { sale, items, payments };
      }),
    );
  },
});

export const checkout = mutation({
  args: {
    lines: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      }),
    ),
    amountTendered: v.number(),
    method: paymentMethod,
    customerName: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    note: v.optional(v.string()),
    soldAt: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const access = await requireStore(ctx);
    if (
      args.lines.length === 0 ||
      args.lines.length > 200 ||
      !Number.isFinite(args.amountTendered) ||
      args.amountTendered < 0
    ) {
      throw new ConvexError("Periksa barang dan nominal pembayaran.");
    }

    const now = Date.now();
    const soldAt = args.soldAt ?? now;
    if (!Number.isFinite(soldAt) || soldAt > now) {
      throw new ConvexError("Tanggal penjualan tidak valid.");
    }
    const lines = await Promise.all(
      args.lines.map(async (line) => {
        if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
          throw new ConvexError("Jumlah produk harus lebih dari nol.");
        }
        const product = await ctx.db.get(line.productId);
        if (
          !product ||
          product.storeId !== access.store._id ||
          product.status !== "active"
        ) {
          throw new ConvexError("Produk tidak ditemukan atau sudah nonaktif.");
        }
        const unit = await ctx.db.get(product.baseUnitId);
        if (!unit) throw new ConvexError("Satuan produk tidak ditemukan.");
        const inventory = await ctx.db
          .query("inventoryLevels")
          .withIndex("by_store_and_product", (q) =>
            q.eq("storeId", access.store._id).eq("productId", product._id),
          )
          .unique();
        const available = inventory?.quantity ?? 0;
        if (line.quantity > available) {
          throw new ConvexError(
            `Stok ${product.name} tidak cukup. Tersedia ${available}.`,
          );
        }
        return { ...line, product, unit, inventory, available };
      }),
    );
    const subtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.product.salePrice,
      0,
    );
    if (!Number.isFinite(subtotal)) {
      throw new ConvexError("Total penjualan tidak valid.");
    }
    const customerNameInput = args.customerName?.trim();
    const hasDebt = args.amountTendered < subtotal;
    if (hasDebt && (!args.customerId || !customerNameInput)) {
      throw new ConvexError("Pilih pelanggan yang memiliki nama sebelum mencatat hutang.");
    }

    const settings = await ctx.db
      .query("storeSettings")
      .withIndex("by_store", (q) => q.eq("storeId", access.store._id))
      .unique();
    if (!settings) throw new ConvexError("Pengaturan nomor transaksi belum tersedia.");
    const receiptNumber = `TRX-${new Date(now).getFullYear()}-${String(
      settings.nextSaleNumber,
    ).padStart(4, "0")}`;
    await ctx.db.patch(settings._id, {
      nextSaleNumber: settings.nextSaleNumber + 1,
      updatedAt: now,
    });

    let customerId: typeof args.customerId;
    let customerName = args.customerName?.trim() || "Pelanggan umum";
    if (args.customerId) {
      const customer = await ctx.db.get(args.customerId);
      if (!customer || customer.storeId !== access.store._id || customer.status !== "active") {
        throw new ConvexError("Pelanggan tidak ditemukan atau sudah nonaktif.");
      }
      customerId = customer._id;
      customerName = customer.name;
    }
    const saleId = await ctx.db.insert("sales", {
      storeId: access.store._id,
      receiptNumber,
      cashierId: access.userId,
      customerId,
      customerName,
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: subtotal,
      amountPaid: Math.min(args.amountTendered, subtotal),
      changeAmount: Math.max(args.amountTendered - subtotal, 0),
      paymentStatus: args.amountTendered >= subtotal ? "paid" : args.amountTendered > 0 ? "partial" : "unpaid",
      status: "completed",
      note: args.note?.trim() || undefined,
      soldAt,
      updatedAt: now,
    });

    for (const line of lines) {
      const lineTotal = line.quantity * line.product.salePrice;
      await ctx.db.insert("saleItems", {
        storeId: access.store._id,
        saleId,
        productId: line.product._id,
        productName: line.product.name,
        sku: line.product.sku,
        unitId: line.unit._id,
        unitName: line.unit.abbreviation,
        quantity: line.quantity,
        baseQuantity: line.quantity,
        unitPrice: line.product.salePrice,
        unitCost: line.product.purchasePrice,
        discountAmount: 0,
        lineTotal,
      });
      const after = line.available - line.quantity;
      if (line.inventory) {
        await ctx.db.patch(line.inventory._id, { quantity: after, updatedAt: now });
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
        type: "sale",
        quantityChange: -line.quantity,
        quantityBefore: line.available,
        quantityAfter: after,
        referenceType: "sale",
        referenceId: saleId,
        performedBy: access.userId,
        createdAt: now,
      });
    }
    if (args.amountTendered > 0) {
      await ctx.db.insert("salePayments", {
        storeId: access.store._id,
        saleId,
        method: args.method,
        amount: Math.min(args.amountTendered, subtotal),
        paidAt: now,
        receivedBy: access.userId,
      });
    }
    return receiptNumber;
  },
});

export const update = mutation({
  args: {
    saleId: v.id("sales"),
    customerName: v.string(),
    note: v.optional(v.string()),
    soldAt: v.number(),
    items: v.array(
      v.object({
        saleItemId: v.id("saleItems"),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.storeId !== access.store._id) {
      throw new ConvexError("Transaksi tidak ditemukan.");
    }
    if (sale.status !== "completed") {
      throw new ConvexError("Transaksi yang dibatalkan tidak dapat diubah.");
    }
    if (!args.customerName.trim() || args.items.length === 0) {
      throw new ConvexError("Pelanggan dan minimal satu barang wajib diisi.");
    }
    if (!Number.isFinite(args.soldAt)) {
      throw new ConvexError("Tanggal transaksi tidak valid.");
    }

    const existingItems = await ctx.db
      .query("saleItems")
      .withIndex("by_sale", (q) => q.eq("saleId", sale._id))
      .take(200);
    if (
      existingItems.length !== args.items.length ||
      args.items.some((item) => !existingItems.some((old) => old._id === item.saleItemId))
    ) {
      throw new ConvexError("Daftar barang transaksi berubah. Muat ulang riwayat.");
    }

    let subtotal = 0;
    const now = Date.now();
    for (const input of args.items) {
      const item = existingItems.find((old) => old._id === input.saleItemId);
      if (
        !item ||
        !input.productName.trim() ||
        !Number.isFinite(input.quantity) ||
        !Number.isFinite(input.unitPrice) ||
        input.quantity <= 0 ||
        input.unitPrice < 0
      ) {
        throw new ConvexError("Periksa nama, jumlah, dan harga barang.");
      }
      const lineTotal = input.quantity * input.unitPrice;
      subtotal += lineTotal;
      const productId = item.productId;
      if (productId && item.baseQuantity !== input.quantity) {
        const inventory = await ctx.db
          .query("inventoryLevels")
          .withIndex("by_store_and_product", (q) =>
            q.eq("storeId", access.store._id).eq("productId", productId),
          )
          .unique();
        const before = inventory?.quantity ?? 0;
        const after = before + item.baseQuantity - input.quantity;
        if (after < 0) {
          throw new ConvexError(
            `Stok tidak cukup untuk mengubah jumlah ${input.productName}.`,
          );
        }
        if (inventory) {
          await ctx.db.patch(inventory._id, { quantity: after, updatedAt: now });
        } else {
          await ctx.db.insert("inventoryLevels", {
            storeId: access.store._id,
            productId,
            quantity: after,
            updatedAt: now,
          });
        }
        await ctx.db.insert("inventoryMovements", {
          storeId: access.store._id,
          productId,
          type: "adjustment",
          quantityChange: item.baseQuantity - input.quantity,
          quantityBefore: before,
          quantityAfter: after,
          referenceType: "sale",
          referenceId: sale._id,
          note: "Penyesuaian dari edit riwayat penjualan",
          performedBy: access.userId,
          createdAt: now,
        });
      }
      await ctx.db.patch(item._id, {
        productName: input.productName.trim(),
        quantity: input.quantity,
        baseQuantity: input.quantity,
        unitPrice: input.unitPrice,
        lineTotal,
      });
    }
    if (!Number.isFinite(subtotal)) {
      throw new ConvexError("Total transaksi melebihi batas yang didukung.");
    }
    const payments = await ctx.db
      .query("salePayments")
      .withIndex("by_sale", (q) => q.eq("saleId", sale._id))
      .take(200);
    const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    await ctx.db.patch(sale._id, {
      customerName: args.customerName.trim(),
      note: args.note?.trim() || undefined,
      soldAt: args.soldAt,
      subtotal,
      totalAmount: subtotal,
      amountPaid,
      changeAmount: Math.max(0, amountPaid - subtotal),
      paymentStatus:
        amountPaid >= subtotal ? "paid" : amountPaid > 0 ? "partial" : "unpaid",
      updatedAt: now,
    });
    return null;
  },
});
