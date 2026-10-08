"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CameraBarcode from "@/components/camera-barcode";
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

type Product = { id: string; name: string; code: string; barcode: string; price: number; stock: number };
type CartItem = { product: Product; quantity: number };

const products: Product[] = [
  { id: "P001", name: "Kecap manis Bango 135 ml", code: "P001", barcode: "8999999501012", price: 8500, stock: 24 },
  { id: "P002", name: "Minyak goreng 1 L", code: "P002", barcode: "8999999501029", price: 18000, stock: 16 },
  { id: "P003", name: "Mi instan goreng", code: "P003", barcode: "8999999501036", price: 3500, stock: 48 },
  { id: "P004", name: "Gula pasir 1 kg", code: "P004", barcode: "8999999501043", price: 16500, stock: 12 },
  { id: "P005", name: "Susu UHT 1 L", code: "P005", barcode: "8999999501050", price: 19000, stock: 10 },
  { id: "P006", name: "Beras 5 kg", code: "P006", barcode: "8999999501067", price: 72000, stock: 8 },
];

const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export default function AddFeature() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recent, setRecent] = useState(["P001", "P003", "P002"]);
  const [showRecent, setShowRecent] = useState(true);
  const [showMatches, setShowMatches] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [paid, setPaid] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) =>
      `${p.name} ${p.code} ${p.barcode}`.toLowerCase().includes(term)
    );
  }, [query]);

  const totalItems = cart.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const payment = Number(paid) || 0;
  const diff = payment - subtotal;
  const canPay = cart.length > 0 && payment >= subtotal;

  // Saran nominal cepat: uang pas + pembulatan
  const suggestions = useMemo(() => {
    if (subtotal <= 0) return [] as number[];
    const roundUp = (step: number) => Math.ceil(subtotal / step) * step;
    const set = new Set<number>([subtotal, roundUp(1000), roundUp(5000), roundUp(10000), roundUp(50000)]);
    return Array.from(set).sort((a, b) => a - b).slice(0, 4);
  }, [subtotal]);

  // Reset highlight setiap daftar berubah
  useEffect(() => setHighlighted(0), [query]);

  // Tutup panel "sering dicari" bila klik di luar
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (recentRef.current && !recentRef.current.contains(e.target as Node)) setShowRecent(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Auto dismiss notifikasi
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2800);
    return () => clearTimeout(t);
  }, [notice]);

  // Pastikan item yang di-highlight tetap terlihat
  useEffect(() => {
    matchesRef.current
      ?.querySelector<HTMLElement>(`[data-index="${highlighted}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function addProduct(product: Product, clearInput = true) {
    if (product.stock <= 0) {
      setNotice({ type: "error", text: `Stok ${product.name} habis.` });
      return;
    }
    setCart((items) => {
      const found = items.find((i) => i.product.id === product.id);
      if (found) {
        if (found.quantity >= product.stock) return items;
        return items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    setRecent((ids) => [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 6));
    setShowMatches(false);
    if (clearInput) setQuery("");
    inputRef.current?.focus();
  }

  function updateQuantity(id: string, change: number) {
    setCart((items) =>
      items
        .map((item) => {
          if (item.product.id !== id) return item;
          const next = item.quantity + change;
          if (next <= 0) return null;
          return { ...item, quantity: Math.min(next, item.product.stock) };
        })
        .filter((i): i is CartItem => i !== null)
    );
  }

  function removeItem(id: string) {
    setCart((items) => items.filter((i) => i.product.id !== id));
  }

  function submitSearch() {
    const term = query.trim().toLowerCase();
    if (!term) return;

    // 1. Cocok kode/barcode persis
    const exact = products.find(
      (p) => p.code.toLowerCase() === term || p.barcode === term
    );
    if (exact) return addProduct(exact);

    // 2. Hanya satu hasil
    if (matches.length === 1) return addProduct(matches[0]);

    // 3. Ada beberapa hasil & dropdown terbuka — pilih yang di-highlight
    if (matches.length > 1 && showMatches && matches[highlighted]) {
      return addProduct(matches[highlighted]);
    }

    // 4. Tampilkan dropdown agar user memilih
    setShowMatches(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
      setQuery("");
    }
  }

  function checkout() {
    const changeValue = payment - subtotal;
    setNotice({
      type: "success",
      text: `Penjualan berhasil · ${currency(subtotal)}${changeValue > 0 ? ` · Kembalian ${currency(changeValue)}` : ""
        }`,
    });
    setCart([]);
    setPaid("");
    setQuery("");
    inputRef.current?.focus();
  }

  function setQuickPaid(amount: number) {
    setPaid(String(amount));
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">TRANSAKSI BARU</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Tambah penjualan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cari barang, masukkan ke keranjang, lalu selesaikan pembayaran.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <ShoppingCart size={17} /> {totalItems} barang
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Kolom kiri */}
        <div className="space-y-5">
          {/* Pencarian */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <label htmlFor="identifier" className="text-sm font-semibold">
              Cari atau scan barang
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Gunakan nama, kode produk, atau barcode. Gunakan ↑/↓ dan Enter untuk memilih.
            </p>

            <div className="mt-3 flex items-start gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                ref={inputRef}
                id="identifier"
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
                onKeyDown={handleKeyDown}
                onFocus={() => query && setShowMatches(true)}
                autoComplete="off"
                placeholder="Nama / kode / barcode barang"
                className="pl-9 border-gray-200 shadow-none focus-visible:ring-2 focus-visible:ring-blue-100"
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

              {showMatches && matches.length > 0 && (
                <div
                  ref={matchesRef}
                  className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5"
                >
                  {matches.map((product, index) => {
                    const isActive = index === highlighted;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setHighlighted(index)}
                        onClick={() => addProduct(product)}
                        className={`flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 ${isActive ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{product.name}</span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Barcode size={13} /> {product.barcode} · Stok {product.stock}
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-sm font-semibold">
                          {currency(product.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {showMatches && query && matches.length === 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white p-4 text-sm text-gray-500 shadow-lg">
                  Barang tidak ditemukan. Periksa nama, kode, atau barcode.
                </div>
                )}
              </div>
              <CameraBarcode
                onChange={(value) => {
                  setQuery(value);
                  const product = products.find((item) => item.barcode === value || item.code.toLowerCase() === value.toLowerCase());
                  if (product) {
                    addProduct(product);
                  } else {
                    setShowMatches(true);
                    inputRef.current?.focus();
                  }
                }}
              />
            </div>
          </div>

          {/* Barang sering dicari */}
          <div
            ref={recentRef}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowRecent((v) => !v)}
              aria-expanded={showRecent}
            >
              <span>
                <span className="block text-sm font-semibold">Barang yang sering Anda cari</span>
                <span className="mt-1 block text-xs text-gray-500">
                  Pilih untuk menambahkan satu barang ke transaksi.
                </span>
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${showRecent ? "rotate-180" : ""}`}
              />
            </button>

            {showRecent && (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {recent
                  .map((id) => products.find((p) => p.id === id))
                  .filter((p): p is Product => Boolean(p))
                  .map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() => addProduct(product, false)}
                      className="rounded-lg border border-gray-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="block truncate text-sm font-medium">{product.name}</span>
                      <span className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>{currency(product.price)}</span>
                        <span>Stok {product.stock}</span>
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Keranjang */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4">
              <div>
                <h2 className="font-semibold">Keranjang belanja</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {cart.length
                    ? `${cart.length} jenis · ${totalItems} pcs`
                    : "Barang yang ditambahkan akan tampil di sini."}
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
                Keranjang masih kosong. Cari atau pilih barang untuk memulai.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cart.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {product.code} · {currency(product.price)} / pcs ·{" "}
                        <span
                          className={
                            quantity >= product.stock ? "font-medium text-orange-600" : ""
                          }
                        >
                          Stok {product.stock}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Kurangi ${product.name}`}
                        onClick={() => updateQuantity(product.id, -1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Tambah ${product.name}`}
                        disabled={quantity >= product.stock}
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                      <span className="w-28 text-right text-sm font-semibold tabular-nums">
                        {currency(product.price * quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Hapus ${product.name}`}
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Ringkasan pembayaran */}
        <aside className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5 lg:sticky lg:top-6">
          <h2 className="font-semibold">Ringkasan pembayaran</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total barang</span>
              <span>{totalItems} pcs</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3 text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{currency(subtotal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="paid" className="block text-sm font-medium">
              Uang diterima
            </label>
            <Input
              id="paid"
              type="number"
              inputMode="numeric"
              min="0"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder="Masukkan nominal"
              className="h-11 text-right text-base font-semibold tabular-nums"
            />
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((amount, i) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setQuickPaid(amount)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {i === 0 ? "Uang pas" : currency(amount)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`flex items-center justify-between rounded-lg p-3 text-sm font-semibold ${cart.length === 0
              ? "bg-gray-50 text-gray-500"
              : diff >= 0
                ? "bg-green-50 text-green-700"
                : "bg-orange-50 text-orange-700"
              }`}
          >
            <span>{cart.length === 0 || diff >= 0 ? "Kembalian" : "Kurang bayar"}</span>
            <span className="tabular-nums">
              {cart.length === 0 ? currency(0) : currency(Math.abs(diff))}
            </span>
          </div>

          <Button type="button" className="h-11 w-full" disabled={!canPay} onClick={checkout}>
            <Check size={16} className="mr-1" /> Selesaikan penjualan
          </Button>
          <p className="text-center text-xs text-gray-500">
            {canPay
              ? "Tekan untuk menyelesaikan transaksi."
              : "Tombol aktif setelah pembayaran mencukupi."}
          </p>
        </aside>
      </div>

      {/* Toast */}
      {notice && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg ring-1 ${notice.type === "success"
              ? "bg-green-600 text-white ring-green-700/20"
              : "bg-red-600 text-white ring-red-700/20"
              }`}
          >
            {notice.type === "success" ? <Check size={16} /> : <X size={16} />}
            {notice.text}
          </div>
        </div>
      )}
    </section>
  );
}