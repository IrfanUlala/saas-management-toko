"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Archive,
  ArchiveRestore,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

export default function SatuanPage() {
  return (
    <CatalogStoreGate>
      <UnitManager />
    </CatalogStoreGate>
  );
}

function UnitManager() {
  const units = useQuery(api.catalog.listUnits, {});
  const createUnit = useMutation(api.catalog.createUnit);
  const updateUnit = useMutation(api.catalog.updateUnit);
  const setUnitStatus = useMutation(api.catalog.setUnitStatus);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [editingId, setEditingId] = useState<Id<"units"> | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUnits = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (units ?? []).filter((unit) =>
      `${unit.name} ${unit.abbreviation}`.toLowerCase().includes(term),
    );
  }, [units, query]);

  function resetForm() {
    setName("");
    setAbbreviation("");
    setEditingId(null);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateUnit({ unitId: editingId, name, abbreviation });
      } else {
        await createUnit({ name, abbreviation });
      }
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Satuan gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(
    unitId: Id<"units">,
    status: "active" | "inactive",
  ) {
    setError("");
    try {
      await setUnitStatus({
        unitId,
        status: status === "active" ? "inactive" : "active",
      });
      if (editingId === unitId) resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Status satuan gagal diubah.",
      );
    }
  }

  function edit(unit: NonNullable<typeof units>[number]) {
    setEditingId(unit._id);
    setName(unit.name);
    setAbbreviation(unit.abbreviation);
    setError("");
  }

  if (units === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-sm text-gray-500">
        Memuat satuan...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <p className="text-sm font-medium text-blue-600">KATALOG TOKO</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Satuan dasar produk
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola satuan yang digunakan untuk mencatat produk dan stok.
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
              {editingId ? "Edit satuan" : "Tambah satuan"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Masukkan nama dan singkatan satuan.
            </p>
          </div>
          <Input
            label="Nama satuan"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Pieces"
            maxLength={60}
            required
          />
          <Input
            label="Singkatan"
            value={abbreviation}
            onChange={(event) => setAbbreviation(event.target.value)}
            placeholder="Contoh: pcs"
            maxLength={20}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              <Plus size={16} className="mr-2" />
              {editingId ? "Simpan perubahan" : "Tambah satuan"}
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
              <h2 className="font-semibold">Daftar satuan</h2>
              <p className="mt-1 text-sm text-gray-500">
                {units.length} satuan terdaftar (maksimal 200 ditampilkan)
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                aria-label="Cari satuan"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau singkatan"
                className="pl-9"
              />
            </div>
          </div>
          {filteredUnits.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              {query ? "Satuan tidak ditemukan." : "Belum ada satuan."}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredUnits.map((unit) => (
                <li
                  key={unit._id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{unit.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Singkatan: {unit.abbreviation}
                    </p>
                    {unit.status === "inactive" && (
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
                      aria-label={`Edit ${unit.name}`}
                      onClick={() => edit(unit)}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`${unit.status === "active" ? "Nonaktifkan" : "Aktifkan"} ${unit.name}`}
                      onClick={() => void toggleStatus(unit._id, unit.status)}
                    >
                      {unit.status === "active" ? (
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
