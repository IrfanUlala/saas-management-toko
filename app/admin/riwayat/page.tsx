"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Transaction = {
  id: string;
  date: string;
  customer: string;
  paymentMethod: string;
  status: "Lunas" | "Belum lunas";
  note: string;
  items: { name: string; quantity: number; price: number }[];
};

const storageKey = "toman-sales-transactions-v1";
const initialTransactions: Transaction[] = [
  { id: "TRX-2026-0018", date: "2026-10-08T13:42", customer: "Pelanggan umum", paymentMethod: "Tunai", status: "Lunas", note: "", items: [{ name: "Kecap manis 135 ml", quantity: 2, price: 8500 }, { name: "Mi instan goreng", quantity: 4, price: 3500 }] },
  { id: "TRX-2026-0017", date: "2026-10-08T11:16", customer: "Pelanggan umum", paymentMethod: "QRIS", status: "Lunas", note: "", items: [{ name: "Minyak goreng 1 L", quantity: 1, price: 18000 }] },
  { id: "TRX-2026-0016", date: "2026-10-07T16:04", customer: "Rina", paymentMethod: "Tunai", status: "Belum lunas", note: "Sisa dibayar saat ambil barang", items: [{ name: "Beras 5 kg", quantity: 2, price: 72000 }] },
];
const currency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const total = (transaction: Transaction) => transaction.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

function readTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Transaction[];
    }
  } catch {
    // Keep the sample history if browser storage is unavailable.
  }
  return initialTransactions;
}

