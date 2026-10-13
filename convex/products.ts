import { ConvexError, v } from "convex/values";
import schema from "./schema";
import { mutation, query } from "./_generated/server";
import { requireStore, requireStoreManager } from "./lib/access";

const productWithReferences = v.object({
  product: schema.doc("products"),
  category: v.union(schema.doc("categories"), v.null()),
  unit: schema.doc("units"),
  stock: v.number(),
});

function validateProductInput(args: {
  sku: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  lowStockThreshold: number;
}) {
  if (!args.sku.trim() || args.sku.length > 40) {
    throw new ConvexError("Kode produk harus terdiri dari 1–40 karakter.");
  }
  if (!args.name.trim() || args.name.trim().length > 120) {
    throw new ConvexError("Nama produk harus terdiri dari 1–120 karakter.");
  }
  if (
    ![args.purchasePrice, args.salePrice, args.stock, args.lowStockThreshold].every(
      Number.isFinite,
    ) ||
    args.purchasePrice < 0 ||
    args.salePrice < 0 ||
    args.stock < 0 ||
    args.lowStockThreshold < 0
  ) {
    throw new ConvexError("Harga dan stok harus berupa angka positif atau nol.");
  }
}

export const list = query({
  args: {},
  returns: v.array(productWithReferences),
  handler: async (ctx) => {
    const access = await requireStore(ctx);
    const products = await ctx.db
      .query("products")
      .withIndex("by_store_and_status", (q) =>
        q.eq("storeId", access.store._id).eq("status", "active"),
      )
      .take(200);

    return await Promise.all(
      products.map(async (product) => {
        const [category, unit, inventory] = await Promise.all([
          product.categoryId ? ctx.db.get(product.categoryId) : null,
          ctx.db.get(product.baseUnitId),
          ctx.db
            .query("inventoryLevels")
            .withIndex("by_store_and_product", (q) =>
              q.eq("storeId", access.store._id).eq("productId", product._id),
            )
            .unique(),
        ]);
        if (!unit) throw new ConvexError("Satuan produk tidak ditemukan.");
        return { product, category, unit, stock: inventory?.quantity ?? 0 };
      }),
    );
  },
});

