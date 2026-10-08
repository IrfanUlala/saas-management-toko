"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { Product, initialProducts, productsStorageKey, saveProducts } from "@/features/produk/list";

type ProductFormProps = { mode: "add" | "edit" };
type FormValue = Omit<Product, "id" | "code">;
const empty: FormValue = { name: "", barcode: "", unit: "pcs", purchasePrice: 0, salePrice: 0, stock: 0, shelf: "", category: "" };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function ProductForm({ mode }: ProductFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("id");
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [value, setValue] = useState<FormValue>(empty);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const editing = mode === "edit";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(productsStorageKey);
        const list = stored ? JSON.parse(stored) as Product[] : initialProducts;
        setItems(list);
        if (editing && productId) {
          const product = list.find((item) => item.id === productId);
          if (product) {
            setValue({ name: product.name, barcode: product.barcode, unit: product.unit, purchasePrice: product.purchasePrice, salePrice: product.salePrice, stock: product.stock, shelf: product.shelf, category: product.category });
          } else setError("Produk tidak ditemukan. Data produk contoh mungkin belum tersimpan di browser ini.");
        }
      } catch { setItems(initialProducts); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [editing, productId]);

  const nextCode = useMemo(() => {
    const max = items.reduce((highest, item) => Math.max(highest, Number(item.code.match(/(\d+)$/)?.[1] ?? 0)), 0);
    return `PRD-${String(max + 1).padStart(4, "0")}`;
  }, [items]);

  function update<K extends keyof FormValue>(key: K, field: FormValue[K]) { setValue((current) => ({ ...current, [key]: field })); }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = value.name.trim();
    if (!name) { setError("Nama produk wajib diisi."); return; }
    if (!value.unit.trim()) { setError("Satuan wajib diisi."); return; }
    if (value.barcode && items.some((item) => item.barcode === value.barcode && item.id !== productId)) { setError("Barcode sudah digunakan produk lain."); return; }
    if (value.purchasePrice < 0 || value.salePrice < 0 || value.stock < 0) { setError("Harga dan stok tidak boleh bernilai negatif."); return; }
    const existing = items.find((item) => item.id === productId);
    const product: Product = { ...value, name, unit: value.unit.trim(), id: existing?.id ?? `product-${crypto.randomUUID()}`, code: existing?.code ?? nextCode, category: value.category.trim(), shelf: value.shelf.trim() };
    const updated = existing ? items.map((item) => item.id === existing.id ? product : item) : [product, ...items];
    saveProducts(updated);
    sessionStorage.setItem("toman-pembelian-products-updated", product.id);
    router.push("/admin/produk");
  }

  if (!ready) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Memuat data produk…</div>;
  return <section className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6"><header><Link href="/admin/produk" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={16}/> Kembali ke produk</Link><p className="mt-5 text-sm font-medium text-blue-600">KATALOG TOKO</p><h1 className="mt-1 text-2xl font-bold tracking-tight">{editing ? "Edit produk" : "Tambah produk"}</h1><p className="mt-1 text-sm text-gray-500">Lengkapi informasi produk agar dapat digunakan dalam penjualan dan pembelian.</p></header>
    {error && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
    {editing && !items.some((item) => item.id === productId) ? <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">Pilih produk dari daftar untuk mengubah datanya.<div className="mt-4"><Link href="/admin/produk"><Button variant="outline">Buka daftar produk</Button></Link></div></div> : <form onSubmit={save} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="product-code" className="mb-1.5 block text-sm font-medium">Kode produk</label><Input id="product-code" value={editing ? items.find((item) => item.id === productId)?.code ?? "" : nextCode} readOnly className="bg-gray-50 text-gray-500"/><p className="mt-1 text-xs text-gray-500">Kode dibuat otomatis dan tidak dapat diubah.</p></div><div><label htmlFor="product-name" className="mb-1.5 block text-sm font-medium">Nama produk <span className="text-red-500">*</span></label><Input id="product-name" required value={value.name} onChange={(e) => update("name", e.target.value)} placeholder="Contoh: Kopi bubuk 200 g"/></div><div><label htmlFor="product-barcode" className="mb-1.5 block text-sm font-medium">Barcode</label><Input id="product-barcode" value={value.barcode} onChange={(e) => update("barcode", e.target.value)} placeholder="Pindai atau ketik barcode"/><p className="mt-1 text-xs text-gray-500">Opsional, tetapi harus unik jika diisi.</p></div><div><label htmlFor="product-category" className="mb-1.5 block text-sm font-medium">Kategori</label><Input id="product-category" value={value.category} onChange={(e) => update("category", e.target.value)} placeholder="Contoh: Minuman"/><Link href="/admin/produk/kategori" className="mt-1.5 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700">Kelola kategori</Link></div><div><label htmlFor="product-unit" className="mb-1.5 block text-sm font-medium">Satuan dasar <span className="text-red-500">*</span></label><Input id="product-unit" required value={value.unit} onChange={(e) => update("unit", e.target.value)} placeholder="pcs, botol, kg"/><p className="mt-1 text-xs text-gray-500">Satuan dasar untuk stok dan harga produk.</p><Link href="/admin/produk/satuan" className="mt-1 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700">Kelola satuan dasar</Link></div><div><label htmlFor="product-shelf" className="mb-1.5 block text-sm font-medium">Lokasi rak</label><Input id="product-shelf" value={value.shelf} onChange={(e) => update("shelf", e.target.value)} placeholder="Contoh: A-01"/></div><div><label htmlFor="purchase-price" className="mb-1.5 block text-sm font-medium">Harga beli (Rp)</label><Input id="purchase-price" type="number" min="0" step="1" value={value.purchasePrice} onChange={(e) => update("purchasePrice", Number(e.target.value))}/>{value.purchasePrice > 0 && <p className="mt-1 text-xs text-gray-500">{money(value.purchasePrice)}</p>}</div><div><label htmlFor="sale-price" className="mb-1.5 block text-sm font-medium">Harga jual (Rp) <span className="text-red-500">*</span></label><Input id="sale-price" required type="number" min="0" step="1" value={value.salePrice} onChange={(e) => update("salePrice", Number(e.target.value))}/>{value.salePrice > 0 && <p className="mt-1 text-xs text-gray-500">{money(value.salePrice)}</p>}</div><div><label htmlFor="product-stock" className="mb-1.5 block text-sm font-medium">Stok awal</label><Input id="product-stock" type="number" min="0" step="1" value={value.stock} onChange={(e) => update("stock", Number(e.target.value))}/></div></div><div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4"><Link href="/admin/produk"><Button type="button" variant="outline">Batal</Button></Link><Button type="submit"><Save size={16} className="mr-2"/>{editing ? "Simpan perubahan" : "Simpan produk"}</Button></div></form>}
  </section>;
}
