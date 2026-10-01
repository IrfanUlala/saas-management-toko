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

const menus = [
  {
    title: "Kasir",
    description: "Kelola transaksi penjualan dan pembayaran pelanggan.",
    icon: ShoppingCart,
    href: "/kasir",
  },
  {
    title: "Pembelian",
    description: "Kelola pembelian barang dari supplier.",
    icon: Truck,
    href: "/pembelian",
  },
  {
    title: "Stok & Gudang",
    description: "Pantau stok, mutasi, dan lokasi penyimpanan barang.",
    icon: Warehouse,
    href: "/gudang",
  },
  {
    title: "Opname",
    description: "Cek dan sesuaikan stok fisik dengan sistem.",
    icon: ClipboardCheck,
    href: "/opname",
  },
  {
    title: "Produk",
    description: "Kelola produk, kategori, harga, dan barcode.",
    icon: Package,
    href: "/produk",
  },
  {
    title: "Supplier",
    description: "Kelola data supplier dan riwayat pembelian.",
    icon: Boxes,
    href: "/supplier",
  },
  {
    title: "Karyawan",
    description: "Kelola data dan akses karyawan toko.",
    icon: Users,
    href: "/karyawan",
  },
  {
    title: "Absensi",
    description: "Pantau kehadiran dan jam kerja karyawan.",
    icon: UserCheck,
    href: "/absensi",
  },
  {
    title: "Kas & Pengeluaran",
    description: "Catat pemasukan, pengeluaran, dan kas toko.",
    icon: Wallet,
    href: "/kas",
  },
  {
    title: "Pembayaran",
    description: "Kelola metode pembayaran dan transaksi.",
    icon: CreditCard,
    href: "/pembayaran",
  },
  {
    title: "Laporan",
    description: "Lihat laporan penjualan, stok, dan keuangan.",
    icon: BarChart3,
    href: "/laporan",
  },
  {
    title: "Pengaturan",
    description: "Atur toko, cabang, pengguna, dan sistem.",
    icon: Settings,
    href: "/pengaturan",
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
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Menu Toko
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Pilih menu untuk mengelola operasional toko.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <a
                key={menu.title}
                href={menu.href}
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-primary/10">
                    <Icon className="h-5 w-5 text-gray-600 transition-colors group-hover:text-primary" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <h3 className="mt-5 font-semibold text-gray-900">
                  {menu.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {menu.description}
                </p>
              </a>
            );
          })}
        </div>
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