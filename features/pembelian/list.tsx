"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Plus,
  Search,
  Truck,
  X,
} from "lucide-react";

type PurchaseLine = {
  product: string;
  code: string;
  quantity: number;
  unit: string;
  factor: number;
  price: number;
};

type Purchase = {
  id: string;
  date: string;
  vendor: string;
  invoice: string;
  paid: number;
  note: string;
  lines: PurchaseLine[];
};

type Status = "Lunas" | "Sebagian" | "Belum lunas";
type SortKey = "newest" | "oldest" | "largest" | "smallest" | "outstanding";
type RangeKey = "all" | "today" | "7d" | "30d" | "month";

const purchases: Purchase[] = [
  { id: "PB-2026-0048", date: "2026-10-08T09:42:00", vendor: "Grosir Sumber Rejeki", invoice: "SR/INV/1008/048", paid: 250000, note: "Pengiriman pagi · sisa dibayar pekan depan", lines: [{ product: "Kecap manis 135 ml", code: "P001", quantity: 2, unit: "Dus", factor: 24, price: 168000 }, { product: "Mi instan goreng", code: "P003", quantity: 4, unit: "Pack", factor: 10, price: 28000 }, { product: "Minyak goreng 1 L", code: "P002", quantity: 3, unit: "Pcs", factor: 1, price: 15500 }] },
  { id: "PB-2026-0047", date: "2026-10-07T14:16:00", vendor: "CV Mitra Niaga", invoice: "MN-INV-77102", paid: 792000, note: "Barang diterima lengkap", lines: [{ product: "Beras 5 kg", code: "P006", quantity: 8, unit: "Pcs", factor: 1, price: 65000 }, { product: "Gula pasir 1 kg", code: "P004", quantity: 4, unit: "Karung", factor: 25, price: 68000 }] },
  { id: "PB-2026-0046", date: "2026-10-06T10:05:00", vendor: "Distributor Berkah Jaya", invoice: "DBJ/1006/226", paid: 0, note: "Tempo 14 hari", lines: [{ product: "Susu UHT 1 L", code: "P005", quantity: 5, unit: "Dus", factor: 12, price: 198000 }, { product: "Minyak goreng 1 L", code: "P002", quantity: 2, unit: "Dus", factor: 12, price: 186000 }] },
  { id: "PB-2026-0045", date: "2026-10-04T08:30:00", vendor: "Grosir Sumber Rejeki", invoice: "SR/INV/1004/045", paid: 235000, note: "", lines: [{ product: "Kecap manis 135 ml", code: "P001", quantity: 10, unit: "Pcs", factor: 1, price: 7000 }, { product: "Mi instan goreng", code: "P003", quantity: 50, unit: "Pcs", factor: 1, price: 2800 }, { product: "Gula pasir 1 kg", code: "P004", quantity: 5, unit: "Pcs", factor: 1, price: 14500 }] },
  { id: "PB-2026-0044", date: "2026-10-02T16:52:00", vendor: "CV Mitra Niaga", invoice: "MN-INV-77031", paid: 390000, note: "", lines: [{ product: "Susu UHT 1 L", code: "P005", quantity: 12, unit: "Pcs", factor: 1, price: 16500 }, { product: "Beras 5 kg", code: "P006", quantity: 3, unit: "Pcs", factor: 1, price: 65000 }] },
];

const currency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const numFmt = (value: number) => new Intl.NumberFormat("id-ID").format(value);
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

/** Total nilai transaksi. */
const purchaseTotal = (p: Purchase) => p.lines.reduce((s, l) => s + l.quantity * l.price, 0);
/** Total kuantitas fisik (dalam pcs). */
const purchasePcs = (p: Purchase) => p.lines.reduce((s, l) => s + l.quantity * l.factor, 0);
/** Selisih pembayaran: positif = kelebihan bayar, negatif = kurang bayar. */
const purchaseBalance = (p: Purchase) => p.paid - purchaseTotal(p);

/** Status diturunkan dari data — bukan field statis. */
const deriveStatus = (paid: number, total: number): Status => {
  if (total <= 0) return "Lunas";
  if (paid <= 0) return "Belum lunas";
  if (paid >= total) return "Lunas";
  return "Sebagian";
};

const statusStyles: Record<Status, string> = {
  Lunas: "bg-green-50 text-green-700 ring-green-600/15",
  Sebagian: "bg-amber-50 text-amber-700 ring-amber-600/15",
  "Belum lunas": "bg-red-50 text-red-700 ring-red-600/15",
};

const STATUS_OPTIONS: Status[] = ["Lunas", "Sebagian", "Belum lunas"];
const RANGE_LABELS: Record<RangeKey, string> = {
  all: "Semua waktu",
  today: "Hari ini",
  "7d": "7 hari terakhir",
  "30d": "30 hari terakhir",
  month: "Bulan ini",
};
const SORT_LABELS: Record<SortKey, string> = {
  newest: "Terbaru",
  oldest: "Terlama",
  largest: "Nilai terbesar",
  smallest: "Nilai terkecil",
  outstanding: "Sisa terbesar",
};

