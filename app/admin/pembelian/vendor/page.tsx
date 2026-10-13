"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

export default function VendorPage() {
  return (
    <CatalogStoreGate>
      <VendorManager />
    </CatalogStoreGate>
  );
}

function VendorManager() {
  const { isAuthenticated } = useConvexAuth();
  const vendors = useQuery(api.vendors.list, isAuthenticated ? {} : "skip");
  const createVendor = useMutation(api.vendors.create);
  const updateVendor = useMutation(api.vendors.update);
  const deactivateVendor = useMutation(api.vendors.deactivate);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<Id<"vendors"> | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setContact("");
    setNote("");
    setEditingId(null);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const args = {
        name,
        contact: contact || undefined,
        note: note || undefined,
      };
      if (editingId) {
        await updateVendor({ ...args, vendorId: editingId });
      } else {
        await createVendor(args);
      }
      resetForm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Vendor gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deactivate(
    vendorId: Id<"vendors">,
    vendorName: string,
  ) {
    if (!window.confirm(`Nonaktifkan vendor ${vendorName}?`)) return;
    setError("");
    try {
      await deactivateVendor({ vendorId });
      if (editingId === vendorId) resetForm();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Vendor gagal dinonaktifkan.",
      );
    }
  }

  function edit(vendor: NonNullable<typeof vendors>[number]) {
    setEditingId(vendor._id);
    setName(vendor.name);
    setContact(vendor.phone ?? "");
    setNote(vendor.note ?? "");
    setError("");
  }

  if (vendors === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-sm text-gray-500">
        Memuat vendor...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <Link
          href="/admin/pembelian/tambah"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Kembali ke pembelian
        </Link>
        <p className="mt-5 text-sm font-medium text-blue-600">PENGADAAN STOK</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Kelola vendor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Data vendor tersimpan di Convex dan dapat digunakan pada transaksi
          pembelian.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <form
          onSubmit={save}
          className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="font-semibold">
              {editingId ? "Edit vendor" : "Tambah vendor"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Masukkan informasi rekanan atau pemasok.
            </p>
          </div>
          <Input
            label="Nama vendor"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: PT Sumber Pangan"
            maxLength={80}
          />
          <Input
            label="Kontak (opsional)"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder="Nomor telepon atau email"
            maxLength={80}
          />
          <Input
            label="Catatan (opsional)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Contoh: tempo 14 hari"
            maxLength={120}
          />
          <div className="flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              <Plus size={16} className="mr-2" />
              {editingId ? "Simpan perubahan" : "Tambah vendor"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X size={16} className="mr-2" /> Batal
              </Button>
            )}
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold">Daftar vendor</h2>
            <p className="mt-1 text-sm text-gray-500">
              {vendors.length} vendor terdaftar
            </p>
          </div>
          {vendors.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              Belum ada vendor. Tambahkan vendor untuk digunakan saat mencatat
              pembelian.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <li
                  key={vendor._id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{vendor.name}</p>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {[vendor.phone, vendor.note].filter(Boolean).join(" · ") ||
                        "Tidak ada kontak atau catatan"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${vendor.name}`}
                      onClick={() => edit(vendor)}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Nonaktifkan ${vendor.name}`}
                      onClick={() => void deactivate(vendor._id, vendor.name)}
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