export const create = mutation({
  args: {
    sku: v.string(),
    barcode: v.optional(v.string()),
    name: v.string(),
    categoryId: v.optional(v.id("categories")),
    baseUnitId: v.id("units"),
    purchasePrice: v.number(),
    salePrice: v.number(),
    stock: v.number(),
    lowStockThreshold: v.number(),
    shelfLocation: v.optional(v.string()),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    validateProductInput(args);

    const sku = args.sku.trim();
    const existingSku = await ctx.db
      .query("products")
      .withIndex("by_store_and_sku", (q) =>
        q.eq("storeId", access.store._id).eq("sku", sku),
      )
      .first();
    if (existingSku) throw new ConvexError("Kode produk sudah digunakan.");

    const barcode = args.barcode?.trim() || undefined;
    if (barcode) {
      const existingBarcode = await ctx.db
        .query("products")
        .withIndex("by_store_and_barcode", (q) =>
          q.eq("storeId", access.store._id).eq("barcode", barcode),
        )
        .first();
      if (existingBarcode) throw new ConvexError("Barcode sudah digunakan.");
    }

    const unit = await ctx.db.get(args.baseUnitId);
    if (!unit || unit.storeId !== access.store._id || unit.status !== "active") {
      throw new ConvexError("Pilih satuan aktif dari toko ini.");
    }
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (
        !category ||
        category.storeId !== access.store._id ||
        category.status !== "active"
      ) {
        throw new ConvexError("Pilih kategori aktif dari toko ini.");
      }
    }

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      storeId: access.store._id,
      sku,
      barcode,
      name: args.name.trim(),
      categoryId: args.categoryId,
      baseUnitId: args.baseUnitId,
      purchasePrice: args.purchasePrice,
      salePrice: args.salePrice,
      lowStockThreshold: args.lowStockThreshold,
      shelfLocation: args.shelfLocation?.trim() || undefined,
      allowFractionalQuantity: false,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("inventoryLevels", {
      storeId: access.store._id,
      productId,
      quantity: args.stock,
      updatedAt: now,
    });
    if (args.stock > 0) {
      await ctx.db.insert("inventoryMovements", {
        storeId: access.store._id,
        productId,
        type: "openingBalance",
        quantityChange: args.stock,
        quantityBefore: 0,
        quantityAfter: args.stock,
        note: "Stok awal produk",
        performedBy: access.userId,
        createdAt: now,
      });
    }
    return productId;
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    sku: v.string(),
    barcode: v.optional(v.string()),
    name: v.string(),
    categoryId: v.optional(v.id("categories")),
    baseUnitId: v.id("units"),
    purchasePrice: v.number(),
    salePrice: v.number(),
    stock: v.number(),
    lowStockThreshold: v.number(),
    shelfLocation: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    validateProductInput(args);
    const product = await ctx.db.get(args.productId);
    if (!product || product.storeId !== access.store._id) {
      throw new ConvexError("Produk tidak ditemukan.");
    }

    const sku = args.sku.trim();
    const existingSku = await ctx.db
      .query("products")
      .withIndex("by_store_and_sku", (q) =>
        q.eq("storeId", access.store._id).eq("sku", sku),
      )
      .first();
    if (existingSku && existingSku._id !== product._id) {
      throw new ConvexError("Kode produk sudah digunakan.");
    }

    const barcode = args.barcode?.trim() || undefined;
    if (barcode) {
      const existingBarcode = await ctx.db
        .query("products")
        .withIndex("by_store_and_barcode", (q) =>
          q.eq("storeId", access.store._id).eq("barcode", barcode),
        )
        .first();
      if (existingBarcode && existingBarcode._id !== product._id) {
        throw new ConvexError("Barcode sudah digunakan.");
      }
    }

    const unit = await ctx.db.get(args.baseUnitId);
    if (
      !unit ||
      unit.storeId !== access.store._id ||
      (unit.status !== "active" && unit._id !== product.baseUnitId)
    ) {
      throw new ConvexError("Pilih satuan aktif dari toko ini.");
    }
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (
        !category ||
        category.storeId !== access.store._id ||
        (category.status !== "active" && category._id !== product.categoryId)
      ) {
        throw new ConvexError("Pilih kategori aktif dari toko ini.");
      }
    }

    const inventory = await ctx.db
      .query("inventoryLevels")
      .withIndex("by_store_and_product", (q) =>
        q.eq("storeId", access.store._id).eq("productId", product._id),
      )
      .unique();
    const quantityBefore = inventory?.quantity ?? 0;
    const now = Date.now();
    if (inventory) {
      await ctx.db.patch(inventory._id, { quantity: args.stock, updatedAt: now });
    } else {
      await ctx.db.insert("inventoryLevels", {
        storeId: access.store._id,
        productId: product._id,
        quantity: args.stock,
        updatedAt: now,
      });
    }
    if (args.stock !== quantityBefore) {
      await ctx.db.insert("inventoryMovements", {
        storeId: access.store._id,
        productId: product._id,
        type: "adjustment",
        quantityChange: args.stock - quantityBefore,
        quantityBefore,
        quantityAfter: args.stock,
        note: "Penyesuaian stok dari edit produk",
        performedBy: access.userId,
        createdAt: now,
      });
    }
    await ctx.db.patch(product._id, {
      sku,
      barcode,
      name: args.name.trim(),
      categoryId: args.categoryId,
      baseUnitId: args.baseUnitId,
      purchasePrice: args.purchasePrice,
      salePrice: args.salePrice,
      lowStockThreshold: args.lowStockThreshold,
      shelfLocation: args.shelfLocation?.trim() || undefined,
      updatedAt: now,
    });
    return null;
  },
});

export const deactivate = mutation({
  args: { productId: v.id("products") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product || product.storeId !== access.store._id) {
      throw new ConvexError("Produk tidak ditemukan.");
    }
    await ctx.db.patch(product._id, {
      status: "inactive",
      updatedAt: Date.now(),
    });
    return null;
  },
});
