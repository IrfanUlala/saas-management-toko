"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

type Customer = { _id: Id<"customers">; name: string; phone?: string; email?: string; address?: string };
const empty = { name: "", phone: "", email: "", address: "" };

export default function CustomersPage() {
  const customers = useQuery(api.customers.list) ?? [];
  const create = useMutation(api.customers.create);
  const update = useMutation(api.customers.update);
  const deactivate = useMutation(api.customers.deactivate);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const visible = customers.filter((c) => `${c.name} ${c.phone ?? ""} ${c.email ?? ""} ${c.address ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const startEdit = (customer: Customer) => { setEditing(customer); setForm({ name: customer.name, phone: customer.phone ?? "", email: customer.email ?? "", address: customer.address ?? "" }); setError(""); };
  const reset = () => { setEditing(null); setForm(empty); setError(""); };
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const values = { name: form.name, phone: form.phone || undefined, email: form.email || undefined, address: form.address || undefined };
      if (editing) await update({ customerId: editing._id, ...values }); else await create(values);
      reset();
    } catch (e) { setError(e instanceof Error ? e.message : "Tidak dapat menyimpan pelanggan."); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
    <div><h1 className="text-2xl font-bold">Kelola pelanggan</h1><p className="mt-1 text-sm text-gray-500">Simpan informasi pelanggan untuk transaksi berikutnya.</p></div>
    <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">{editing ? "Ubah pelanggan" : "Tambah pelanggan"}</h2>
      <div className="grid gap-3 sm:grid-cols-2"><Input required maxLength={120} placeholder="Nama pelanggan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input maxLength={40} placeholder="Nomor HP" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Input maxLength={120} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Input maxLength={500} placeholder="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2"><Button disabled={busy} type="submit"><Plus size={16} className="mr-1" />{editing ? "Simpan perubahan" : "Tambah pelanggan"}</Button>{editing && <Button type="button" variant="ghost" onClick={reset}><X size={16} className="mr-1"/>Batal</Button>}</div>
    </form>
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm"><div className="flex items-center gap-2 border-b p-4"><Search size={16} className="text-gray-400"/><Input aria-label="Cari pelanggan" placeholder="Cari nama, nomor HP, atau email" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {visible.length ? <ul className="divide-y">{visible.map((customer) => <li key={customer._id} className="flex items-start justify-between gap-3 p-4"><div className="min-w-0"><p className="font-semibold">{customer.name}</p><p className="mt-1 text-sm text-gray-500">{[customer.phone, customer.email, customer.address].filter(Boolean).join(" · ") || "Belum ada informasi kontak"}</p></div><div className="flex shrink-0 gap-1"><Button aria-label={`Ubah ${customer.name}`} variant="ghost" size="sm" onClick={() => startEdit(customer)}><Pencil size={16}/></Button><Button aria-label={`Nonaktifkan ${customer.name}`} variant="ghost" size="sm" className="text-red-600" onClick={() => void deactivate({ customerId: customer._id })}><Trash2 size={16}/></Button></div></li>)}</ul> : <p className="p-8 text-center text-sm text-gray-500">Belum ada pelanggan.</p>}</section>
  </div>;
}