function inRange(dateStr: string, range: RangeKey, now = new Date()): boolean {
  if (range === "all") return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const dayMs = 86_400_000;
  const diff = now.getTime() - d.getTime();
  switch (range) {
    case "today":
      return d.toDateString() === now.toDateString();
    case "7d":
      return diff >= 0 && diff <= 7 * dayMs;
    case "30d":
      return diff >= 0 && diff <= 30 * dayMs;
    case "month":
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
}

export default function ListFeature() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const [status, setStatus] = useState<"all" | Status>("all");
  const [range, setRange] = useState<RangeKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [expanded, setExpanded] = useState<string | null>(purchases[0]?.id ?? null);

  const filtersActive =
    query.trim() !== "" || status !== "all" || range !== "all" || sort !== "newest";

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setRange("all");
    setSort("newest");
  }

  // Filter + sort
  const filtered = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();

    const result = purchases.filter((p) => {
      // Pencarian bebas
      if (term) {
        const haystack = `${p.id} ${p.vendor} ${p.invoice} ${p.lines
          .map((l) => `${l.product} ${l.code}`)
          .join(" ")}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      // Filter status diturunkan, bukan field statis
      if (status !== "all") {
        const t = purchaseTotal(p);
        if (deriveStatus(p.paid, t) !== status) return false;
      }
      // Filter tanggal
      if (!inRange(p.date, range)) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "newest":
          return +new Date(b.date) - +new Date(a.date);
        case "oldest":
          return +new Date(a.date) - +new Date(b.date);
        case "largest":
          return purchaseTotal(b) - purchaseTotal(a);
        case "smallest":
          return purchaseTotal(a) - purchaseTotal(b);
        case "outstanding": {
          const aOut = Math.max(0, -purchaseBalance(a));
          const bOut = Math.max(0, -purchaseBalance(b));
          return bOut - aOut;
        }
      }
    });

    return result;
  }, [deferredQuery, status, range, sort]);

  // Auto-collapse bila transaksi yang terbuka tersaring keluar
  useEffect(() => {
    if (expanded && !filtered.some((p) => p.id === expanded)) {
      setExpanded(null);
    }
  }, [filtered, expanded]);

  // Statistik mengikuti hasil filter (bukan seluruh data)
  const stats = useMemo(() => {
    let spend = 0;
    let paid = 0;
    for (const p of filtered) {
      spend += purchaseTotal(p);
      paid += p.paid;
    }
    const net = paid - spend;
    return {
      spend,
      paid,
      outstanding: net < 0 ? -net : 0,
      credit: net > 0 ? net : 0,
      count: filtered.length,
    };
  }, [filtered]);

  const isStale = query !== deferredQuery;

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">RIWAYAT PENGADAAN</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Daftar pembelian</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau transaksi pembelian, vendor, barang, dan status pembayaran.
          </p>
        </div>
        <Link href="/admin/pembelian/tambah">
          <Button>
            <Plus size={16} className="mr-2" /> Pembelian baru
          </Button>
        </Link>
      </header>

      {/* Statistik mengikuti filter */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transaksi ditampilkan" value={numFmt(stats.count)} hint={filtersActive ? "Setelah filter diterapkan" : "Dari seluruh periode"} />
        <StatCard label="Total pembelian" value={currency(stats.spend)} hint={filtersActive ? "Pada hasil filter" : "Dari seluruh transaksi"} />
        <StatCard label="Sudah dibayar" value={currency(stats.paid)} hint="Total pembayaran" />
        <StatCard
          label={stats.credit > 0 ? "Kelebihan bayar" : "Sisa pembayaran"}
          value={currency(stats.credit > 0 ? stats.credit : stats.outstanding)}
          hint={stats.credit > 0 ? "Vendor menyimpan saldo" : "Belum dibayar ke vendor"}
          tone={stats.credit > 0 ? "green" : "amber"}
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-55 flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nomor transaksi, vendor, faktur, atau barang"
            className="h-11 border-gray-200 pl-9 pr-9 shadow-none"
            aria-label="Cari transaksi"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2 top-2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          {isStale && (
            <span className="pointer-events-none absolute -bottom-4 left-1 text-[10px] text-gray-400">
              Menyaring…
            </span>
          )}
        </div>

        <SelectField
          icon={<Filter size={16} />}
          ariaLabel="Filter status pembayaran"
          value={status}
          onChange={(v) => setStatus(v as "all" | Status)}
          options={[
            { value: "all", label: "Semua status" },
            ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
          ]}
        />

        <SelectField
          icon={<CalendarDays size={16} />}
          ariaLabel="Filter rentang waktu"
          value={range}
          onChange={(v) => setRange(v as RangeKey)}
          options={(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => ({
            value: k,
            label: RANGE_LABELS[k],
          }))}
        />

        <SelectField
          icon={<ArrowUpDown size={16} />}
          ariaLabel="Urutkan"
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={(Object.keys(SORT_LABELS) as SortKey[]).map((k) => ({
            value: k,
            label: SORT_LABELS[k],
          }))}
        />

        {filtersActive && (
          <Button type="button" variant="ghost" onClick={resetFilters} className="h-11 text-sm text-gray-600">
            <X size={14} className="mr-1" /> Reset
          </Button>
        )}
      </div>

      {/* Daftar transaksi */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div>
            <h2 className="font-semibold">Riwayat transaksi</h2>
            <p className="mt-1 text-xs text-gray-500">
              {filtered.length} dari {purchases.length} transaksi ditampilkan
            </p>
          </div>
          {filtered.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => (prev ? null : filtered[0]?.id ?? null))
              }
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {expanded ? "Tutup detail" : "Buka detail teratas"}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-medium text-gray-700">Transaksi tidak ditemukan</p>
            <p className="mt-1 text-sm text-gray-500">
              {filtersActive
                ? "Coba ubah kata kunci atau filter."
                : "Belum ada data pembelian tercatat."}
            </p>
            {filtersActive && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                Reset filter
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((purchase) => {
              const isOpen = expanded === purchase.id;
              const total = purchaseTotal(purchase);
              const status = deriveStatus(purchase.paid, total);
              const balance = purchase.paid - total;
              const outstanding = balance < 0 ? -balance : 0;
              const credit = balance > 0 ? balance : 0;
              return (
                <article key={purchase.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : purchase.id)}
                    aria-expanded={isOpen}
                    className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-gray-50 md:grid-cols-[1.25fr_1.3fr_1fr_1fr_auto] md:items-center"
                  >
                    <div>
                      <span className="block text-sm font-semibold text-blue-700">{purchase.id}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {dateFormat.format(new Date(purchase.date))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="shrink-0 text-gray-400" />
                      <span className="truncate text-sm font-medium">{purchase.vendor}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">
                        {numFmt(purchasePcs(purchase))} pcs · {purchase.lines.length} jenis
                      </span>
                      <span className="mt-1 block text-sm font-semibold tabular-nums">
                        {currency(total)}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                      <span className="mt-1 block truncate text-xs text-gray-500">
                        Faktur: {purchase.invoice}
                      </span>
                    </div>
                    <span className="justify-self-end text-gray-400">
                      {isOpen ? <ChevronUp size={18} /> : <Eye size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">Detail pembelian</p>
                          <p className="mt-1 text-xs text-gray-500">No. faktur {purchase.invoice}</p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {dateFormat.format(new Date(purchase.date))}
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                        <table className="w-full min-w-155 text-left text-sm">
                          <thead className="bg-gray-50 text-xs text-gray-500">
                            <tr>
                              <th className="px-3 py-2.5 font-medium">Barang</th>
                              <th className="px-3 py-2.5 font-medium">Kode</th>
                              <th className="px-3 py-2.5 text-right font-medium">Jumlah</th>
                              <th className="px-3 py-2.5 text-right font-medium">Harga beli</th>
                              <th className="px-3 py-2.5 text-right font-medium">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {purchase.lines.map((line, i) => (
                              <tr key={`${purchase.id}-${line.code}-${line.unit}-${i}`}>
                                <td className="px-3 py-3 font-medium">{line.product}</td>
                                <td className="px-3 py-3 text-gray-500">{line.code}</td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                  {numFmt(line.quantity)} {line.unit}
                                  <span className="block text-xs text-gray-500">
                                    {numFmt(line.quantity * line.factor)} pcs
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                  {currency(line.price)}
                                </td>
                                <td className="px-3 py-3 text-right font-medium tabular-nums">
                                  {currency(line.quantity * line.price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="ml-auto mt-4 max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Total pembelian</span>
                          <span className="tabular-nums">{currency(total)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Sudah dibayar</span>
                          <span className="tabular-nums">{currency(purchase.paid)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                          <span>
                            {credit > 0
                              ? "Kelebihan bayar"
                              : outstanding > 0
                              ? "Sisa pembayaran"
                              : "Status"}
                          </span>
                          <span
                            className={`tabular-nums ${
                              credit > 0
                                ? "text-green-700"
                                : outstanding > 0
                                ? "text-amber-700"
                                : "text-green-700"
                            }`}
                          >
                            {credit > 0
                              ? currency(credit)
                              : outstanding > 0
                              ? currency(outstanding)
                              : "Lunas"}
                          </span>
                        </div>
                      </div>

                      {purchase.note && (
                        <p className="mt-3 text-xs text-gray-500">Catatan: {purchase.note}</p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Sub-komponen ---------- */

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "amber" | "green";
}) {
  const toneClass =
    tone === "amber" ? "text-amber-700" : tone === "green" ? "text-green-700" : "text-gray-900";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

function SelectField({
  icon,
  ariaLabel,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative sm:w-52">
      <span className="pointer-events-none absolute left-3 top-3 text-gray-400">{icon}</span>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
    </div>
  );
}