"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product as CatalogProduct, initialProducts, productsStorageKey } from "@/features/produk/list";
import {
  Barcode,
  Check,
  ChevronDown,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  code: string;
  barcode: string;
  purchasePrice: number;
  stock: number;
  units: { name: string; factor: number }[];
};
type CartItem = {
  lineId: string; // `${productId}::${unit}` — unik per kombinasi
  product: Product;
  quantity: number;
  unit: string;
  price: number; // harga per satuan terpilih
};
type Vendor = { id: string; name: string; contact: string; note: string };
type Draft = { vendorId: string; cart: CartItem[]; paid: string; note: string };
type Notice = { type: "success" | "error"; text: string };

function productFromCatalog(product: CatalogProduct): Product {
  const units = [{ name: product.unit, factor: 1 }, { name: `Pack (10 ${product.unit})`, factor: 10 }, { name: `Dus (24 ${product.unit})`, factor: 24 }];
  return { id: product.id, name: product.name, code: product.code, barcode: product.barcode, purchasePrice: product.purchasePrice, stock: product.stock, units };
}

function readCatalog(): Product[] {
  try {
    const stored = localStorage.getItem(productsStorageKey);
    const catalog = stored ? JSON.parse(stored) as CatalogProduct[] : initialProducts;
    return catalog.map(productFromCatalog);
  } catch { return initialProducts.map(productFromCatalog); }
}

const vendors: Vendor[] = [
  { id: "V001", name: "Grosir Sumber Rejeki", contact: "0812-3456-7890", note: "Langganan · tempo 14 hari" },
  { id: "V002", name: "CV Mitra Niaga", contact: "0813-2222-4567", note: "Harga grosir" },
  { id: "V003", name: "Distributor Berkah Jaya", contact: "0821-8765-4321", note: "Pengiriman setiap hari" },
];

const currency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const numFmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);

const draftKey = "toman-pembelian-draft";
const makeLineId = (productId: string, unit: string) => `${productId}::${unit}`;

