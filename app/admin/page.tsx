"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import {
  Boxes,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardPage() {
  return (
    <CatalogStoreGate>
      <Dashboard />
    </CatalogStoreGate>
  );
}

function Dashboard() {
  const { isAuthenticated } = useConvexAuth();
  const summary = useQuery(
    api.dashboard.summary,
    isAuthenticated ? {} : "skip",
  );
  const chartMaximum = useMemo(
    () => Math.max(1, ...(summary?.weeklySales.map((day) => day.total) ?? [])),
    [summary],
  );

  if (!summary) {
    return (
      <div className="px-4 py-12 text-sm text-gray-500 md:px-6">
        Memuat ringkasan toko...
      </div>
    );
  }

  const averageSale =
    summary.salesTodayCount > 0
      ? summary.salesToday / summary.salesTodayCount
      : 0;

  return (
    <div className="space-y-8 px-4 md:px-6">
      <section>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard Toko</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Ringkasan operasional
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Data penjualan, pembelian, dan stok langsung dari Convex.
            </p>
          </div>
          <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Store className="h-5 w-5" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Penjualan hari ini"
          value={currency(summary.salesToday)}
          description={`${summary.salesTodayCount} transaksi`}
          icon={Receipt}
        />
        <SummaryCard
          title="Stok menipis"
          value={`${summary.lowStockCount} produk`}
          description={`Dari ${summary.productCount} produk aktif`}
          icon={Package}
        />
        <SummaryCard
          title="Pembelian 7 hari"
          value={currency(summary.purchasesWeekTotal)}
          description={`${summary.purchasesWeekCount} transaksi`}
          icon={Truck}
        />
        <SummaryCard
          title="Rata-rata penjualan"
          value={currency(averageSale)}
          description="Per transaksi hari ini"
          icon={ShoppingCart}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">Ringkasan penjualan</h2>
              <p className="mt-1 text-sm text-gray-500">
                Performa penjualan selama 7 hari terakhir
              </p>
            </div>
            <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
              7 hari terakhir
            </span>
          </div>
          <div className="mt-6 flex h-44 items-end justify-between gap-3 sm:gap-5">
            {summary.weeklySales.map((day) => {
              const date = new Date(day.dayStart);
              const height =
                day.total > 0
                  ? Math.max(4, (day.total / chartMaximum) * 100)
                  : 0;
              return (
                <div
                  key={day.dayStart}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-lg ${
                        height > 0 ? "bg-primary" : "bg-gray-100"
                      }`}
                      style={{ height: `${height}%` }}
                      title={currency(day.total)}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Intl.DateTimeFormat("id-ID", {
                      weekday: "short",
                    }).format(date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Aktivitas hari ini</h2>
              <p className="mt-1 text-sm text-gray-500">Penjualan tercatat</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 divide-y divide-gray-100">
            <MetricRow
              label="Total transaksi"
              value={String(summary.salesTodayCount)}
              icon={ShoppingCart}
            />
            <MetricRow
              label="Rata-rata transaksi"
              value={currency(averageSale)}
              icon={TrendingUp}
            />
            <MetricRow
              label="Produk aktif"
              value={`${summary.productCount} produk`}
              icon={Boxes}
            />
            <MetricRow
              label="Pembelian 7 hari"
              value={currency(summary.purchasesWeekTotal)}
              icon={Truck}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:px-6">
          <div>
            <h2 className="font-semibold text-gray-900">Transaksi terbaru</h2>
            <p className="mt-1 text-sm text-gray-500">
              Lima transaksi penjualan terakhir
            </p>
          </div>
          <Link
            href="/admin/riwayat"
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat riwayat
          </Link>
        </div>
        {summary.recentSales.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            Belum ada transaksi penjualan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-gray-50/70 text-xs font-medium text-gray-400">
                <tr>
                  {["ID transaksi", "Pelanggan", "Waktu", "Item", "Total", "Status"].map(
                    (heading) => (
                      <th key={heading} className="px-5 py-3 md:px-6">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.recentSales.map(({ sale, itemCount }) => (
                  <tr key={sale._id} className="text-gray-600">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900 md:px-6">
                      {sale.receiptNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {sale.customerName ?? "Pelanggan umum"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(sale.soldAt))}
                    </td>
                    <td className="px-5 py-4">{itemCount} item</td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {currency(sale.totalAmount)}
                    </td>
                    <td className="px-5 py-4 md:px-6">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {sale.status === "completed" ? "Selesai" : "Dibatalkan"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof ShoppingCart;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}
