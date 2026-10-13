"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      await signIn("password", { flow: "signIn", email, password });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal masuk. Periksa email dan kata sandi Anda.",
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
            Selamat datang kembali
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Masuk untuk melanjutkan mengelola toko Anda.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
            required
          />
          <Button
            type="submit"
            className="h-11 w-full rounded-xl"
            isLoading={isSubmitting}
          >
            <LockKeyhole aria-hidden="true" className="mr-2 h-4 w-4" />
            {isSubmitting ? "Memeriksa..." : "Masuk"}
          </Button>
        </form>
        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:text-secondary"
          >
            Daftar sekarang
          </Link>
        </p>

      </section>
    </main>
  );
}