'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Store,
  Zap,
  Warehouse,
  Receipt,
  Truck,
  Clock3,
  ShieldCheck,
  Smartphone,
  Building2,
  Boxes,
  Wallet,
  TrendingUp,
  ClipboardList,
  Settings,
  MonitorSmartphone,
  CircleDollarSign,
  BadgeCheck,
  Headphones,
  RefreshCw,
  Check,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const features = [
    {
      icon: ShoppingCart,
      title: "Kasir (POS)",
      desc: "Proses transaksi dengan cepat, kelola keranjang belanja, diskon, pembayaran, dan cetak struk.",
    },
    {
      icon: Package,
      title: "Manajemen Stok",
      desc: "Pantau stok barang, stok minimum, mutasi barang, dan pergerakan produk secara terpusat.",
    },
    {
      icon: Warehouse,
      title: "Manajemen Gudang",
      desc: "Kelola penerimaan barang, pengeluaran barang, transfer stok, dan beberapa lokasi gudang.",
    },
    {
      icon: Users,
      title: "Karyawan",
      desc: "Atur pengguna, role, hak akses, shift, dan aktivitas karyawan dalam satu sistem.",
    },
    {
      icon: BarChart3,
      title: "Laporan Bisnis",
      desc: "Lihat penjualan, keuntungan, produk terlaris, stok, dan performa bisnis dengan lebih mudah.",
    },
    {
      icon: Receipt,
      title: "Pembelian & Supplier",
      desc: "Catat pembelian barang dan kelola data supplier agar alur pengadaan lebih terkontrol.",
    },
    {
      icon: Wallet,
      title: "Kas & Keuangan",
      desc: "Pantau pemasukan, pengeluaran, dan arus kas operasional toko secara lebih terstruktur.",
    },
    {
      icon: Building2,
      title: "Multi Cabang",
      desc: "Kelola beberapa toko atau cabang menggunakan satu sistem dan akun pemilik.",
    },
  ];

  const problems = [
    "Stok masih dicatat menggunakan Excel atau buku.",
    "Sulit mengetahui stok barang yang sebenarnya.",
    "Owner tidak selalu berada di toko untuk memantau transaksi.",
    "Laporan penjualan harus dibuat secara manual.",
    "Data gudang dan kasir tidak terhubung.",
    "Sulit mengetahui produk mana yang paling laku.",
  ];

  const steps = [
    {
      number: "01",
      icon: Store,
      title: "Buat Toko",
      desc: "Masukkan informasi toko dan mulai siapkan sistem operasional Anda.",
    },
    {
      number: "02",
      icon: Boxes,
      title: "Masukkan Produk",
      desc: "Tambahkan produk, kategori, harga, stok, supplier, dan informasi lainnya.",
    },
    {
      number: "03",
      icon: MonitorSmartphone,
      title: "Mulai Berjualan",
      desc: "Gunakan Toman sebagai sistem kasir untuk mencatat transaksi harian.",
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Pantau Bisnis",
      desc: "Lihat laporan dan kondisi toko untuk membantu Anda mengambil keputusan.",
    },
  ];

  const businessTypes = [
    {
      icon: Store,
      title: "Toko Retail",
      desc: "Kelola produk, kasir, stok, dan transaksi harian.",
    },
    {
      icon: Building2,
      title: "Minimarket",
      desc: "Cocok untuk operasional toko dengan banyak produk.",
    },
    {
      icon: Warehouse,
      title: "Toko Material",
      desc: "Kelola stok barang, pembelian, supplier, dan gudang.",
    },
    {
      icon: ShoppingCart,
      title: "Toko Sepatu & Fashion",
      desc: "Kelola berbagai produk dan variasi barang.",
    },
    {
      icon: Package,
      title: "Distributor",
      desc: "Pantau stok dan pergerakan barang dengan lebih terstruktur.",
    },
    {
      icon: Truck,
      title: "Toko Grosir",
      desc: "Bantu mengelola transaksi dalam jumlah besar.",
    },
  ];

  const benefits = [
    {
      icon: Clock3,
      title: "Hemat Waktu",
      desc: "Kurangi pekerjaan pencatatan manual dan fokus pada pengembangan bisnis.",
    },
    {
      icon: ShieldCheck,
      title: "Data Lebih Teratur",
      desc: "Data produk, stok, transaksi, dan laporan tersimpan dalam satu sistem.",
    },
    {
      icon: Smartphone,
      title: "Lebih Mudah Dipantau",
      desc: "Owner dapat memantau kondisi operasional toko dengan lebih praktis.",
    },
    {
      icon: RefreshCw,
      title: "Data Terintegrasi",
      desc: "Transaksi kasir dapat terhubung dengan stok dan laporan bisnis.",
    },
  ];

  return (
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-green-100/40 blur-3xl" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center gap-14 lg:flex-row">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Sistem Manajemen Toko Terpadu
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
                Kelola Toko Jadi{" "}
                <span className="text-primary">Lebih Mudah</span> & Profesional
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 lg:mx-0">
                Toman membantu Anda mengelola kasir, stok, gudang, karyawan,
                pembelian, hingga laporan bisnis dalam satu sistem yang
                sederhana dan terintegrasi.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-full px-8 py-6 text-lg shadow-xl transition-all hover:shadow-primary/20 sm:w-auto"
                >
                  Mulai Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 rounded-full border-2 px-8 py-6 text-lg sm:w-auto"
                >
                  Lihat Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-sm text-gray-500 lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Mudah Digunakan
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Setup Cepat
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tanpa Instalasi Rumit
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative flex-1">
              <div className="relative z-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                <div className="flex h-12 items-center gap-2 border-b bg-gray-50 px-5">
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                </div>

                <div className="grid min-h-90 grid-cols-3">
                  <div className="border-r bg-gray-50 p-5">
                    <div className="mb-8 flex items-center gap-2">
                      <img
                        src="/icon.png"
                        alt="Toman"
                        className="h-7 w-7"
                      />
                      <span className="font-bold text-primary">Toman</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Dashboard",
                        "Kasir",
                        "Produk",
                        "Stok",
                        "Laporan",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`rounded-lg px-3 py-2 text-xs ${index === 0
                            ? "bg-primary text-white"
                            : "text-gray-500"
                            }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Dashboard</p>
                        <h3 className="text-lg font-bold text-gray-900">
                          Ringkasan Toko
                        </h3>
                      </div>

                      <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-primary">
                        Hari ini
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Penjualan", "Rp 8.450.000"],
                        ["Transaksi", "184"],
                        ["Produk", "1.248"],
                        ["Stok Rendah", "12"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border bg-white p-4"
                        >
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="mt-2 text-lg font-bold text-gray-900">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 h-24 rounded-xl bg-gray-50 p-4">
                      <div className="flex h-full items-end gap-2">
                        {[35, 55, 40, 75, 60, 85, 70, 95, 80].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t bg-primary/70"
                              style={{ height: `${height}%` }}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-100 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Masalah Operasional
            </span>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Bisnis berkembang, tapi pencatatannya masih manual?
            </h2>

            <p className="mt-4 text-gray-600">
              Semakin banyak transaksi dan produk, semakin sulit mengelola
              semuanya hanya dengan buku atau spreadsheet.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {problems.map((problem) => (
              <div
                key={problem}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <ClipboardList className="h-5 w-5 text-red-500" />
                </div>

                <p className="text-sm text-gray-700">{problem}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-lg font-semibold text-gray-900">
              Toman menyatukan semuanya dalam satu sistem.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Fitur Toman
            </span>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Semua kebutuhan operasional toko
            </h2>

            <p className="mt-4 text-gray-600">
              Dari transaksi pertama sampai laporan akhir hari, Toman
              membantu menghubungkan setiap bagian operasional toko Anda.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Cara Kerja
            </span>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Mulai dalam beberapa langkah sederhana
            </h2>

            <p className="mt-4 text-gray-600">
              Tidak perlu proses yang rumit untuk mulai mendigitalisasi toko
              Anda.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-md">
                  <step.icon className="h-7 w-7" />
                </div>

                <span className="text-xs font-bold text-primary">
                  LANGKAH {step.number}
                </span>

                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Untuk Berbagai Jenis Toko
            </span>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Satu sistem untuk berbagai kebutuhan bisnis
            </h2>

            <p className="mt-4 text-gray-600">
              Toman dirancang agar dapat digunakan oleh berbagai jenis usaha
              retail dan perdagangan.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businessTypes.map((business) => (
              <div
                key={business.title}
                className="flex gap-5 rounded-2xl border border-gray-100 p-6 transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-primary">
                  <business.icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    {business.title}
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {business.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-14 lg:flex-row">
            <div className="flex-1">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Kenapa Toman?
              </span>

              <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                Bukan hanya aplikasi kasir.
                <br />
                Toman membantu Anda mengelola bisnis.
              </h2>

              <p className="mt-5 max-w-xl leading-relaxed text-gray-600">
                Toman menghubungkan transaksi, stok, karyawan, gudang, dan
                laporan agar informasi bisnis Anda lebih mudah dipantau.
              </p>

              <Button className="mt-8 gap-2 rounded-full px-7">
                Kenali Fitur Toman
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid flex-1 gap-5 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-gray-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-3xl bg-primary p-8 text-white md:p-14">
            <div className="flex flex-col items-center gap-12 lg:flex-row">
              <div className="flex-1">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <BadgeCheck className="h-4 w-4" />
                  Dibuat untuk pemilik bisnis
                </div>

                <h2 className="text-3xl font-bold leading-tight md:text-5xl">
                  Tetap tahu apa yang terjadi di toko Anda.
                </h2>

                <p className="mt-5 max-w-xl text-green-50">
                  Tidak harus selalu berada di depan kasir. Dengan data
                  transaksi, stok, dan laporan yang terstruktur, Anda dapat
                  melihat kondisi operasional toko dengan lebih mudah.
                </p>

                <Button
                  variant="outline"
                  size="lg"
                  className="mt-8 rounded-full bg-white px-8 text-primary hover:bg-green-50"
                >
                  Mulai Menggunakan Toman
                </Button>
              </div>

              <div className="grid w-full max-w-md grid-cols-2 gap-4">
                {[
                  {
                    icon: CircleDollarSign,
                    value: "Penjualan",
                    desc: "Pantau transaksi",
                  },
                  {
                    icon: Package,
                    value: "Stok",
                    desc: "Kontrol persediaan",
                  },
                  {
                    icon: Users,
                    value: "Karyawan",
                    desc: "Kelola akses",
                  },
                  {
                    icon: BarChart3,
                    value: "Laporan",
                    desc: "Analisis bisnis",
                  },
                ].map((item) => (
                  <div
                    key={item.value}
                    className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm"
                  >
                    <item.icon className="mb-4 h-6 w-6" />

                    <p className="font-bold">{item.value}</p>

                    <p className="mt-1 text-sm text-green-100">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Pilih Paket Langganan Anda</h2>
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isYearly ? "font-bold text-primary" : "text-gray-500"}`}>Bulanan</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6 bg-gray-200 rounded-full p-1 transition-colors relative"
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm ${isYearly ? "font-bold text-primary" : "text-gray-500"}`}>Tahunan (Hemat 20%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Basic", monthly: 50000, yearly: 500000, features: ["Kasir POS", "Stok Dasar", "Laporan Harian"] },
              { name: "Pro", monthly: 100000, yearly: 1000000, features: ["Semua Basic", "Absensi Karyawan", "Laporan Bulanan", "Multi-User"] },
              { name: "Enterprise", monthly: 200000, yearly: 2000000, features: ["Semua Pro", "Multi-Gudang", "Analisis Lanjutan", "Support 24/7"] }
            ].map((plan) => (
              <div key={plan.name} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary mb-6">
                  Rp {isYearly ? plan.yearly.toLocaleString() : plan.monthly.toLocaleString()}
                  <span className="text-sm text-gray-500 font-normal">/{isYearly ? "tahun" : "bulan"}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Pilih Paket</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 py-16 text-center text-white md:px-16">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-green-400">
                Mulai Sekarang
              </span>

              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                Saatnya mengelola toko dengan cara yang lebih modern.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-gray-300">
                Tinggalkan pencatatan yang berantakan dan mulai satukan
                operasional toko Anda bersama Toman.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-full px-8"
                >
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-gray-600 px-8 text-white hover:bg-white/10"
                >
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Dapatkan Tips Mengelola Toko
          </h2>

          <p className="mt-3 text-gray-600">
            Dapatkan tips bisnis, informasi fitur, dan update terbaru dari
            Toman.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Alamat email Anda"
              className="h-12 rounded-full bg-white px-6"
            />

            <Button className="h-12 shrink-0 rounded-full px-8">
              Berlangganan
            </Button>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Kami tidak akan mengirimkan spam.
          </p>
        </div>
      </section>
    </div>
  );
}