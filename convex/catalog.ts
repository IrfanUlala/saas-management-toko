import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import schema from "./schema";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

async function getCurrentStoreAccess(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(20);

  const ownedStore = await ctx.db
    .query("stores")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .unique();
  if (ownedStore) {
    const ownerMembership = memberships.find(
      (item) => item.storeId === ownedStore._id,
    );
    if (
      ownedStore.status === "active" &&
      (!ownerMembership || ownerMembership.status === "active")
    ) {
      return { store: ownedStore, role: "owner" as const };
    }
    return null;
  }

  const membership = memberships.find((item) => item.status === "active");
  if (membership) {
    const store = await ctx.db.get(membership.storeId);
    if (store?.status === "active") {
      return { store, role: membership.role };
    }
  }
  return null;
}

async function requireCatalogManager(ctx: QueryCtx | MutationCtx) {
  const access = await getCurrentStoreAccess(ctx);
  if (!access) {
    throw new ConvexError("Toko belum tersedia.");
  }
  if (!["owner", "admin", "manager", "inventory"].includes(access.role)) {
    throw new ConvexError("Anda tidak memiliki izin mengelola katalog.");
  }
  return access.store;
}

export const currentStore = query({
  args: {},
  returns: v.union(schema.doc("stores"), v.null()),
  handler: async (ctx) => {
    const access = await getCurrentStoreAccess(ctx);
    return access?.store ?? null;
  },
});

export const createStore = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("stores"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Silakan masuk terlebih dahulu.");
    }

    const existingStore = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .unique();
    if (existingStore) {
      return existingStore._id;
    }

    const name = args.name.trim();
    if (name.length < 2 || name.length > 80) {
      throw new ConvexError("Nama toko harus terdiri dari 2–80 karakter.");
    }

    const now = Date.now();
    const storeId = await ctx.db.insert("stores", {
      ownerId: userId,
      name,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      storeId,
      userId,
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("storeSettings", {
      storeId,
      currencyCode: "IDR",
      timezone: "Asia/Jakarta",
      receiptPrefix: "INV",
      nextSaleNumber: 1,
      nextPurchaseNumber: 1,
      taxEnabled: false,
      taxRate: 0,
      updatedAt: now,
    });

    return storeId;
  },
});

