"use client";

import {
  Bell,
  ChevronDown,
  MapPin,
  User,
} from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Store Information */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Store Logo */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            TM
          </div>

          {/* Store Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-sm font-semibold text-gray-900 md:text-base">
                Toko Maju Jaya
              </h1>

              <button
                type="button"
                className="rounded-md p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Pilih toko"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">Cabang Jakarta Pusat</span>
            </div>
          </div>
        </div>

        {/* Right: Notification & Account */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />

            {/* Notification Badge */}
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}