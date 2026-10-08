"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; description: string };

const storageKey = "toman-categories-v1";
const initialCategories: Category[] = [
  { id: "category-1", name: "Sembako", description: "Kebutuhan pokok sehari-hari" },
  { id: "category-2", name: "Makanan", description: "Makanan dan camilan" },
  { id: "category-3", name: "Minuman", description: "Minuman kemasan dan siap minum" },
];

function readCategories(): Category[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Category[];
    }
  } catch {
    // Use demo categories if browser storage is unavailable.
  }
  return initialCategories;
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setCategories(readCategories());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function persist(next: Category[]) {
    setCategories(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
    setError("");
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    if (categories.some((category) => category.id !== editingId && category.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("Nama kategori sudah digunakan.");
      return;
    }

    const next = editingId
      ? categories.map((category) => category.id === editingId ? { ...category, name: trimmedName, description: trimmedDescription } : category)
      : [...categories, { id: crypto.randomUUID(), name: trimmedName, description: trimmedDescription }];
    persist(next);
    resetForm();
  }

  function edit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
    setError("");
  }

  function remove(category: Category) {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return;
    persist(categories.filter((item) => item.id !== category.id));
    if (editingId === category.id) resetForm();
  }

  const filteredCategories = categories.filter((category) => `${category.name} ${category.description}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <p className="text-sm font-medium text-blue-600">KATALOG TOKO</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Kategori produk</h1>
        <p className="mt-1 text-sm text-gray-500">Kelompokkan produk agar lebih mudah dikelola dan ditemukan.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <form onSubmit={save} className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">{editingId ? "Edit kategori" : "Tambah kategori"}</h2>
            <p className="mt-1 text-sm text-gray-500">Masukkan nama dan keterangan kategori.</p>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">Nama kategori
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Perlengkapan rumah" maxLength={60} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Keterangan <span className="font-normal text-gray-400">(opsional)</span>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Deskripsi singkat kategori" maxLength={120} />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit"><Plus size={16} className="mr-2" />{editingId ? "Simpan perubahan" : "Tambah kategori"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}><X size={16} className="mr-2" />Batal</Button>}
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-5">
            <div><h2 className="font-semibold">Daftar kategori</h2><p className="mt-1 text-sm text-gray-500">{categories.length} kategori terdaftar</p></div>
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input aria-label="Cari kategori" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau keterangan" className="pl-9" /></div>
          </div>
          {filteredCategories.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">Kategori tidak ditemukan.</p> : <ul className="divide-y divide-gray-100">
            {filteredCategories.map((category) => <li key={category.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div><p className="font-medium">{category.name}</p><p className="mt-1 text-sm text-gray-500">{category.description || "Tidak ada keterangan"}</p></div>
              <div className="flex gap-1"><Button type="button" variant="ghost" size="sm" aria-label={`Edit ${category.name}`} onClick={() => edit(category)}><Pencil size={15} /></Button><Button type="button" variant="ghost" size="sm" aria-label={`Hapus ${category.name}`} onClick={() => remove(category)}><Trash2 size={15} className="text-red-500" /></Button></div>
            </li>)}
          </ul>}
        </div>
      </div>
    </section>
  );
}
