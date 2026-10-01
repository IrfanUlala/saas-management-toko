"use client";

import { Menu, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={'/icon.png'} alt="icon.png" className="w-9 h-9" />
          <span className="text-xl font-bold text-primary">Toman</span>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Search className="cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-search'))} />
          <Menu className="cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-menu'))} />
        </div>
      </div>
    </header>
  );
}