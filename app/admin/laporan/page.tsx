"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { CreditCard, Download } from "lucide-react";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

const currency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const day = (value: number) => new Date(value).toLocaleDateString("id-ID");
const dateInputValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const tabs = ["Penjualan", "Per pelanggan", "Pembelian", "Hutang piutang", "Stok", "Pengeluaran"] as const;
type Tab = (typeof tabs)[number];

export default function ReportsPage() {
  return <CatalogStoreGate><ReportsContent /></CatalogStoreGate>;
}

function ReportsContent() {
  const today = new Date();
  const [from, setFrom] = useState(dateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(dateInputValue(today));
  const [tab, setTab] = useState<Tab>("Penjualan");
  const [debtFilter, setDebtFilter] = useState<"all" | "payable" | "receivable">("all");
  const data = useQuery(api.reports.overview, { from: new Date(`${from}T00:00:00`).getTime(), through: new Date(`${to}T23:59:59.999`).getTime() });
  const recordPayment = useMutation(api.debtPayments.record);
  const [paymentTarget, setPaymentTarget] = useState<{ kind: "payable" | "receivable"; recordId: Id<"purchases"> | Id<"sales">; reference: string; remaining: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentError, setPaymentError] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const customerTotals = useMemo(() => {
    const totals = new Map<string, { count: number; amount: number }>();
    for (const sale of data?.sales ?? []) { const name = sale.customerName || "Pelanggan umum"; const current = totals.get(name) ?? { count: 0, amount: 0 }; totals.set(name, { count: current.count + 1, amount: current.amount + sale.totalAmount }); }
    return [...totals.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.amount - a.amount);
  }, [data?.sales]);
  const salesTotal = (data?.sales ?? []).reduce((sum, sale) => sum + sale.totalAmount, 0);
  const purchaseTotal = (data?.purchases ?? []).reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const expenseTotal = (data?.expenses ?? []).reduce((sum, expense) => sum + expense.amount, 0);
  const debtTotal = (data?.purchases ?? []).reduce((sum, purchase) => sum + Math.max(0, purchase.totalAmount - purchase.amountPaid), 0);
  const receivableTotal = (data?.sales ?? []).reduce((sum, sale) => sum + Math.max(0, sale.totalAmount - sale.amountPaid), 0);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paymentTarget) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > paymentTarget.remaining) {
      setPaymentError("Masukkan pembayaran lebih dari nol dan tidak melebihi sisa tagihan.");
      return;
    }
    setSavingPayment(true);
    setPaymentError("");
    try {
      await recordPayment({ kind: paymentTarget.kind, recordId: paymentTarget.recordId, amount, method: paymentMethod as "cash" | "bankTransfer" | "debitCard" | "creditCard" | "qris" | "eWallet" | "other", reference: paymentTarget.reference });
      setPaymentTarget(null);
      setPaymentAmount("");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Pembayaran gagal disimpan.");
    } finally {
      setSavingPayment(false);
    }
  }

  function exportCsv() {
    let rows: (string | number)[][] = [];
    if (tab === "Penjualan") rows = [["Tanggal", "No. transaksi", "Pelanggan", "Total", "Dibayar"], ...(data?.sales ?? []).map((s) => [day(s.soldAt), s.receiptNumber, s.customerName ?? "Pelanggan umum", s.totalAmount, s.amountPaid])];
    else if (tab === "Per pelanggan") rows = [["Pelanggan", "Jumlah transaksi", "Total penjualan"], ...customerTotals.map((c) => [c.name, c.count, c.amount])];
    else if (tab === "Pembelian") rows = [["Tanggal", "No. pembelian", "Vendor", "Total", "Dibayar"], ...(data?.purchases ?? []).map((p) => [day(p.purchasedAt), p.purchaseNumber, p.vendorName, p.totalAmount, p.amountPaid])];
    else if (tab === "Hutang piutang") rows = [["Jenis", "Tanggal", "Referensi", "Nama", "Sisa"], ...(data?.purchases ?? []).filter((p) => debtFilter !== "receivable" && (p.totalAmount > p.amountPaid || debtFilter === "all")).map((p) => ["Hutang", day(p.purchasedAt), p.purchaseNumber, p.vendorName, Math.max(0, p.totalAmount - p.amountPaid)]), ...(data?.sales ?? []).filter((s) => s.status === "completed" && debtFilter !== "payable" && (s.totalAmount > s.amountPaid || debtFilter === "all")).map((s) => ["Piutang", day(s.soldAt), s.receiptNumber, s.customerName ?? "Pelanggan umum", Math.max(0, s.totalAmount - s.amountPaid)])];
    else if (tab === "Stok") rows = [["Produk", "SKU", "Jumlah stok"], ...(data?.stock ?? []).map(({ product, quantity }) => [product.name, product.sku, quantity])];
    else rows = [["Tanggal", "Pengeluaran", "Jumlah"], ...(data?.expenses ?? []).map((e) => [day(e.incurredAt), e.title, e.amount])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `laporan-${tab.toLowerCase().replaceAll(" ", "-")}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  const cards: [string, string][] = tab === "Penjualan" ? [["Total penjualan", currency(salesTotal)], ["Transaksi", String(data?.sales.length ?? 0)], ["Rata-rata transaksi", currency((data?.sales.length ?? 0) ? salesTotal / data!.sales.length : 0)]] : tab === "Pembelian" ? [["Total pembelian", currency(purchaseTotal)], ["Transaksi", String(data?.purchases.length ?? 0)], ["Belum dibayar", currency(debtTotal)]] : tab === "Hutang piutang" ? [["Hutang vendor", currency(debtTotal)], ["Piutang pelanggan", currency(receivableTotal)]] : tab === "Pengeluaran" ? [["Total pengeluaran", currency(expenseTotal)], ["Jumlah transaksi", String(data?.expenses.length ?? 0)]] : tab === "Stok" ? [["Jenis produk", String(data?.stock.length ?? 0)], ["Jumlah unit", String((data?.stock ?? []).reduce((sum, row) => sum + row.quantity, 0))], ["Stok menipis", String((data?.stock ?? []).filter(({ product, quantity }) => quantity <= product.lowStockThreshold).length)]] : [["Pelanggan", String(customerTotals.length)], ["Total penjualan", currency(salesTotal)], ["Transaksi", String(data?.sales.length ?? 0)]];
  const isDebtTab = tab === "Hutang piutang";
  const tableRows: { key: string; cells: (string | number)[]; payment?: { kind: "payable" | "receivable"; recordId: Id<"purchases"> | Id<"sales">; reference: string; remaining: number } }[] = !data ? [] : tab === "Penjualan" ? data.sales.map((s) => ({ key: s._id, cells: [day(s.soldAt), s.receiptNumber, s.customerName ?? "Pelanggan umum", currency(s.totalAmount)] })) : tab === "Per pelanggan" ? customerTotals.map((c) => ({ key: c.name, cells: [c.name, c.count, currency(c.amount)] })) : tab === "Pembelian" ? data.purchases.map((p) => ({ key: p._id, cells: [day(p.purchasedAt), p.purchaseNumber, p.vendorName, currency(p.totalAmount)] })) : tab === "Stok" ? data.stock.map(({ product, quantity }) => ({ key: product._id, cells: [product.name, product.sku, quantity, quantity <= product.lowStockThreshold ? "Menipis" : "Aman"] })) : tab === "Pengeluaran" ? data.expenses.map((e) => ({ key: e._id, cells: [day(e.incurredAt), e.title, currency(e.amount)] })) : [...data.purchases.filter((p) => debtFilter !== "receivable" && (p.totalAmount > p.amountPaid || debtFilter === "all")).map((p) => ({ key: p._id, cells: ["Hutang", p.purchaseNumber, p.vendorName, currency(Math.max(0, p.totalAmount - p.amountPaid))], payment: p.totalAmount > p.amountPaid ? { kind: "payable" as const, recordId: p._id, reference: p.purchaseNumber, remaining: p.totalAmount - p.amountPaid } : undefined })), ...data.sales.filter((s) => s.status === "completed" && debtFilter !== "payable" && (s.totalAmount > s.amountPaid || debtFilter === "all")).map((s) => ({ key: s._id, cells: ["Piutang", s.receiptNumber, s.customerName ?? "Pelanggan umum", currency(Math.max(0, s.totalAmount - s.amountPaid))], payment: s.totalAmount > s.amountPaid ? { kind: "receivable" as const, recordId: s._id, reference: s.receiptNumber, remaining: s.totalAmount - s.amountPaid } : undefined }))];
  const headers = tab === "Penjualan" ? ["Tanggal", "No. transaksi", "Pelanggan", "Total"] : tab === "Per pelanggan" ? ["Pelanggan", "Transaksi", "Total penjualan"] : tab === "Pembelian" ? ["Tanggal", "No. pembelian", "Vendor", "Total"] : tab === "Stok" ? ["Produk", "SKU", "Stok", "Status"] : tab === "Pengeluaran" ? ["Tanggal", "Pengeluaran", "Jumlah"] : isDebtTab ? ["Jenis", "Referensi", "Nama", "Sisa", "Aksi"] : ["Tanggal", "Pengeluaran", "Jumlah"];

  return <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
    <header><h1 className="text-2xl font-bold">Laporan</h1><p className="mt-1 text-sm text-gray-500">Pantau kinerja toko berdasarkan periode yang dipilih.</p></header>
    <section className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4 shadow-sm"><label className="space-y-1 text-sm">Dari<Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label><label className="space-y-1 text-sm">Sampai<Input type="date" value={to} min={from} max={today.toISOString().slice(0, 10)} onChange={(e) => setTo(e.target.value)} /></label><Button type="button" variant="outline" onClick={exportCsv} disabled={!data}><Download size={16} className="mr-2"/>Ekspor CSV</Button></section>
    <div className="flex gap-2 overflow-x-auto pb-1">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${tab === item ? "bg-primary text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}>{item}</button>)}</div>
    {isDebtTab && <nav aria-label="Filter hutang piutang" className="flex gap-2">{([{ value: "all", label: "Semua" }, { value: "payable", label: "Hutang" }, { value: "receivable", label: "Piutang" }] as const).map((item) => <button key={item.value} type="button" onClick={() => setDebtFilter(item.value)} className={`rounded-full px-4 py-2 text-sm font-medium ${debtFilter === item.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}>{item.label}</button>)}</nav>}
    {!data ? <div className="rounded-xl border bg-white p-10 text-center text-gray-500">Memuat laporan…</div> : <><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}</section><section className="overflow-hidden rounded-xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap p-3">{header}</th>)}</tr></thead><tbody className="divide-y">{tableRows.map((row) => <tr key={row.key}>{row.cells.map((cell, index) => <td key={index} className="whitespace-nowrap p-3">{tab === "Stok" && index === 0 ? <Link className="font-medium text-primary hover:underline" href={`/admin/laporan/stok/${row.key}`}>{cell}</Link> : cell}</td>)}{isDebtTab && <td className="p-3">{row.payment && <Button type="button" size="sm" variant="outline" onClick={() => { setPaymentTarget(row.payment!); setPaymentAmount(String(row.payment!.remaining)); setPaymentError(""); }}><CreditCard size={14} className="mr-1.5"/>Bayar</Button>}</td>}</tr>)}</tbody></table>{!tableRows.length && <p className="p-8 text-center text-sm text-gray-500">Tidak ada data pada periode ini.</p>}</div></section></>}
    {paymentTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={submitPayment} className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl"><div><h2 className="text-lg font-semibold">Catat pembayaran {paymentTarget.kind === "payable" ? "hutang" : "piutang"}</h2><p className="mt-1 text-sm text-gray-500">{paymentTarget.reference} · Sisa {currency(paymentTarget.remaining)}</p></div><label className="block space-y-1 text-sm">Nominal pembayaran<Input type="number" min="1" max={paymentTarget.remaining} step="1" required value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label><label className="block space-y-1 text-sm">Metode pembayaran<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3"><option value="cash">Tunai</option><option value="bankTransfer">Transfer bank</option><option value="debitCard">Kartu debit</option><option value="creditCard">Kartu kredit</option><option value="qris">QRIS</option><option value="eWallet">Dompet digital</option><option value="other">Lainnya</option></select></label>{paymentError && <p role="alert" className="text-sm text-red-600">{paymentError}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={savingPayment} onClick={() => setPaymentTarget(null)}>Batal</Button><Button type="submit" disabled={savingPayment}>{savingPayment ? "Menyimpan…" : "Simpan pembayaran"}</Button></div></form></div>}
  </main>;
}
