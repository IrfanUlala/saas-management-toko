import { ConvexError, v } from "convex/values";
import schema from "./schema";
import { mutation, query } from "./_generated/server";
import { requireStore, requireStoreManager } from "./lib/access";

export const list = query({
  args: {},
  returns: v.array(schema.doc("customers")),
  handler: async (ctx) => {
    const access = await requireStore(ctx);
    return await ctx.db.query("customers")
      .withIndex("by_store_and_status", (q) => q.eq("storeId", access.store._id).eq("status", "active"))
      .take(500);
  },
});

export const create = mutation({
  args: { name: v.string(), phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()) },
  returns: v.id("customers"),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const name = args.name.trim();
    const phone = args.phone?.trim();
    const email = args.email?.trim();
    const address = args.address?.trim();
    if (!name || name.length > 120) throw new ConvexError("Nama pelanggan wajib diisi (maksimal 120 karakter).");
    if ((phone?.length ?? 0) > 40 || (email?.length ?? 0) > 120 || (address?.length ?? 0) > 500) throw new ConvexError("Periksa panjang nomor HP, email, atau alamat.");
    const now = Date.now();
    return await ctx.db.insert("customers", { storeId: access.store._id, name, phone: phone || undefined, email: email || undefined, address: address || undefined, status: "active", createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { customerId: v.id("customers"), name: v.string(), phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.storeId !== access.store._id) throw new ConvexError("Pelanggan tidak ditemukan.");
    const name = args.name.trim();
    const phone = args.phone?.trim();
    const email = args.email?.trim();
    const address = args.address?.trim();
    if (!name || name.length > 120) throw new ConvexError("Nama pelanggan wajib diisi (maksimal 120 karakter).");
    if ((phone?.length ?? 0) > 40 || (email?.length ?? 0) > 120 || (address?.length ?? 0) > 500) throw new ConvexError("Periksa panjang nomor HP, email, atau alamat.");
    await ctx.db.patch(customer._id, { name, phone: phone || undefined, email: email || undefined, address: address || undefined, updatedAt: Date.now() });
    return null;
  },
});

export const deactivate = mutation({
  args: { customerId: v.id("customers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.storeId !== access.store._id) throw new ConvexError("Pelanggan tidak ditemukan.");
    await ctx.db.patch(customer._id, { status: "inactive", updatedAt: Date.now() });
    return null;
  },
});
