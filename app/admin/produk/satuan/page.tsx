"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Unit = { id: string; name: string; abbreviation: string };

const storageKey = "toman-units-v1";
const initialUnits: Unit[] = [
  { id: "unit-1", name: "Pieces", abbreviation: "pcs" },
  { id: "unit-2", name: "Botol", abbreviation: "botol" },
  { id: "unit-3", name: "Kotak", abbreviation: "kotak" },
  { id: "unit-4", name: "Karung", abbreviation: "karung" },
];

function readUnits(): Unit[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Unit[];
    }
  } catch {
    // Use the demo units if browser storage is unavailable.
  }
  return initialUnits;
}

export default function SatuanPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setUnits(readUnits());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function persist(next: Unit[]) {
    setUnits(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function resetForm() {
    setName("");
    setAbbreviation("");
    setEditingId(null);
    setError("");
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedAbbreviation = abbreviation.trim();
    if (!trimmedName || !trimmedAbbreviation) {
      setError("Nama dan singkatan satuan wajib diisi.");
      return;
    }
    if (units.some((unit) => unit.id !== editingId && unit.abbreviation.toLowerCase() === trimmedAbbreviation.toLowerCase())) {
      setError("Singkatan satuan sudah digunakan.");
      return;
    }

    const next = editingId
      ? units.map((unit) => unit.id === editingId ? { ...unit, name: trimmedName, abbreviation: trimmedAbbreviation } : unit)
      : [...units, { id: crypto.randomUUID(), name: trimmedName, abbreviation: trimmedAbbreviation }];
    persist(next);
    resetForm();
  }

  function edit(unit: Unit) {
    setEditingId(unit.id);
    setName(unit.name);
    setAbbreviation(unit.abbreviation);
    setError("");
  }

  function remove(unit: Unit) {
    if (!window.confirm(`Hapus satuan ${unit.name}?`)) return;
    persist(units.filter((item) => item.id !== unit.id));
    if (editingId === unit.id) resetForm();
  }

  const filteredUnits = units.filter((unit) => `${unit.name} ${unit.abbreviation}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <p className="text-sm font-medium text-blue-600">KATALOG TOKO</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Satuan produk</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola satuan yang digunakan untuk mencatat produk.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <form onSubmit={save} className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">{editingId ? "Edit satuan" : "Tambah satuan"}</h2>
            <p className="mt-1 text-sm text-gray-500">Masukkan nama dan singkatan satuan.</p>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">Nama satuan
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Pieces" maxLength={60} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Singkatan
            <Input value={abbreviation} onChange={(event) => setAbbreviation(event.target.value)} placeholder="Contoh: pcs" maxLength={20} />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit"><Plus size={16} className="mr-2" />{editingId ? "Simpan perubahan" : "Tambah satuan"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}><X size={16} className="mr-2" />Batal</Button>}
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-5">
            <div><h2 className="font-semibold">Daftar satuan</h2><p className="mt-1 text-sm text-gray-500">{units.length} satuan terdaftar</p></div>
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input aria-label="Cari satuan" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau singkatan" className="pl-9" /></div>
          </div>
          {filteredUnits.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">Satuan tidak ditemukan.</p> : <ul className="divide-y divide-gray-100">
            {filteredUnits.map((unit) => <li key={unit.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div><p className="font-medium">{unit.name}</p><p className="mt-1 text-sm text-gray-500">Singkatan: {unit.abbreviation}</p></div>
              <div className="flex gap-1"><Button type="button" variant="ghost" size="sm" aria-label={`Edit ${unit.name}`} onClick={() => edit(unit)}><Pencil size={15} /></Button><Button type="button" variant="ghost" size="sm" aria-label={`Hapus ${unit.name}`} onClick={() => remove(unit)}><Trash2 size={15} className="text-red-500" /></Button></div>
            </li>)}
          </ul>}
        </div>
      </div>
    </section>
  );
}
