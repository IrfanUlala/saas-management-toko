"use client";

import { MapPin, MessageCircleQuestion } from "lucide-react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";

export default function AdminHeader() {
  const { isAuthenticated } = useConvexAuth();
  const store = useQuery(
    api.catalog.currentStore,
    isAuthenticated ? {} : "skip",
  );

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
                {store === undefined
                  ? "Memuat toko..."
                  : store?.name ?? "Toko belum dibuat"}
              </h1>
            </div>

            {store?.address && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{store.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Notification & Account */}
        <div className="flex items-center gap-2 md:gap-4">
          <a
            href="https://wa.me/62895374118869"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Hubungi bantuan melalui WhatsApp"
            title="Bantuan via WhatsApp"
          >
            <MessageCircleQuestion className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}