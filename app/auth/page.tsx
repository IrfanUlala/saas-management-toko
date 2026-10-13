"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "otp">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang di Toman</h1>
          <p className="text-gray-500 text-sm mt-2">
            {step === "login" ? "Masuk atau daftar untuk melanjutkan" : "Masukkan kode OTP yang dikirim ke email Anda"}
          </p>
        </div>

        {step === "login" ? (
          <div className="space-y-4">
            <Button variant="outline" className="w-full gap-2">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.85Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.87-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.76-2.1-6.71-4.92H1.29v3.09A12 12 0 0 0 12 24Z" />
                <path fill="#FBBC05" d="M5.29 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.29a12 12 0 0 0 0 10.8l4-3.09Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.16 15.24 0 12 0A12 12 0 0 0 1.29 6.6l4 3.09c.95-2.82 3.59-4.94 6.71-4.94Z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.09 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.34l-.53 3.49h-2.81V24C19.61 23.09 24 18.09 24 12.07Z" />
              </svg>
              Facebook
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Atau</span>
              </div>
            </div>

            <Input label="Email" type="email" placeholder="nama@email.com" />
            <Button className="w-full" onClick={() => setStep("otp")}>Kirim Kode OTP</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Kode OTP" placeholder="Masukkan 6 digit kode" />
            <Button className="w-full" onClick={() => router.push('/admin')}>Verifikasi</Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("login")}>Kembali</Button>
          </div>
        )}
      </div>
    </div>
  );
}