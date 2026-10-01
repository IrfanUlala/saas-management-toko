"use client";

import { Menu, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={'/icon.png'} alt="icon.png" className="w-8 h-8 md:w-9 md:h-9" />
          <span className="text-lg md:text-xl font-bold text-primary">Toman</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-primary transition-colors">Fitur</a>
          <a href="#" className="hover:text-primary transition-colors">Solusi</a>
          <a href="#" className="hover:text-primary transition-colors">Harga</a>
          <a href="#" className="hover:text-primary transition-colors">Tentang</a>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="hidden md:flex items-center gap-4">
            <button className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-secondary transition-all shadow-md hover:shadow-lg">
              Masuk / Daftar
            </button>
          </div>

          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => window.dispatchEvent(new CustomEvent('open-menu'))}
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}