export default function AddFeature() {
  const [query, setQuery] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [showMatches, setShowMatches] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts.map(productFromCatalog));
  const [hydrated, setHydrated] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) =>
      `${p.name} ${p.code} ${p.barcode}`.toLowerCase().includes(term)
    );
  }, [query, products]);

  const selectedVendor = vendors.find((v) => v.id === vendorId);
  const totalPcs = cart.reduce((sum, item) => {
    const factor = item.product.units.find((u) => u.name === item.unit)?.factor ?? 1;
    return sum + item.quantity * factor;
  }, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const payment = Number(paid) || 0;
  const balance = payment - subtotal;
  const hasInvalidLine = cart.some(
    (i) => !Number.isFinite(i.quantity) || i.quantity <= 0 || !Number.isFinite(i.price) || i.price < 0
  );
  const canSave = Boolean(selectedVendor) && cart.length > 0 && !hasInvalidLine;

  useEffect(() => {
    function refreshCatalog() { setProducts(readCatalog()); }
    window.addEventListener("storage", refreshCatalog);
    window.addEventListener("toman-products-updated", refreshCatalog);
    const timer = window.setTimeout(refreshCatalog, 0);
    return () => { window.clearTimeout(timer); window.removeEventListener("storage", refreshCatalog); window.removeEventListener("toman-products-updated", refreshCatalog); };
  }, []);

  // Muat draft
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(draftKey);
        if (raw) {
          const draft = JSON.parse(raw) as Draft;
          if (vendors.some((v) => v.id === draft.vendorId)) setVendorId(draft.vendorId);
          if (Array.isArray(draft.cart)) {
            const restored = draft.cart
              .map((item): CartItem | null => {
                const product = products.find((p) => p.id === item.product?.id);
                if (!product) return null;
                const unitName = product.units.some((u) => u.name === item.unit)
                  ? item.unit
                  : product.units[0].name;
                const unit = product.units.find((u) => u.name === unitName)!;
                const q = Number(item.quantity);
                const p = Number(item.price);
                return {
                  lineId: makeLineId(product.id, unitName),
                  product,
                  quantity: Number.isFinite(q) && q > 0 ? q : 1,
                  unit: unitName,
                  price: Number.isFinite(p) && p >= 0 ? p : product.purchasePrice * unit.factor,
                };
              })
              .filter((x): x is CartItem => x !== null);

            // Gabung bila ada lineId yang sama
            const map = new Map<string, CartItem>();
            for (const line of restored) {
              const existing = map.get(line.lineId);
              if (existing) map.set(line.lineId, { ...existing, quantity: existing.quantity + line.quantity });
              else map.set(line.lineId, line);
            }
            setCart(Array.from(map.values()));
          }
          if (typeof draft.paid === "string") setPaid(draft.paid);
          if (typeof draft.note === "string") setNote(draft.note);
        }
      } catch {
        sessionStorage.removeItem(draftKey);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [products]);

  // Simpan draft
  useEffect(() => {
    if (hydrated) {
      sessionStorage.setItem(draftKey, JSON.stringify({ vendorId, cart, paid, note } satisfies Draft));
    }
  }, [vendorId, cart, paid, note, hydrated]);

  // Klik di luar vendor dropdown
  useEffect(() => {
    function close(e: MouseEvent) {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) setShowVendors(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Auto dismiss notice
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHighlighted(0), 0);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    matchesRef.current
      ?.querySelector<HTMLElement>(`[data-index="${highlighted}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function addProduct(product: Product, unitName = product.units[0].name) {
    const unit = product.units.find((u) => u.name === unitName) ?? product.units[0];
    const lineId = makeLineId(product.id, unit.name);
    setCart((items) => {
      const existing = items.find((i) => i.lineId === lineId);
      if (existing) {
        return items.map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...items,
        { lineId, product, quantity: 1, unit: unit.name, price: product.purchasePrice * unit.factor },
      ];
    });
    setQuery("");
    setShowMatches(false);
    inputRef.current?.focus();
  }

  function removeLine(lineId: string) {
    setCart((items) => items.filter((i) => i.lineId !== lineId));
  }

  function patchItem(lineId: string, patch: Partial<Pick<CartItem, "quantity" | "price">>) {
    setCart((items) => items.map((i) => (i.lineId === lineId ? { ...i, ...patch } : i)));
  }

  /** Ganti satuan: harga per satuan menyesuaikan proporsional + merge jika duplikat. */
  function changeUnit(lineId: string, newUnitName: string) {
    setCart((items) => {
      const current = items.find((i) => i.lineId === lineId);
      if (!current) return items;
      const oldUnit = current.product.units.find((u) => u.name === current.unit);
      const newUnit = current.product.units.find((u) => u.name === newUnitName);
      if (!oldUnit || !newUnit) return items;

      const pricePerBase = current.price / oldUnit.factor;
      const newPrice = Math.round(pricePerBase * newUnit.factor);
      const targetLineId = makeLineId(current.product.id, newUnitName);

      const existing = items.find((i) => i.lineId === targetLineId && i.lineId !== lineId);
      if (existing) {
        return items
          .filter((i) => i.lineId !== lineId)
          .map((i) => (i.lineId === targetLineId ? { ...i, quantity: i.quantity + current.quantity } : i));
      }
      return items.map((i) =>
        i.lineId === lineId ? { ...i, lineId: targetLineId, unit: newUnitName, price: newPrice } : i
      );
    });
  }

  function submitSearch() {
    const term = query.trim().toLowerCase();
    if (!term) return;
    const exact = products.find(
      (p) => p.code.toLowerCase() === term || p.barcode === term
    );
    if (exact) return addProduct(exact);
    if (matches.length === 1) return addProduct(matches[0]);
    if (matches.length > 1 && showMatches && matches[highlighted]) return addProduct(matches[highlighted]);
    setShowMatches(true);
  }

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowMatches(true);
      setHighlighted((h) => Math.min(h + 1, Math.max(matches.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    } else if (e.key === "Escape") {
      setShowMatches(false);
    }
  }

  function finishPurchase() {
    if (!selectedVendor) {
      setNotice({ type: "error", text: "Pilih vendor sebelum menyelesaikan pembelian." });
      return;
    }
    if (!cart.length) {
      setNotice({ type: "error", text: "Tambahkan barang ke keranjang terlebih dahulu." });
      return;
    }
    if (hasInvalidLine) {
      setNotice({ type: "error", text: "Periksa jumlah dan harga barang terlebih dahulu." });
      return;
    }
    const summary =
      balance >= 0
        ? `${currency(subtotal)}${balance > 0 ? ` · Kembalian ${currency(balance)}` : ""}`
        : `${currency(subtotal)} · Sisa utang ${currency(-balance)}`;
    setNotice({ type: "success", text: `Pembelian dari ${selectedVendor.name} dicatat · ${summary}` });
    setCart([]);
    setPaid("");
    setNote("");
    setQuery("");
    sessionStorage.removeItem(draftKey);
    inputRef.current?.focus();
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">PENGADAAN STOK</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Pembelian barang</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pilih vendor, masukkan barang, lalu catat biaya pembelian.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <ShoppingCart size={17} /> {cart.length} jenis · {numFmt(totalPcs)} pcs
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
        >
          {notice.type === "success" && <Check size={16} />}
          {notice.text}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Kolom kiri */}
        <div className="space-y-5">
          {/* Vendor */}
          <div
            ref={vendorRef}
            className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
          >
            <label className="text-sm font-semibold" htmlFor="vendor">
              Rekanan / vendor
            </label>
            <p className="mt-1 text-xs text-gray-500">Pilih pemasok barang untuk transaksi ini.</p>
            <button
              id="vendor"
              type="button"
              aria-expanded={showVendors}
              onClick={() => setShowVendors((s) => !s)}
              className="mt-3 flex min-h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <span className={selectedVendor ? "text-gray-900" : "text-gray-400"}>
                {selectedVendor?.name ?? "Pilih vendor"}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showVendors ? "rotate-180" : ""}`}
              />
            </button>

            {showVendors && (
              <div className="absolute inset-x-4 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 md:inset-x-5">
                {vendors.map((vendor) => (
                  <button
                    type="button"
                    key={vendor.id}
                    onClick={() => {
                      setVendorId(vendor.id);
                      setShowVendors(false);
                    }}
                    className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50"
                  >
                    <span>
                      <span className="block text-sm font-medium">{vendor.name}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {vendor.contact} · {vendor.note}
                      </span>
                    </span>
                    {vendor.id === vendorId && <Check size={16} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}

            {selectedVendor && (
              <p className="mt-2 text-xs text-gray-500">
                {selectedVendor.contact} · {selectedVendor.note}
              </p>
            )}
          </div>

          {/* Pencarian barang */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <label htmlFor="product-search" className="text-sm font-semibold">
              Cari barang yang sudah terdaftar
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Cari dengan nama, kode, atau scan barcode. Gunakan ↑/↓ dan Enter untuk memilih.
            </p>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                id="product-search"
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);
                  setShowMatches(true);
                  const term = value.trim();
                  if (!term) return;
                  const exact = products.find(
                    (p) => p.barcode === term || p.code.toLowerCase() === term.toLowerCase()
                  );
                  if (exact) addProduct(exact);
                }}
                onKeyDown={handleSearchKey}
                onFocus={() => query && setShowMatches(true)}
                autoComplete="off"
                placeholder="Nama / kode / barcode barang"
                className="h-11 border-gray-200 pl-9 shadow-none focus-visible:ring-2 focus-visible:ring-blue-100"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Bersihkan pencarian"
                  onClick={() => {
                    setQuery("");
                    setShowMatches(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}

              {showMatches && query && (
                <div
                  ref={matchesRef}
                  className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5"
                >
                  {matches.length ? (
                    matches.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setHighlighted(index)}
                        onClick={() => addProduct(product)}
                        className={`flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 ${index === highlighted ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{product.name}</span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Barcode size={13} /> {product.code} · {product.barcode}
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-sm font-semibold">
                          Stok {product.stock}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4">
                      <p className="text-sm text-gray-600">Barang belum terdaftar.</p>
                      <Link
                        href="/admin/produk"
                        onClick={() =>
                          sessionStorage.setItem(
                            draftKey,
                            JSON.stringify({ vendorId, cart, paid, note } satisfies Draft)
                          )
                        }
                        className="mt-2 inline-block text-sm font-medium text-blue-600 underline underline-offset-2"
                      >
                        + Tambahkan barang di Produk
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">
                        Draft pembelian tersimpan; kembali ke halaman ini untuk melanjutkan.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Keranjang */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4">
              <div>
                <h2 className="font-semibold">Keranjang pembelian</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Atur satuan, jumlah, dan harga beli. Harga otomatis menyesuaikan saat satuan diubah.
                </p>
              </div>
              {cart.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setCart([])}
                >
                  <Trash2 size={14} className="mr-1" /> Kosongkan
                </Button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                Belum ada barang. Cari produk untuk mulai membuat pembelian.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(({ lineId, product, quantity, unit, price }, index) => {
                  const unitObj = product.units.find((u) => u.name === unit) ?? product.units[0];
                  const factor = unitObj.factor;
                  const lineTotal = quantity * price;
                  const projectedStock = product.stock + quantity * factor;
                  return (
                    <div key={lineId} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            {index + 1}. {product.code} · {product.barcode}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium">{product.name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Stok {product.stock} pcs →{" "}
                            <span className="font-medium text-emerald-700">
                              {projectedStock} pcs
                            </span>{" "}
                            setelah pembelian
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Hapus ${product.name}`}
                          onClick={() => removeLine(lineId)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <label
                            htmlFor={`qty-${lineId}`}
                            className="mb-1 block text-xs font-medium text-gray-600"
                          >
                            Jumlah
                          </label>
                          <div className="flex h-10 items-center rounded-lg border border-gray-200">
                            <button
                              type="button"
                              className="h-full px-2 text-gray-500 hover:text-gray-900"
                              aria-label="Kurangi jumlah"
                              onClick={() =>
                                patchItem(lineId, { quantity: Math.max(1, quantity - 1) })
                              }
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              id={`qty-${lineId}`}
                              type="number"
                              min="0"
                              step="1"
                              value={quantity}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                patchItem(lineId, {
                                  quantity: Number.isFinite(v) ? Math.max(0, v) : 0,
                                });
                              }}
                              onBlur={() => {
                                if (!(quantity > 0)) patchItem(lineId, { quantity: 1 });
                              }}
                              className="h-full w-full min-w-0 border-0 p-0 text-center text-sm tabular-nums outline-none"
                              aria-label={`Jumlah ${product.name}`}
                            />
                            <button
                              type="button"
                              className="h-full px-2 text-gray-500 hover:text-gray-900"
                              aria-label="Tambah jumlah"
                              onClick={() => patchItem(lineId, { quantity: quantity + 1 })}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`unit-${lineId}`}
                            className="mb-1 block text-xs font-medium text-gray-600"
                          >
                            Satuan
                          </label>
                          <select
                            id={`unit-${lineId}`}
                            value={unit}
                            onChange={(e) => changeUnit(lineId, e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            {product.units.map((option) => (
                              <option key={option.name} value={option.name}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`price-${lineId}`}
                            className="mb-1 block text-xs font-medium text-gray-600"
                          >
                            Harga / satuan
                          </label>
                          <Input
                            id={`price-${lineId}`}
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) =>
                              patchItem(lineId, {
                                price: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="h-10 border-gray-200 tabular-nums shadow-none"
                          />
                        </div>

                        <div className="flex flex-col justify-end">
                          <span className="mb-1 text-xs font-medium text-gray-600">Total baris</span>
                          <span className="flex h-10 items-center text-sm font-semibold tabular-nums">
                            {currency(lineTotal)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        {numFmt(quantity)} {unit} = {numFmt(quantity * factor)} pcs
                        {price > 0 && (
                          <>
                            {" · "}
                            <span className="tabular-nums">
                              {currency(price / factor)} / pcs
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ringkasan */}
        <aside className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5 lg:sticky lg:top-6">
          <h2 className="font-semibold">Ringkasan pembelian</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Jumlah barang</span>
              <span className="tabular-nums">
                {numFmt(totalPcs)} pcs · {cart.length} jenis
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 text-gray-600">
              <span>Total pembelian</span>
              <span className="font-semibold text-gray-900 tabular-nums">{currency(subtotal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="paid" className="block text-sm font-medium">
              Pembayaran (opsional)
            </label>
            <Input
              id="paid"
              type="number"
              min="0"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder="Masukkan pembayaran"
              className="h-11 text-right text-base font-semibold tabular-nums shadow-none"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaid(String(subtotal))}
                disabled={subtotal <= 0}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                Uang pas
              </button>
              <button
                type="button"
                onClick={() => setPaid("0")}
                disabled={subtotal <= 0}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                Belum dibayar
              </button>
              {paid && (
                <button
                  type="button"
                  onClick={() => setPaid("")}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {paid && (
            <div
              className={`flex justify-between rounded-lg p-3 text-sm font-semibold ${balance >= 0
                  ? "bg-green-50 text-green-700"
                  : "bg-orange-50 text-orange-700"
                }`}
            >
              <span>{balance >= 0 ? "Kembalian" : "Sisa utang"}</span>
              <span className="tabular-nums">{currency(Math.abs(balance))}</span>
            </div>
          )}

          <div>
            <label htmlFor="purchase-note" className="block text-sm font-medium">
              Catatan (opsional)
            </label>
            <textarea
              id="purchase-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Nomor faktur atau catatan lainnya"
              className="mt-1 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <Button
            type="button"
            className="h-11 w-full"
            disabled={!canSave}
            onClick={finishPurchase}
          >
            <Check size={16} className="mr-1" /> Simpan pembelian
          </Button>

          {!selectedVendor && (
            <p className="text-center text-xs text-amber-700">
              Pilih vendor untuk mengaktifkan transaksi.
            </p>
          )}
          {selectedVendor && hasInvalidLine && (
            <p className="text-center text-xs text-amber-700">
              Periksa jumlah dan harga barang sebelum menyimpan.
            </p>
          )}
          <p className="text-center text-xs text-gray-500">
            Pembayaran parsial diperbolehkan; sisa akan dicatat sebagai utang.
          </p>
        </aside>
      </div>
    </section>
  );
}