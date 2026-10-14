"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

const quantity = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value);
const dateTime = (value: number) => new Date(value).toLocaleString("id-ID");
const movementLabels: Record<string, string> = {
  openingBalance: "Stok awal",
  purchase: "Pembelian",
  sale: "Penjualan",
  adjustment: "Penyesuaian",
  return: "Retur",
  damage: "Barang rusak",
};

export default function ProductStockReportPage() {
  const params = useParams<{ idbarang: string }>();
  const report = useQuery(api.reports.productStockMovements, {
    productId: params.idbarang as Id<"products">,
  });

  return (
    <CatalogStoreGate>
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <Link href="/admin/laporan" className="text-sm font-medium text-primary hover:underline">← Kembali ke laporan</Link>
        {!report ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">Memuat riwayat stok…</div>
        ) : !report.product ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">Produk tidak ditemukan.</div>
        ) : (
          <>
            <header>
              <h1 className="text-2xl font-bold">Riwayat stok: {report.product.name}</h1>
              <p className="mt-1 text-sm text-gray-500">SKU: {report.product.sku} · Stok saat ini: {quantity(report.quantity)}</p>
            </header>
            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500"><tr>
                    {["Waktu", "Jenis", "Perubahan", "Sebelum", "Sesudah", "Catatan"].map((label) => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}
                  </tr></thead>
                  <tbody className="divide-y">
                    {report.movements.map((movement) => (
                      <tr key={movement._id}>
                        <td className="whitespace-nowrap p-3">{dateTime(movement.createdAt)}</td>
                        <td className="whitespace-nowrap p-3">{movementLabels[movement.type] ?? movement.type}</td>
                        <td className={`whitespace-nowrap p-3 font-semibold ${movement.quantityChange > 0 ? "text-green-700" : movement.quantityChange < 0 ? "text-red-700" : "text-gray-600"}`}>{movement.quantityChange > 0 ? "+" : ""}{quantity(movement.quantityChange)}</td>
                        <td className="whitespace-nowrap p-3">{quantity(movement.quantityBefore)}</td>
                        <td className="whitespace-nowrap p-3">{quantity(movement.quantityAfter)}</td>
                        <td className="p-3">{movement.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!report.movements.length && <p className="p-8 text-center text-sm text-gray-500">Belum ada riwayat perubahan stok untuk produk ini.</p>}
              </div>
            </section>
          </>
        )}
      </main>
    </CatalogStoreGate>
  );
}