export const listCategories = query({
  args: {},
  returns: v.array(schema.doc("categories")),
  handler: async (ctx) => {
    const access = await getCurrentStoreAccess(ctx);
    if (!access) return [];

    return await ctx.db
      .query("categories")
      .withIndex("by_store_and_name", (q) =>
        q.eq("storeId", access.store._id),
      )
      .take(200);
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    const store = await requireCatalogManager(ctx);

    const name = args.name.trim();
    const normalizedName = name.toLowerCase();
    const description = args.description?.trim();
    if (name.length < 1 || name.length > 60) {
      throw new ConvexError("Nama kategori harus terdiri dari 1–60 karakter.");
    }
    if (description && description.length > 120) {
      throw new ConvexError("Keterangan kategori maksimal 120 karakter.");
    }

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_store_and_normalized_name", (q) =>
        q.eq("storeId", store._id).eq("normalizedName", normalizedName),
      )
      .first();
    if (existing) {
      throw new ConvexError("Nama kategori sudah digunakan.");
    }

    const now = Date.now();
    return await ctx.db.insert("categories", {
      storeId: store._id,
      name,
      normalizedName,
      description: description || undefined,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const store = await requireCatalogManager(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.storeId !== store._id) {
      throw new ConvexError("Kategori tidak ditemukan.");
    }

    const name = args.name.trim();
    const normalizedName = name.toLowerCase();
    const description = args.description?.trim();
    if (name.length < 1 || name.length > 60) {
      throw new ConvexError("Nama kategori harus terdiri dari 1–60 karakter.");
    }
    if (description && description.length > 120) {
      throw new ConvexError("Keterangan kategori maksimal 120 karakter.");
    }

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_store_and_normalized_name", (q) =>
        q.eq("storeId", store._id).eq("normalizedName", normalizedName),
      )
      .first();
    if (existing && existing._id !== category._id) {
      throw new ConvexError("Nama kategori sudah digunakan.");
    }

    await ctx.db.patch(category._id, {
      name,
      normalizedName,
      description: description || undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setCategoryStatus = mutation({
  args: {
    categoryId: v.id("categories"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const store = await requireCatalogManager(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.storeId !== store._id) {
      throw new ConvexError("Kategori tidak ditemukan.");
    }

    await ctx.db.patch(category._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const listUnits = query({
  args: {},
  returns: v.array(schema.doc("units")),
  handler: async (ctx) => {
    const access = await getCurrentStoreAccess(ctx);
    if (!access) return [];

    return await ctx.db
      .query("units")
      .withIndex("by_store_and_abbreviation", (q) =>
        q.eq("storeId", access.store._id),
      )
      .take(200);
  },
});

export const createUnit = mutation({
  args: {
    name: v.string(),
    abbreviation: v.string(),
  },
  returns: v.id("units"),
  handler: async (ctx, args) => {
    const store = await requireCatalogManager(ctx);

    const name = args.name.trim();
    const abbreviation = args.abbreviation.trim();
    const normalizedAbbreviation = abbreviation.toLowerCase();
    if (name.length < 1 || name.length > 60) {
      throw new ConvexError("Nama satuan harus terdiri dari 1–60 karakter.");
    }
    if (abbreviation.length < 1 || abbreviation.length > 20) {
      throw new ConvexError("Singkatan satuan harus terdiri dari 1–20 karakter.");
    }

    const existing = await ctx.db
      .query("units")
      .withIndex("by_store_and_normalized_abbreviation", (q) =>
        q
          .eq("storeId", store._id)
          .eq("normalizedAbbreviation", normalizedAbbreviation),
      )
      .first();
    if (existing) {
      throw new ConvexError("Singkatan satuan sudah digunakan.");
    }

    const now = Date.now();
    return await ctx.db.insert("units", {
      storeId: store._id,
      name,
      abbreviation,
      normalizedAbbreviation,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateUnit = mutation({
  args: {
    unitId: v.id("units"),
    name: v.string(),
    abbreviation: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const store = await requireCatalogManager(ctx);

    const unit = await ctx.db.get(args.unitId);
    if (!unit || unit.storeId !== store._id) {
      throw new ConvexError("Satuan tidak ditemukan.");
    }

    const name = args.name.trim();
    const abbreviation = args.abbreviation.trim();
    const normalizedAbbreviation = abbreviation.toLowerCase();
    if (name.length < 1 || name.length > 60) {
      throw new ConvexError("Nama satuan harus terdiri dari 1–60 karakter.");
    }
    if (abbreviation.length < 1 || abbreviation.length > 20) {
      throw new ConvexError("Singkatan satuan harus terdiri dari 1–20 karakter.");
    }

    const existing = await ctx.db
      .query("units")
      .withIndex("by_store_and_normalized_abbreviation", (q) =>
        q
          .eq("storeId", store._id)
          .eq("normalizedAbbreviation", normalizedAbbreviation),
      )
      .first();
    if (existing && existing._id !== unit._id) {
      throw new ConvexError("Singkatan satuan sudah digunakan.");
    }

    await ctx.db.patch(unit._id, {
      name,
      abbreviation,
      normalizedAbbreviation,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setUnitStatus = mutation({
  args: {
    unitId: v.id("units"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const store = await requireCatalogManager(ctx);

    const unit = await ctx.db.get(args.unitId);
    if (!unit || unit.storeId !== store._id) {
      throw new ConvexError("Satuan tidak ditemukan.");
    }

    await ctx.db.patch(unit._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});
