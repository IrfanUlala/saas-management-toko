import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  CreditCard,
  FileText,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  UserCheck,
  Users,
  Warehouse,
  Wallet,
  Settings,
  Store,
  ArrowRight,
} from "lucide-react";

const menuGroups = [
  {
    title: "Transaksi",
    items: [
      { title: "Kasir", icon: ShoppingCart, href: "/kasir" },
      { title: "Pembelian", icon: Truck, href: "/pembelian" },
      { title: "Pembayaran", icon: CreditCard, href: "/pembayaran" },
    ],
  },
  {
    title: "Inventaris",
    items: [
      { title: "Produk", icon: Package, href: "/produk" },
      { title: "Stok & Gudang", icon: Warehouse, href: "/gudang" },
      { title: "Opname", icon: ClipboardCheck, href: "/opname" },
      { title: "Supplier", icon: Boxes, href: "/supplier" },
    ],
  },
  {
    title: "Manajemen",
    items: [
      { title: "Karyawan", icon: Users, href: "/karyawan" },
      { title: "Absensi", icon: UserCheck, href: "/absensi" },
      { title: "Kas & Pengeluaran", icon: Wallet, href: "/kas" },
      { title: "Laporan", icon: BarChart3, href: "/laporan" },
      { title: "Pengaturan", icon: Settings, href: "/pengaturan" },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 px-4 md:px-6">
      {/* Welcome */}
      <section>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div>
            <p className="text-sm font-medium text-primary">
              Dashboard Toko
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Selamat datang di Toman 👋
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola seluruh operasional toko Anda dari satu tempat.
            </p>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-primary/10 sm:flex">
            <Store className="h-5 w-5 text-primary" />
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          title="Penjualan Hari Ini"
          value="Rp 4,2 Jt"
          description="32 transaksi"
          icon={Receipt}
        />

        <SummaryCard
          title="Stok Menipis"
          value="12 Produk"
          description="Perlu diperiksa"
          icon={Package}
        />

        <SummaryCard
          title="Pembelian"
          value="Rp 1,8 Jt"
          description="5 transaksi"
          icon={Truck}
        />

        <SummaryCard
          title="Karyawan Hadir"
          value="8 Orang"
          description="Dari 10 karyawan"
          icon={UserCheck}
        />
      </section>

      {/* Menu */}
      <section className="space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
              {group.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((menu) => {
                const Icon = menu.icon;
                return (
                  <a
                    key={menu.title}
                    href={menu.href}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {menu.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Operational Alert */}
      <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <ClipboardCheck className="h-5 w-5 text-orange-500" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Ada beberapa hal yang perlu diperiksa
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              12 produk memiliki stok di bawah batas minimum dan terdapat
              3 transaksi pembelian yang belum selesai.
            </p>

            <a
              href="/opname"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Periksa sekarang
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Receipt;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <p className="text-xs font-medium text-gray-500">
          {title}
        </p>
      </div>

      <p className="mt-4 text-xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}