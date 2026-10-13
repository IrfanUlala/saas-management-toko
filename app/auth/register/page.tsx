"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn("password", {
        flow: "signUp",
        name,
        email,
        password,
      });
      setSuccessMessage("Akun berhasil dibuat. Anda sedang masuk...");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Pendaftaran gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-green-950/5 sm:p-10">
        <Link
          href="/auth"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Kembali
        </Link>

        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-primary">
            <Store aria-hidden="true" className="h-6 w-6" />
          </div>
          <p className="mb-2 text-sm font-semibold text-primary">Toman</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Buat akun baru
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Daftar dengan email untuk mulai mengelola toko Anda.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Nama lengkap"
            name="name"
            type="text"
            placeholder="Nama Anda"
            autoComplete="name"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />
          <Input
            label="Kata sandi"
            name="password"
            type="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Input
            label="Konfirmasi kata sandi"
            name="confirmPassword"
            type="password"
            placeholder="Ulangi kata sandi"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Button
            type="submit"
            className="h-11 w-full rounded-xl"
            isLoading={isSubmitting}
          >
            <UserRound aria-hidden="true" className="mr-2 h-4 w-4" />
            {isSubmitting ? "Membuat akun..." : "Buat akun"}
          </Button>
        </form>
        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mt-4 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:text-secondary"
          >
            Masuk
          </Link>
        </p>

      </section>
    </main>
  );
}