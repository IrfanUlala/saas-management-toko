"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function ListFeature() {
  return (
    <CatalogStoreGate>
      <ProductList />
    </CatalogStoreGate>
  );
}

function ProductList() {
  const { isAuthenticated } = useConvexAuth();
  const products = useQuery(
    api.products.list,
    isAuthenticated ? {} : "skip",
  );
  const deactivateProduct = useMutation(api.products.deactivate);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua kategori");
  const [error, setError] = useState("");

  const categoryOptions = useMemo(
    () => [
      "Semua kategori",
      ...new Set(
        (products ?? [])
          .map(({ category: productCategory }) => productCategory?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    ],
    [products],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (products ?? []).filter(({ product, category: productCategory }) => {
      const matchesSearch =
        !term ||
        `${product.sku} ${product.name} ${product.barcode ?? ""} ${product.shelfLocation ?? ""}`
          .toLowerCase()
          .includes(term);
      const matchesCategory =
        category === "Semua kategori" || productCategory?.name === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, query, category]);

  async function deactivate(productId: Id<"products">, name: string) {
    if (!window.confirm(`Nonaktifkan produk ${name}?`)) return;
    setError("");
    try {
      await deactivateProduct({ productId });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Produk gagal dinonaktifkan.",
      );
    }
  }

  if (products === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-gray-500">
        Memuat produk...
      </div>
    );
  }

  const stockTotal = products.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = products.filter(
    ({ product, stock }) => stock <= product.lowStockThreshold,
  ).length;

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">KATALOG TOKO</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Produk</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola informasi barang, harga, stok, dan lokasi rak.
          </p>
        </div>
        <Link href="/admin/produk/add">
          <Button>
            <PackagePlus size={16} className="mr-2" />
            Tambah produk
          </Button>
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Jumlah produk" value={products.length} />
        <SummaryCard label="Stok tersedia" value={`${stockTotal} unit`} />
        <SummaryCard label="Stok menipis" value={`${lowStockCount} produk`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, kode, barcode, atau rak"
            className="h-11 border-gray-200 pl-9 shadow-none"
          />
        </div>
        <select
          aria-label="Filter kategori"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm sm:w-52"
        >
          {categoryOptions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="font-semibold">Daftar produk</h2>
          <p className="mt-1 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {products.length} produk
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {query || category !== "Semua kategori"
              ? "Produk tidak ditemukan."
              : "Belum ada produk. Tambahkan produk pertama toko Anda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {[
                    "Produk",
                    "Kode / Barcode",
                    "Satuan",
                    "Harga jual",
                    "Stok",
                    "Rak",
                    "Aksi",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(({ product, category: productCategory, unit, stock }) => (
                  <tr key={product._id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3">
                      <span className="font-medium">{product.name}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {productCategory?.name || "Tanpa kategori"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span>{product.sku}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {product.barcode || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{unit.abbreviation}</td>
                    <td className="px-4 py-3 font-medium">
                      {currency(product.salePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          stock <= product.lowStockThreshold
                            ? "font-medium text-amber-700"
                            : ""
                        }
                      >
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">{product.shelfLocation || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/admin/produk/edit?id=${encodeURIComponent(product._id)}`}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil size={15} />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Nonaktifkan ${product.name}`}
                          onClick={() => void deactivate(product._id, product.name)}
                        >
                          <Trash2 size={15} className="text-red-500" />
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
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
