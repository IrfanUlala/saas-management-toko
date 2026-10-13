import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Context = QueryCtx | MutationCtx;

export async function getCurrentStoreAccess(ctx: Context) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const ownedStore = await ctx.db
    .query("stores")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .unique();

  if (ownedStore) {
    if (ownedStore.status !== "active") return null;
    return { store: ownedStore, userId, role: "owner" as const };
  }

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(20);
  const membership = memberships.find((item) => item.status === "active");
  if (!membership) return null;

  const store = await ctx.db.get(membership.storeId);
  if (!store || store.status !== "active") return null;
  return { store, userId, role: membership.role };
}

export async function requireStore(ctx: Context) {
  const access = await getCurrentStoreAccess(ctx);
  if (!access) throw new ConvexError("Toko belum tersedia.");
  return access;
}

export async function requireStoreManager(ctx: Context) {
  const access = await requireStore(ctx);
  if (!["owner", "admin", "manager", "inventory"].includes(access.role)) {
    throw new ConvexError("Anda tidak memiliki izin mengelola data toko.");
  }
  return access;
}
