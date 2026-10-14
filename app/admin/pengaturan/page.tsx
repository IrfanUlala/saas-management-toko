"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Boxes, LogOut, Ruler } from "lucide-react";

const sections = [
  { title: "Pengaturan toko", description: "Nama dan informasi kontak usaha", href: "#toko", icon: BookOpen },
  { title: "Kategori produk", description: "Kelola kategori barang", href: "/admin/produk/kategori", icon: Boxes },
  { title: "Satuan produk", description: "Atur satuan dan singkatan", href: "/admin/produk/satuan", icon: Ruler },
] as const;

export default function SettingsPage() {
  return <CatalogStoreGate><SettingsContent /></CatalogStoreGate>;
}

function SettingsContent() {
  const store = useQuery(api.catalog.currentStore, {});
  const updateStore = useMutation(api.catalog.updateStore);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [form, setForm] = useState({ name: "", businessType: "", phone: "", email: "", address: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);


  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setStatus(""); setError("");
    try {
      await updateStore({ name: form.name || store?.name || "", businessType: form.businessType || store?.businessType, phone: form.phone || store?.phone, email: form.email || store?.email, address: form.address || store?.address });
      setStatus("Informasi toko berhasil disimpan.");
    } catch (e) { setError(e instanceof Error ? e.message : "Pengaturan toko gagal disimpan."); }
    finally { setSaving(false); }
  }

  async function logout() {
    setLoggingOut(true);
    try { await signOut(); router.replace("/auth/login"); }
    finally { setLoggingOut(false); }
  }

  if (!isAuthenticated || !store) return null;

  return <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
    <header><h1 className="text-2xl font-bold">Pengaturan</h1><p className="mt-1 text-sm text-gray-500">Kelola informasi dan data pendukung toko Anda.</p></header>
    <nav aria-label="Sub menu pengaturan" className="grid gap-3 sm:grid-cols-2">{sections.map(({ title, description, href, icon: Icon }) => <Link key={title} href={href} className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:border-primary/40 hover:bg-green-50"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-primary"><Icon size={20}/></span><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-gray-500">{description}</span></span></Link>)}</nav>
    <form id="toko" onSubmit={save} className="space-y-4 rounded-xl border bg-white p-4 shadow-sm sm:p-6"><div><h2 className="font-semibold">Informasi toko</h2><p className="mt-1 text-sm text-gray-500">Informasi ini dapat digunakan pada struk dan tampilan toko.</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><Input label="Nama toko" required minLength={2} maxLength={80} value={form.name || store?.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })}/><Input label="Jenis usaha" maxLength={80} placeholder="Contoh: Kelontong" value={form.businessType || store?.businessType || ""} onChange={(e) => setForm({ ...form, businessType: e.target.value })}/><Input label="Nomor HP" type="tel" maxLength={40} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/><Input label="Email" type="email" maxLength={120} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/><div className="sm:col-span-2"><label htmlFor="store-address" className="mb-1 block text-sm font-medium">Alamat toko</label><textarea id="store-address" maxLength={500} rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-100"/></div></div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{status && <p role="status" className="text-sm text-green-700">{status}</p>}<Button type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan pengaturan toko"}</Button>
    </form>
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-100 bg-white p-4 shadow-sm"><div><h2 className="font-semibold">Keluar dari akun</h2><p className="mt-1 text-sm text-gray-500">Akhiri sesi Anda di perangkat ini.</p></div><Button type="button" variant="outline" disabled={loggingOut} onClick={() => void logout()} className="border-red-200 text-red-600 hover:bg-red-50"><LogOut size={16} className="mr-2"/>{loggingOut ? "Keluar…" : "Logout"}</Button></section>
  </main>;
}
