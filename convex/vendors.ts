import { ConvexError, v } from "convex/values";
import schema from "./schema";
import { mutation, query } from "./_generated/server";
import { requireStoreManager } from "./lib/access";

export const list = query({
  args: {},
  returns: v.array(schema.doc("vendors")),
  handler: async (ctx) => {
    const access = await requireStoreManager(ctx);
    return await ctx.db
      .query("vendors")
      .withIndex("by_store_and_status", (q) =>
        q.eq("storeId", access.store._id).eq("status", "active"),
      )
      .take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    contact: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.id("vendors"),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const name = args.name.trim();
    if (!name || name.length > 80) {
      throw new ConvexError("Nama vendor harus terdiri dari 1–80 karakter.");
    }
    const contact = args.contact?.trim();
    const note = args.note?.trim();
    if ((contact?.length ?? 0) > 80 || (note?.length ?? 0) > 120) {
      throw new ConvexError("Kontak maksimal 80 dan catatan maksimal 120 karakter.");
    }
    const duplicate = await ctx.db
      .query("vendors")
      .withIndex("by_store_and_normalized_name", (q) =>
        q
          .eq("storeId", access.store._id)
          .eq("normalizedName", name.toLowerCase()),
      )
      .first();
    if (duplicate?.status === "active") {
      throw new ConvexError("Nama vendor sudah digunakan.");
    }

    const now = Date.now();
    if (duplicate) {
      await ctx.db.patch(duplicate._id, {
        name,
        normalizedName: name.toLowerCase(),
        phone: contact,
        note,
        status: "active",
        updatedAt: now,
      });
      return duplicate._id;
    }
    return await ctx.db.insert("vendors", {
      storeId: access.store._id,
      name,
      normalizedName: name.toLowerCase(),
      phone: contact,
      note,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    vendorId: v.id("vendors"),
    name: v.string(),
    contact: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor || vendor.storeId !== access.store._id) {
      throw new ConvexError("Vendor tidak ditemukan.");
    }
    const name = args.name.trim();
    const contact = args.contact?.trim();
    const note = args.note?.trim();
    if (!name || name.length > 80) {
      throw new ConvexError("Nama vendor harus terdiri dari 1–80 karakter.");
    }
    if ((contact?.length ?? 0) > 80 || (note?.length ?? 0) > 120) {
      throw new ConvexError("Kontak maksimal 80 dan catatan maksimal 120 karakter.");
    }
    const duplicate = await ctx.db
      .query("vendors")
      .withIndex("by_store_and_normalized_name", (q) =>
        q
          .eq("storeId", access.store._id)
          .eq("normalizedName", name.toLowerCase()),
      )
      .first();
    if (duplicate && duplicate._id !== vendor._id) {
      throw new ConvexError("Nama vendor sudah digunakan.");
    }
    await ctx.db.patch(vendor._id, {
      name,
      normalizedName: name.toLowerCase(),
      phone: contact,
      note,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deactivate = mutation({
  args: { vendorId: v.id("vendors") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor || vendor.storeId !== access.store._id) {
      throw new ConvexError("Vendor tidak ditemukan.");
    }
    await ctx.db.patch(vendor._id, {
      status: "inactive",
      updatedAt: Date.now(),
    });
    return null;
  },
});