export default function RiwayatTransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setTransactions(readTransactions());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function updateTransaction<K extends keyof Transaction>(key: K, value: Transaction[K]) {
    setEditing((current) => current ? { ...current, [key]: value } : current);
  }

  function updateItem(index: number, key: "name" | "quantity" | "price", value: string) {
    setEditing((current) => current ? {
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index
        ? { ...item, [key]: key === "name" ? value : Math.max(0, Number(value)) }
        : item),
    } : current);
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const cleanItems = editing.items.map((item) => ({ ...item, name: item.name.trim() }));
    if (!editing.customer.trim() || cleanItems.length === 0 || cleanItems.some((item) => !item.name || item.quantity <= 0 || item.price < 0)) {
      setError("Isi pelanggan dan pastikan setiap barang memiliki nama, jumlah di atas 0, serta harga yang valid.");
      return;
    }
    const next = transactions.map((transaction) => transaction.id === editing.id
      ? { ...editing, customer: editing.customer.trim(), items: cleanItems }
      : transaction);
    setTransactions(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setEditing(null);
    setError("");
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return transactions.filter((transaction) => `${transaction.id} ${transaction.customer} ${transaction.paymentMethod} ${transaction.status} ${transaction.items.map((item) => item.name).join(" ")}`.toLowerCase().includes(term))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, query]);
  const totalSales = filtered.reduce((sum, transaction) => sum + total(transaction), 0);

  useEffect(() => {
    if (!editing) return;
    const bodyOverflow = document.body.style.overflow;
    const documentOverflow = document.documentElement.style.overflow;
    const bodyPosition = document.body.style.position;
    const bodyTop = document.body.style.top;
    const bodyWidth = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.body.style.position = bodyPosition;
      document.body.style.top = bodyTop;
      document.body.style.width = bodyWidth;
      document.documentElement.style.overflow = documentOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [editing]);

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <p className="text-sm font-medium text-blue-600">TRANSAKSI</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Riwayat penjualan</h1>
        <p className="mt-1 text-sm text-gray-500">Lihat dan perbarui detail transaksi penjualan.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Jumlah transaksi</p><p className="mt-1 text-xl font-semibold">{filtered.length}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Total penjualan</p><p className="mt-1 text-xl font-semibold">{currency(totalSales)}</p></div>
      </div>

      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/><Input aria-label="Cari transaksi" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ID, pelanggan, barang, atau pembayaran" className="h-11 border-gray-200 pl-9 shadow-none"/></div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4"><h2 className="font-semibold">Daftar transaksi</h2><p className="mt-1 text-sm text-gray-500">{filtered.length} transaksi ditemukan</p></div>
        {filtered.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">Transaksi tidak ditemukan.</p> : <div className="overflow-x-auto"><table className="w-full min-w-180 text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>{["ID transaksi", "Tanggal", "Pelanggan", "Barang", "Total", "Status", "Aksi"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((transaction) => <tr key={transaction.id} className="hover:bg-gray-50/70"><td className="px-4 py-3 font-medium">{transaction.id}</td><td className="px-4 py-3">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(transaction.date))}</td><td className="px-4 py-3">{transaction.customer}</td><td className="px-4 py-3">{transaction.items.reduce((sum, item) => sum + item.quantity, 0)} item</td><td className="px-4 py-3 font-medium">{currency(total(transaction))}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${transaction.status === "Lunas" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{transaction.status}</span></td><td className="px-4 py-3"><Button type="button" variant="outline" size="sm" onClick={() => { setEditing({ ...transaction, items: transaction.items.map((item) => ({ ...item })) }); setError(""); }}><Pencil size={14} className="mr-1.5"/>Edit</Button></td></tr>)}</tbody></table></div>}
      </div>

      {editing && typeof document !== "undefined" && createPortal(<div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-black/50 p-3 pt-6 sm:p-6 sm:pt-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="edit-transaction-title" className="my-0 mb-6 max-h-[calc(100dvh-3rem)] w-full max-w-2xl space-y-5 overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:mb-8 sm:max-h-[calc(100dvh-4rem)] md:p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="edit-transaction-title" className="text-lg font-semibold">Edit transaksi</h2><p className="mt-1 text-sm text-gray-500">{editing.id}</p></div><Button type="button" variant="ghost" size="sm" aria-label="Tutup" onClick={() => setEditing(null)}><X size={18}/></Button></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Tanggal dan waktu<Input type="datetime-local" required value={editing.date} onChange={(event) => updateTransaction("date", event.target.value)}/></label><label className="space-y-1.5 text-sm font-medium">Pelanggan<Input required value={editing.customer} onChange={(event) => updateTransaction("customer", event.target.value)} maxLength={100}/></label><label className="space-y-1.5 text-sm font-medium">Metode pembayaran<select value={editing.paymentMethod} onChange={(event) => updateTransaction("paymentMethod", event.target.value)} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 font-normal"><option>Tunai</option><option>QRIS</option><option>Kartu debit</option><option>Transfer bank</option><option>Lainnya</option></select></label><label className="space-y-1.5 text-sm font-medium">Status pembayaran<select value={editing.status} onChange={(event) => updateTransaction("status", event.target.value as Transaction["status"])} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 font-normal"><option>Lunas</option><option>Belum lunas</option></select></label><label className="space-y-1.5 text-sm font-medium sm:col-span-2">Catatan<Input value={editing.note} onChange={(event) => updateTransaction("note", event.target.value)} placeholder="Catatan transaksi" maxLength={250}/></label></div>
        <div className="space-y-3"><h3 className="font-semibold">Barang dalam transaksi</h3>{editing.items.map((item, index) => <div key={`${editing.id}-${index}`} className="grid gap-3 rounded-lg border border-gray-100 p-3 sm:grid-cols-[minmax(0,1fr)_100px_140px]"><label className="space-y-1 text-xs font-medium text-gray-600">Nama barang<Input required value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} maxLength={100}/></label><label className="space-y-1 text-xs font-medium text-gray-600">Jumlah<Input required type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)}/></label><label className="space-y-1 text-xs font-medium text-gray-600">Harga satuan<Input required type="number" min="0" step="1" value={item.price} onChange={(event) => updateItem(index, "price", event.target.value)}/></label></div>)}</div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4"><span className="text-sm text-gray-500">Total transaksi</span><span className="text-lg font-semibold">{currency(total(editing))}</span></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Batal</Button><Button type="submit">Simpan perubahan</Button></div>
      </form></div>, document.body)}
    </section>
  );
}
