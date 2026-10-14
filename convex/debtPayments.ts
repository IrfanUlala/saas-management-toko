import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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

export const record = mutation({
  args: {
    kind: v.union(v.literal("payable"), v.literal("receivable")),
    recordId: v.union(v.id("purchases"), v.id("sales")),
    amount: v.number(),
    method: paymentMethod,
    reference: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const access = await requireStoreManager(ctx);
    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      throw new ConvexError("Nominal pembayaran harus lebih dari nol.");
    }
    const now = Date.now();
    if (args.kind === "payable") {
      const purchase = await ctx.db.get(args.recordId as Id<"purchases">);
      if (!purchase || purchase.storeId !== access.store._id) {
        throw new ConvexError("Hutang tidak ditemukan.");
      }
      const remaining = purchase.totalAmount - purchase.amountPaid;
      if (remaining <= 0 || args.amount > remaining) {
        throw new ConvexError("Nominal pembayaran melebihi sisa hutang.");
      }
      const amountPaid = purchase.amountPaid + args.amount;
      await ctx.db.patch(purchase._id, {
        amountPaid,
        paymentStatus: amountPaid >= purchase.totalAmount ? "paid" : "partial",
        updatedAt: now,
      });
      await ctx.db.insert("purchasePayments", {
        storeId: access.store._id,
        purchaseId: purchase._id,
        method: args.method,
        amount: args.amount,
        reference: args.reference?.trim() || undefined,
        paidAt: now,
        recordedBy: access.userId,
      });
    } else {
      const sale = await ctx.db.get(args.recordId as Id<"sales">);
      if (!sale || sale.storeId !== access.store._id) {
        throw new ConvexError("Piutang tidak ditemukan.");
      }
      if (sale.status !== "completed") {
        throw new ConvexError("Piutang transaksi tidak aktif.");
      }
      const remaining = sale.totalAmount - sale.amountPaid;
      if (remaining <= 0 || args.amount > remaining) {
        throw new ConvexError("Nominal pembayaran melebihi sisa piutang.");
      }
      const amountPaid = sale.amountPaid + args.amount;
      await ctx.db.patch(sale._id, {
        amountPaid,
        paymentStatus: amountPaid >= sale.totalAmount ? "paid" : "partial",
        updatedAt: now,
      });
      await ctx.db.insert("salePayments", {
        storeId: access.store._id,
        saleId: sale._id,
        method: args.method,
        amount: args.amount,
        reference: args.reference?.trim() || undefined,
        paidAt: now,
        receivedBy: access.userId,
      });
    }
    return null;
  },
});
