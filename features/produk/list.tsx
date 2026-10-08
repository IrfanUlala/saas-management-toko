"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Pencil, Search, Trash2 } from "lucide-react";

export type Product = { id: string; code: string; name: string; barcode: string; unit: string; purchasePrice: number; salePrice: number; stock: number; shelf: string; category: string };
export const productsStorageKey = "toman-products-v1";
export const initialProducts: Product[] = [
  { id: "product-1", code: "PRD-0001", name: "Kecap manis 135 ml", barcode: "8999999501012", unit: "pcs", purchasePrice: 7000, salePrice: 8500, stock: 24, shelf: "A-01", category: "Sembako" },
  { id: "product-2", code: "PRD-0002", name: "Minyak goreng 1 L", barcode: "8999999501029", unit: "botol", purchasePrice: 15500, salePrice: 18000, stock: 16, shelf: "A-02", category: "Sembako" },
  { id: "product-3", code: "PRD-0003", name: "Mi instan goreng", barcode: "8999999501036", unit: "pcs", purchasePrice: 2800, salePrice: 3500, stock: 48, shelf: "B-01", category: "Makanan" },
  { id: "product-4", code: "PRD-0004", name: "Gula pasir 1 kg", barcode: "8999999501043", unit: "pcs", purchasePrice: 14500, salePrice: 16500, stock: 12, shelf: "A-03", category: "Sembako" },
  { id: "product-5", code: "PRD-0005", name: "Susu UHT 1 L", barcode: "8999999501050", unit: "kotak", purchasePrice: 16500, salePrice: 19000, stock: 10, shelf: "C-01", category: "Minuman" },
  { id: "product-6", code: "PRD-0006", name: "Beras 5 kg", barcode: "8999999501067", unit: "karung", purchasePrice: 65000, salePrice: 72000, stock: 8, shelf: "A-04", category: "Sembako" },
];
export function readProducts(): Product[] {
  try {
    const stored = localStorage.getItem(productsStorageKey);
    if (stored) return JSON.parse(stored) as Product[];
  } catch { /* Use the bundled demo catalog if browser storage is unavailable. */ }
  return initialProducts;
}
export function saveProducts(items: Product[]) { localStorage.setItem(productsStorageKey, JSON.stringify(items)); window.dispatchEvent(new Event("toman-products-updated")); }
const currency = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ListFeature() {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua kategori");
  useEffect(() => {
    function refresh() { setItems(readProducts()); }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("toman-products-updated", refresh);
    const timer = window.setTimeout(refresh, 0);
    return () => { window.clearTimeout(timer); window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); window.removeEventListener("toman-products-updated", refresh); };
  }, []);
  const categories = ["Semua kategori", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];
  const filtered = useMemo(() => items.filter((item) => {
    const term = query.trim().toLowerCase();
    return (!term || `${item.code} ${item.name} ${item.barcode} ${item.shelf}`.toLowerCase().includes(term)) && (category === "Semua kategori" || item.category === category);
  }), [items, query, category]);
  function remove(id: string) {
    if (!window.confirm("Hapus produk ini?")) return;
    const next = items.filter((item) => item.id !== id);
    saveProducts(next);
    setItems(next);
  }
  return <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-blue-600">KATALOG TOKO</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Produk</h1><p className="mt-1 text-sm text-gray-500">Kelola informasi barang, harga, stok, dan lokasi rak.</p></div><Link href="/admin/produk/add"><Button><PackagePlus size={16} className="mr-2"/>Tambah produk</Button></Link></header>
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Jumlah produk</p><p className="mt-1 text-xl font-semibold">{items.length}</p></div><div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Stok tersedia</p><p className="mt-1 text-xl font-semibold">{items.reduce((sum, item) => sum + item.stock, 0)} unit</p></div><div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">Stok menipis</p><p className="mt-1 text-xl font-semibold text-amber-700">{items.filter((item) => item.stock <= 10).length} produk</p></div></div>
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, kode, barcode, atau rak" className="h-11 border-gray-200 pl-9 shadow-none"/></div><select aria-label="Filter kategori" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm sm:w-52">{categories.map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-100 px-4 py-4"><h2 className="font-semibold">Daftar produk</h2><p className="mt-1 text-xs text-gray-500">Menampilkan {filtered.length} dari {items.length} produk</p></div>{filtered.length === 0 ? <div className="py-12 text-center text-sm text-gray-500">Produk tidak ditemukan.</div> : <div className="overflow-x-auto"><table className="w-full min-w-212.5 text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>{["Produk", "Kode / Barcode", "Satuan", "Harga jual", "Stok", "Rak", "Aksi"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((item) => <tr key={item.id} className="hover:bg-gray-50/70"><td className="px-4 py-3"><span className="font-medium">{item.name}</span><span className="mt-1 block text-xs text-gray-500">{item.category || "Tanpa kategori"}</span></td><td className="px-4 py-3"><span>{item.code}</span><span className="mt-1 block text-xs text-gray-500">{item.barcode || "—"}</span></td><td className="px-4 py-3">{item.unit}</td><td className="px-4 py-3 font-medium">{currency(item.salePrice)}</td><td className="px-4 py-3"><span className={item.stock <= 10 ? "font-medium text-amber-700" : ""}>{item.stock}</span></td><td className="px-4 py-3">{item.shelf || "—"}</td><td className="px-4 py-3"><div className="flex gap-1"><Link href={`/admin/produk/edit?id=${encodeURIComponent(item.id)}`}><Button type="button" variant="ghost" size="sm" aria-label={`Edit ${item.name}`}><Pencil size={15}/></Button></Link><Button type="button" variant="ghost" size="sm" aria-label={`Hapus ${item.name}`} onClick={() => remove(item.id)}><Trash2 size={15} className="text-red-500"/></Button></div></td></tr>)}</tbody></table></div>}</div>
  </section>;
}
