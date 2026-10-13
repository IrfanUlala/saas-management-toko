"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CatalogStoreGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const store = useQuery(
    api.catalog.currentStore,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading) {
    return <CatalogLoading message="Memeriksa sesi..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Masuk untuk mengelola katalog</h1>
        <p className="mt-2 text-sm text-gray-500">
          Kategori dan satuan tersimpan di toko Anda.
        </p>
        <Link href="/auth/login" className="mt-5 inline-flex">
          <Button>Masuk</Button>
        </Link>
      </div>
    );
  }

  if (store === undefined) {
    return <CatalogLoading message="Memuat data toko..." />;
  }

  if (store === null) {
    return <CreateStoreForm />;
  }

  return children;
}

function CatalogLoading({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function CreateStoreForm() {
  const createStore = useMutation(api.catalog.createStore);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await createStore({ name });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Toko gagal dibuat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-primary">
          <Store aria-hidden="true" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Buat toko Anda</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sebelum mengelola kategori dan satuan, beri nama toko yang akan
            menggunakan katalog ini.
          </p>
        </div>
        <Input
          label="Nama toko"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Toko Maju Jaya"
          minLength={2}
          maxLength={80}
          required
        />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? "Membuat toko..." : "Buat toko dan lanjutkan"}
        </Button>
      </form>
    </section>
  );
}
