"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  Package,
  Settings,
  ShoppingCart,
  Truck,
} from "lucide-react";

const sideItems = [
  {
    title: "Produk",
    href: "/admin/produk",
    icon: Package,
  },
  {
    title: "Pembelian",
    href: "/admin/pembelian",
    icon: Truck,
  },
] as const;

const rightItems = [
  {
    title: "Riwayat",
    href: "/admin/riwayat",
    icon: History,
  },
  {
    title: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
  },
] as const;

const centerItem = {
  title: "Penjualan",
  href: "/admin/penjualan",
  icon: ShoppingCart,
} as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();

  const centerActive = isActive(pathname, centerItem.href);
  const CenterIcon = centerItem.icon;

  const renderItem = (
    item: (typeof sideItems)[number] | (typeof rightItems)[number],
  ) => {
    const Icon = item.icon;
    const active = isActive(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className="group flex h-full min-w-0 flex-1 flex-col items-center justify-center"
      >
        <div
          className={[
            "flex h-9 w-14 items-center justify-center rounded-xl transition-all duration-200",
            active
              ? "bg-primary/10 text-primary"
              : "text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-800",
          ].join(" ")}
        >
          <Icon
            className={[
              "h-5.25 w-5.25 transition-all",
              active ? "stroke-[2.25]" : "stroke-[1.8]",
            ].join(" ")}
          />
        </div>

        <span
          className={[
            "mt-0.5 text-[10px] leading-4 transition-colors",
            active
              ? "font-semibold text-primary"
              : "font-medium text-gray-500",
          ].join(" ")}
        >
          {item.title}
        </span>
      </Link>
    );
  };

  return (
    <nav className="sticky inset-x-0 bottom-0 z-50 mt-3">
      <div className="mx-auto max-w-lg px-3 pb-3">
        <div className="relative h-17 rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="grid h-full grid-cols-5 items-center px-1">
            {sideItems.map(renderItem)}

            {/* Center / Penjualan */}
            <Link
              href={centerItem.href}
              aria-label="Penjualan / transaksi"
              className="group flex h-full flex-col items-center justify-end"
            >
              <div
                className={[
                  "absolute -top-6 flex h-14.5 w-14.5 items-center justify-center rounded-full border-[5px] border-white shadow-lg transition-all duration-200",
                  centerActive
                    ? "bg-secondary text-white shadow-secondary/30"
                    : "bg-primary text-white shadow-primary/30 group-hover:-translate-y-0.5 group-hover:shadow-xl",
                ].join(" ")}
              >
                <CenterIcon className="h-6 w-6 stroke-[2.2]" />
              </div>

              <span
                className={[
                  "mb-2 text-[10px] leading-4 transition-colors",
                  centerActive
                    ? "font-bold text-primary"
                    : "font-semibold text-gray-600",
                ].join(" ")}
              >
                {centerItem.title}
              </span>
            </Link>

            {rightItems.map(renderItem)}
          </div>
        </div>
      </div>
    </nav>
  );
}