"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Archive, ArchiveRestore, Pencil, Plus, Search, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

export default function KategoriPage() {
  return (
    <CatalogStoreGate>
      <CategoryManager />
    </CatalogStoreGate>
  );
}

function CategoryManager() {
  const categories = useQuery(api.catalog.listCategories, {});
  const createCategory = useMutation(api.catalog.createCategory);
  const updateCategory = useMutation(api.catalog.updateCategory);
  const setCategoryStatus = useMutation(api.catalog.setCategoryStatus);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (categories ?? []).filter((category) =>
      `${category.name} ${category.description ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [categories, query]);

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCategory({
          categoryId: editingId,
          name,
          description: description || undefined,
        });
      } else {
        await createCategory({
          name,
          description: description || undefined,
        });
      }
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Kategori gagal disimpan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(
    categoryId: Id<"categories">,
    status: "active" | "inactive",
  ) {
    setError("");
    try {
      await setCategoryStatus({
        categoryId,
        status: status === "active" ? "inactive" : "active",
      });
      if (editingId === categoryId) resetForm();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Status kategori gagal diubah.",
      );
    }
  }

  function edit(category: NonNullable<typeof categories>[number]) {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description ?? "");
    setError("");
  }

  if (categories === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-sm text-gray-500">
        Memuat kategori...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <p className="text-sm font-medium text-blue-600">KATALOG TOKO</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Kategori produk
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelompokkan produk agar lebih mudah dikelola dan ditemukan.
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
              {editingId ? "Edit kategori" : "Tambah kategori"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Masukkan nama dan keterangan kategori.
            </p>
          </div>
          <Input
            label="Nama kategori"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Perlengkapan rumah"
            maxLength={60}
            required
          />
          <Input
            label="Keterangan (opsional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Deskripsi singkat kategori"
            maxLength={120}
          />
          <div className="flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              <Plus size={16} className="mr-2" />
              {editingId ? "Simpan perubahan" : "Tambah kategori"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X size={16} className="mr-2" />
                Batal
              </Button>
            )}
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-5">
            <div>
              <h2 className="font-semibold">Daftar kategori</h2>
              <p className="mt-1 text-sm text-gray-500">
                {categories.length} kategori terdaftar (maksimal 200 ditampilkan)
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                aria-label="Cari kategori"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau keterangan"
                className="pl-9"
              />
            </div>
          </div>
          {filteredCategories.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              {query ? "Kategori tidak ditemukan." : "Belum ada kategori."}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <li
                  key={category._id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{category.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {category.description || "Tidak ada keterangan"}
                    </p>
                    {category.status === "inactive" && (
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => edit(category)}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`${category.status === "active" ? "Nonaktifkan" : "Aktifkan"} ${category.name}`}
                      onClick={() =>
                        void toggleStatus(category._id, category.status)
                      }
                    >
                      {category.status === "active" ? (
                        <Archive size={15} className="text-amber-600" />
                      ) : (
                        <ArchiveRestore size={15} className="text-green-700" />
                      )}
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
