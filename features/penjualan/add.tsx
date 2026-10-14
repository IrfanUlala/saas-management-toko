"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CameraBarcode from "@/components/camera-barcode";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";
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

type Product = { id: Id<"products">; name: string; code: string; barcode: string; price: number; stock: number };
type CartItem = { product: Product; quantity: number };

const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export default function AddFeature() {
  return (
    <CatalogStoreGate>
      <PointOfSale />
    </CatalogStoreGate>
  );
}

function PointOfSale() {
  const { isAuthenticated } = useConvexAuth();
  const productRecords = useQuery(
    api.products.list,
    isAuthenticated ? {} : "skip",
  );
  const checkoutSale = useMutation(api.sales.checkout);
  const customerRecords = useQuery(api.customers.list, isAuthenticated ? {} : "skip");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | null>(null);
  const [showCustomerMatches, setShowCustomerMatches] = useState(false);
  const customers = customerRecords ?? [];
  const customerMatches = customers.filter((customer) => `${customer.name} ${customer.phone ?? ""} ${customer.email ?? ""}`.toLowerCase().includes(customerSearch.trim().toLowerCase()));
  const products = useMemo(
    () =>
      (productRecords ?? []).map(({ product, stock }) => ({
        id: product._id,
        name: product.name,
        code: product.sku,
        barcode: product.barcode ?? "",
        price: product.salePrice,
        stock,
      })),
    [productRecords],
  );
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recent, setRecent] = useState<Id<"products">[]>([]);
  const [showRecent, setShowRecent] = useState(true);
  const [showMatches, setShowMatches] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [paid, setPaid] = useState("");
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [printReceipt, setPrintReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bankTransfer" | "debitCard" | "creditCard" | "qris" | "eWallet" | "debt">("cash");
  const [customerName, setCustomerName] = useState("");
  const [saleNote, setSaleNote] = useState("");
  const [receipt, setReceipt] = useState<{ number: string; customer: string; lines: CartItem[]; subtotal: number; paid: number; change: number; method: string; date: Date } | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) =>
      `${p.name} ${p.code} ${p.barcode}`.toLowerCase().includes(term)
    );
  }, [query, products]);

  const totalItems = cart.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const payment = Number(paid) || 0;
  const diff = payment - subtotal;
  const isDebt = paymentMethod === "debt";
  const hasDebt = payment < subtotal;
  const hasNamedCustomer = Boolean(selectedCustomerId && customerName.trim());
  const canPay = cart.length > 0 && (isDebt || payment >= subtotal) && (!hasDebt || hasNamedCustomer);

  // Saran nominal cepat: uang pas + pembulatan
  const suggestions = useMemo(() => {
    if (subtotal <= 0) return [] as number[];
    const roundUp = (step: number) => Math.ceil(subtotal / step) * step;
    const set = new Set<number>([subtotal, roundUp(1000), roundUp(5000), roundUp(10000), roundUp(50000)]);
    return Array.from(set).sort((a, b) => a - b).slice(0, 4);
  }, [subtotal]);

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
    const existing = cart.find((item) => item.product.id === product.id);
    if (product.stock <= 0 || (existing && existing.quantity >= product.stock)) {
      setNotice({ type: "error", text: `Stok ${product.name} habis.` });
      return false;
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
    return true;
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

  async function checkout() {
    const tendered = payment;
    if (tendered < subtotal && !hasNamedCustomer) {
      setNotice({ type: "error", text: "Pilih pelanggan bernama sebelum mencatat hutang." });
      return;
    }
    const changeValue = tendered - subtotal;
    const completedCart = cart.map((item) => ({ ...item }));
    const completedSubtotal = subtotal;
    const completedPayment = payment;
    const completedCustomer = customerName.trim() || "Pelanggan umum";
    setIsSubmitting(true);
    try {
      const receiptNumber = await checkoutSale({
        lines: cart.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
        amountTendered: tendered,
        method: isDebt ? "cash" : paymentMethod,
        customerName: completedCustomer,
        customerId: selectedCustomerId ?? undefined,
        note: saleNote,
        soldAt: new Date(`${saleDate}T12:00:00`).getTime(),
      });
      if (printReceipt) setReceipt({ number: receiptNumber, customer: completedCustomer, lines: completedCart, subtotal: completedSubtotal, paid: completedPayment, change: paymentMethod === "cash" ? completedPayment - completedSubtotal : 0, method: paymentMethod, date: new Date(`${saleDate}T12:00:00`) });
      setNotice({
        type: "success",
        text: `Penjualan berhasil · ${currency(subtotal)}${changeValue > 0 ? ` · Kembalian ${currency(changeValue)}` : ""}`,
      });
      setCart([]);
      setPaid("");
      setPaymentMethod("cash");
      setSelectedCustomerId(null);
      setCustomerSearch("");
      setCustomerName("");
      setSaleNote("");
      setQuery("");
      inputRef.current?.focus();
    } catch (caught) {
      setNotice({
        type: "error",
        text:
          caught instanceof Error ? caught.message : "Penjualan gagal disimpan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function setQuickPaid(amount: number) {
    setPaid(String(amount));
  }

  if (productRecords === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-gray-500">
        Memuat produk...
      </div>
    );
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
                    if (addProduct(product)) {
                      setNotice({ type: "success", text: `${product.name} x1 ditambahkan.` });
                    }
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
                    className="space-y-3 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:space-y-0"
                  >
                    <div className="min-w-0 sm:flex-1">
                      <p className="wrap-break-word text-sm font-semibold leading-5 text-gray-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Kode {product.code} <span aria-hidden="true">·</span> {currency(product.price)} / pcs
                      </p>
                      <p className={`mt-1 text-xs ${quantity >= product.stock ? "font-medium text-orange-600" : "text-gray-500"}`}>
                        Stok tersedia: {product.stock} pcs
                        {quantity >= product.stock && " · Batas stok tercapai"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="inline-flex shrink-0 items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0"
                          aria-label={`Kurangi ${product.name}`}
                          onClick={() => updateQuantity(product.id, -1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="min-w-9 px-1 text-center text-sm font-semibold tabular-nums" aria-label={`Jumlah ${quantity} pcs`}>
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0"
                          aria-label={`Tambah ${product.name}`}
                          disabled={quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      <div className="min-w-0 flex-1 text-right sm:min-w-28 sm:flex-none">
                        <p className="text-[11px] text-gray-500 sm:hidden">Total item</p>
                        <p className="text-sm font-bold tabular-nums text-gray-900">
                          {currency(product.price * quantity)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 shrink-0 p-0"
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="space-y-1 text-sm font-medium">
              Nama pelanggan
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); setCustomerName(e.target.value); setSelectedCustomerId(null); setShowCustomerMatches(true); }} onFocus={() => setShowCustomerMatches(true)} onKeyDown={(e) => { if (e.key === "Escape") setShowCustomerMatches(false); if (e.key === "Enter" && customerMatches.length === 1) { e.preventDefault(); setSelectedCustomerId(customerMatches[0]._id); setCustomerName(customerMatches[0].name); setCustomerSearch(customerMatches[0].name); setShowCustomerMatches(false); } }} placeholder="Cari nama / nomor HP pelanggan" maxLength={120} className="pl-9" autoComplete="off" />
                {showCustomerMatches && customerSearch.trim() && <span className="absolute z-30 mt-1 block max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">{customerMatches.length ? customerMatches.map((customer) => <button key={customer._id} type="button" onClick={() => { setSelectedCustomerId(customer._id); setCustomerName(customer.name); setCustomerSearch(customer.name); setShowCustomerMatches(false); }} className="block w-full border-b px-3 py-2 text-left last:border-0 hover:bg-blue-50"><span className="block">{customer.name}</span><span className="text-xs font-normal text-gray-500">{customer.phone || customer.email || ""}</span></button>) : <span className="block p-3 text-xs font-normal text-gray-500">Pelanggan tidak ditemukan. <a href="/admin/pelanggan" className="text-blue-600 underline">Kelola pelanggan</a></span>}</span>}
              </span>
              {!customerSearch && <a href="/admin/pelanggan" className="block text-xs font-normal text-blue-600 hover:underline">Kelola pelanggan</a>}
            </label>
            <label className="space-y-1 text-sm font-medium">
              Metode pembayaran
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm">
                <option value="cash">Tunai</option><option value="qris">QRIS</option><option value="bankTransfer">Transfer bank</option><option value="debitCard">Kartu debit</option><option value="creditCard">Kartu kredit</option><option value="eWallet">Dompet digital</option><option value="debt">Hutang / bayar nanti</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium">
            Catatan transaksi
            <Input value={saleNote} onChange={(e) => setSaleNote(e.target.value)} placeholder="Opsional" maxLength={500} />
          </label>

          <div className="space-y-2">
            <label htmlFor="sale-date" className="block text-sm font-medium">Tanggal penjualan</label>
            <Input id="sale-date" type="date" value={saleDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setSaleDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="paid" className="block text-sm font-medium">
              {isDebt ? "Pembayaran awal (opsional)" : paymentMethod === "cash" ? "Uang diterima" : "Nominal pembayaran"}
            </label>
            <Input
              id="paid"
              type="number"
              inputMode="numeric"
              min="0"
              max={subtotal}
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder={isDebt ? "Kosongkan jika belum membayar" : "Masukkan nominal"}
              className="h-11 text-right text-base font-semibold tabular-nums"
            />
            {isDebt && <p className="text-xs text-amber-700">Sisa {currency(Math.max(subtotal - payment, 0))} akan dicatat sebagai hutang.</p>}
            {!isDebt && suggestions.length > 0 && (
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
            <span>{cart.length === 0 ? "Kembalian" : diff >= 0 ? "Kembalian" : isDebt ? "Sisa hutang" : "Kurang bayar"}</span>
            <span className="tabular-nums">
              {cart.length === 0 ? currency(0) : currency(Math.abs(diff))}
            </span>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={printReceipt} onChange={(e) => setPrintReceipt(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            Cetak struk setelah penjualan
          </label>
          {hasDebt && !hasNamedCustomer && <p className="text-xs text-red-600">Pilih pelanggan yang sudah terdaftar dan memiliki nama untuk mencatat hutang.</p>}
          <Button type="button" className="h-11 w-full" disabled={!canPay || isSubmitting || !saleDate} isLoading={isSubmitting} onClick={() => void checkout()}>
            <Check size={16} className="mr-1" /> Selesaikan penjualan
          </Button>
          <p className="text-center text-xs text-gray-500">
            {canPay
              ? "Tekan untuk menyelesaikan transaksi."
              : hasDebt && !hasNamedCustomer
                ? "Hutang hanya dapat dicatat untuk pelanggan bernama."
                : "Tombol aktif setelah pembayaran mencukupi atau metode hutang dipilih."}
          </p>
        </aside>
      </div>

      {receipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Struk transaksi">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl print:max-w-none print:shadow-none">
            <div id="sale-receipt" className="space-y-3 text-sm text-gray-900">
              <div className="text-center"><h2 className="text-lg font-bold">Struk Penjualan</h2><p>{receipt.number}</p><p>{receipt.date.toLocaleString("id-ID")}</p></div>
              <div className="border-y border-dashed py-2"><p>Pelanggan: {receipt.customer}</p>{receipt.lines.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-2"><span>{product.name} × {quantity}</span><span>{currency(product.price * quantity)}</span></div>)}</div>
              <div className="space-y-1"><div className="flex justify-between font-bold"><span>Total</span><span>{currency(receipt.subtotal)}</span></div><div className="flex justify-between"><span>Dibayar ({receipt.method})</span><span>{currency(receipt.paid)}</span></div>{receipt.method === "cash" && <div className="flex justify-between"><span>Kembalian</span><span>{currency(receipt.change)}</span></div>}</div>
            </div>
            <div className="mt-5 flex gap-2 print:hidden"><Button className="flex-1" onClick={() => window.print()}>Cetak struk</Button><Button variant="ghost" onClick={() => setReceipt(null)}>Tutup</Button></div>
          </div>
        </div>
      )}

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