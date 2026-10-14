"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Pencil, Printer, Search, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

type Transaction = {
  saleId: Id<"sales">;
  id: string;
  date: string;
  customer: string;
  paymentMethod: string;
  status: "Lunas" | "Belum lunas";
  note: string;
  items: {
    saleItemId: Id<"saleItems">;
    name: string;
    quantity: number;
    price: number;
  }[];
};

const currency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const total = (transaction: Transaction) =>
  transaction.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

function paymentLabel(method?: string) {
  switch (method) {
    case "cash":
      return "Tunai";
    case "qris":
      return "QRIS";
    case "debitCard":
      return "Kartu debit";
    case "creditCard":
      return "Kartu kredit";
    case "bankTransfer":
      return "Transfer bank";
    case "eWallet":
      return "Dompet digital";
    case "other":
      return "Lainnya";
    default:
      return "Belum dibayar";
  }
}

function localDateTime(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(
    timestamp - date.getTimezoneOffset() * 60_000,
  ).toISOString().slice(0, 16);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function printReceipt(transaction: Transaction) {
  const printWindow = window.open("", "_blank", "width=420,height=650");
  if (!printWindow) return;
  const rows = transaction.items.map((item) => `<tr><td>${escapeHtml(item.name)}<br>${item.quantity} × ${currency(item.price)}</td><td>${currency(item.quantity * item.price)}</td></tr>`).join("");
  printWindow.document.write(`<!doctype html><html><head><title>Struk ${escapeHtml(transaction.id)}</title><style>body{font:14px Arial,sans-serif;max-width:360px;margin:24px auto;color:#111}h1,p{text-align:center}table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px dashed #aaa}td:last-child{text-align:right}footer{margin-top:12px;text-align:right;font-weight:bold}@media print{body{margin:0 auto}}</style></head><body><h1>Struk Penjualan</h1><p>${escapeHtml(transaction.id)}<br>${escapeHtml(new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(transaction.date)))}</p><p>Pelanggan: ${escapeHtml(transaction.customer)}</p><table>${rows}</table><footer>Total: ${currency(total(transaction))}</footer><p>Pembayaran: ${escapeHtml(transaction.paymentMethod)}</p><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
  printWindow.document.close();
}

export default function RiwayatTransaksiPage() {
  return (
    <CatalogStoreGate>
      <SalesHistory />
    </CatalogStoreGate>
  );
}

function SalesHistory() {
  const { isAuthenticated } = useConvexAuth();
  const records = useQuery(api.sales.list, isAuthenticated ? {} : "skip");
  const updateSale = useMutation(api.sales.update);
  const transactions = useMemo(
    () =>
      (records ?? []).map(({ sale, items, payments }) => ({
        saleId: sale._id,
        id: sale.receiptNumber,
        date: localDateTime(sale.soldAt),
        customer: sale.customerName ?? "Pelanggan umum",
        paymentMethod: paymentLabel(payments[0]?.method),
        status:
          sale.paymentStatus === "paid"
            ? ("Lunas" as const)
            : ("Belum lunas" as const),
        note: sale.note ?? "",
        items: items.map((item) => ({
          saleItemId: item._id,
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
      })),
    [records],
  );
  const [query, setQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateTransaction<K extends keyof Transaction>(
    key: K,
    value: Transaction[K],
  ) {
    setEditing((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateItem(
    index: number,
    key: "name" | "quantity" | "price",
    value: string,
  ) {
    setEditing((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    [key]:
                      key === "name" ? value : Math.max(0, Number(value)),
                  }
                : item,
            ),
          }
        : current,
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const cleanItems = editing.items.map((item) => ({
      ...item,
      name: item.name.trim(),
    }));
    const soldAt = new Date(editing.date).getTime();
    if (
      !editing.customer.trim() ||
      !Number.isFinite(soldAt) ||
      cleanItems.length === 0 ||
      cleanItems.some(
        (item) =>
          !item.name ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.price) ||
          item.price < 0,
      )
    ) {
      setError(
        "Isi pelanggan, tanggal yang valid, dan pastikan setiap barang memiliki nama, jumlah di atas 0, serta harga yang valid.",
      );
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await updateSale({
        saleId: editing.saleId,
        customerName: editing.customer.trim(),
        note: editing.note.trim() || undefined,
        soldAt,
        items: cleanItems.map((item) => ({
          saleItemId: item.saleItemId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });
      setEditing(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Perubahan transaksi gagal disimpan.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const customers = useMemo(
    () => [...new Set(transactions.map((transaction) => transaction.customer))].sort((a, b) => a.localeCompare(b, "id")),
    [transactions],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return transactions
      .filter((transaction) => !customerFilter || transaction.customer === customerFilter)
      .filter((transaction) => !dateFilter || transaction.date.slice(0, 10) === dateFilter)
      .filter((transaction) =>
        `${transaction.id} ${transaction.customer} ${transaction.paymentMethod} ${transaction.status} ${transaction.items.map((item) => item.name).join(" ")}`
          .toLowerCase()
          .includes(term),
      )
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
  }, [transactions, query, customerFilter, dateFilter]);
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

  if (records === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-gray-500">
        Memuat riwayat penjualan...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <p className="text-sm font-medium text-blue-600">TRANSAKSI</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Riwayat penjualan
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Lihat dan perbarui detail transaksi penjualan.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard label="Jumlah transaksi" value={filtered.length} />
        <SummaryCard label="Total penjualan" value={currency(totalSales)} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            aria-label="Cari transaksi"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari ID, barang, atau pembayaran"
            className="h-11 border-gray-200 pl-9 shadow-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="shrink-0">Pelanggan</span>
          <select aria-label="Filter nama pelanggan" value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} className="h-11 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 font-normal">
            <option value="">Semua pelanggan</option>
            {customers.map((customer) => <option key={customer} value={customer}>{customer}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="shrink-0">Tanggal</span>
          <Input aria-label="Filter tanggal penjualan" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-11 min-w-0 border-gray-200 shadow-none" />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold">Daftar transaksi</h2>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} transaksi ditemukan
          </p>
        </div>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            {query
              ? "Transaksi tidak ditemukan."
              : "Belum ada transaksi penjualan."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {[
                    "ID transaksi",
                    "Tanggal",
                    "Pelanggan",
                    "Barang",
                    "Total",
                    "Status",
                    "Aksi",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((transaction) => (
                  <tr key={transaction.saleId} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-medium">{transaction.id}</td>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(transaction.date))}
                    </td>
                    <td className="px-4 py-3">{transaction.customer}</td>
                    <td className="px-4 py-3">
                      {transaction.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      item
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {currency(total(transaction))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          transaction.status === "Lunas"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => printReceipt(transaction)}>
                          <Printer size={14} className="mr-1.5" />
                          Cetak
                        </Button>
                        <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing({
                            ...transaction,
                            items: transaction.items.map((item) => ({ ...item })),
                          });
                          setError("");
                        }}
                      >
                        <Pencil size={14} className="mr-1.5" />
                        Edit
                      </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-start justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-black/50 p-3 pt-6 sm:p-6 sm:pt-8"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditing(null);
            }}
          >
            <form
              onSubmit={save}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-transaction-title"
              className="my-0 mb-6 max-h-[calc(100dvh-3rem)] w-full max-w-2xl space-y-5 overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:mb-8 sm:max-h-[calc(100dvh-4rem)] md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="edit-transaction-title" className="text-lg font-semibold">
                    Edit transaksi
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{editing.id}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Tutup"
                  onClick={() => setEditing(null)}
                >
                  <X size={18} />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium">
                  Tanggal dan waktu
                  <Input
                    type="datetime-local"
                    required
                    value={editing.date}
                    onChange={(event) =>
                      updateTransaction("date", event.target.value)
                    }
                  />
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Pelanggan
                  <Input
                    required
                    value={editing.customer}
                    onChange={(event) =>
                      updateTransaction("customer", event.target.value)
                    }
                    maxLength={100}
                  />
                </label>
                <div className="space-y-1.5 text-sm font-medium">
                  Metode pembayaran
                  <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-normal text-gray-600">
                    {editing.paymentMethod}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm font-medium">
                  Status pembayaran
                  <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-normal text-gray-600">
                    {editing.status}
                  </p>
                </div>
                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                  Catatan
                  <Input
                    value={editing.note}
                    onChange={(event) =>
                      updateTransaction("note", event.target.value)
                    }
                    placeholder="Catatan transaksi"
                    maxLength={250}
                  />
                </label>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Barang dalam transaksi</h3>
                {editing.items.map((item, index) => (
                  <div
                    key={item.saleItemId}
                    className="grid gap-3 rounded-lg border border-gray-100 p-3 sm:grid-cols-[minmax(0,1fr)_100px_140px]"
                  >
                    <label className="space-y-1 text-xs font-medium text-gray-600">
                      Nama barang
                      <Input
                        required
                        value={item.name}
                        onChange={(event) =>
                          updateItem(index, "name", event.target.value)
                        }
                        maxLength={100}
                      />
                    </label>
                    <label className="space-y-1 text-xs font-medium text-gray-600">
                      Jumlah
                      <Input
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-1 text-xs font-medium text-gray-600">
                      Harga satuan
                      <Input
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={item.price}
                        onChange={(event) =>
                          updateItem(index, "price", event.target.value)
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Total transaksi</span>
                <span className="text-lg font-semibold">
                  {currency(total(editing))}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                </Button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
