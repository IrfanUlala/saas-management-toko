"use client";

import { useState, useEffect } from "react";
import { X, LayoutDashboard, Package, FileText, Settings, LogIn, Search, Info, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function SearchSlide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-search', handleOpen);
    return () => window.removeEventListener('open-search', handleOpen);
  }, []);

  return (
    <div className={`fixed inset-0 z-100 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsOpen(false)}>
      <div className={`fixed top-0 right-0 h-full w-80 bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Search className="" />
            <h2 className="text-xl font-bold">Cari Produk</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Temukan produk, stok, atau laporan dengan cepat.</p>
          <Input placeholder="Ketik sesuatu..." className="w-full" />
          <Button className="w-full gap-2">
            <Search className="w-4 h-4" />
            Cari Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileMenuSlide() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-menu', handleOpen);
    return () => window.removeEventListener('open-menu', handleOpen);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Fitur Utama", href: "#" },
    { icon: Package, label: "Solusi Bisnis", href: "#" },
    { icon: FileText, label: "Paket Harga", href: "#" },
    { icon: Info, label: "Tentang Kami", href: "#" },
    { icon: HelpCircle, label: "Bantuan", href: "#" },
  ];

  return (
    <div className={`fixed inset-0 z-100 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsOpen(false)}>
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-100 p-6">
          <div className="flex items-center gap-2">
            <Menu className="text-gray-500" />
            <span className="font-bold text-xl">Menu</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col py-4 overflow-y-auto h-[calc(100%-160px)]">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-primary transition-all group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-100 bg-gray-50">
          <Button className="w-full gap-2 py-6 text-base font-semibold shadow-lg" onClick={() => router.push('/auth')}>
            <LogIn className="w-5 h-5" />
            Masuk / Daftar
          </Button>
          <p className="text-center text-xs text-gray-400 mt-4">
            © 2026 Toko Aman & Nyaman
          </p>
        </div>
      </div>
    </div>
  );
}