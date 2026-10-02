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
            <Button variant="outline" className="w-full gap-2">Google</Button>
            <Button variant="outline" className="w-full gap-2">Facebook</Button>

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