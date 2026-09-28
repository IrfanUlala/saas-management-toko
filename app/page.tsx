import Image from "next/image";
import PWAInstallButton from "@/components/PWAInstallButton";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Kelola Toko Anda <span className="text-blue-600">Lebih Cerdas</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Sistem manajemen toko terpadu untuk kasir, stok barang, hingga laporan keuangan. 
            Semua dalam satu genggaman.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-blue-100">
              Mulai Sekarang — Gratis
            </button>
            <button className="bg-white border-2 border-gray-200 hover:border-blue-600 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
              Lihat Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Kasir (POS) Cepat",
                desc: "Transaksi kilat dengan antarmuka yang intuitif dan mudah digunakan.",
                icon: "💰",
              },
              {
                title: "Manajemen Stok",
                desc: "Pantau stok barang secara real-time dan dapatkan notifikasi stok rendah.",
                icon: "📦",
              },
              {
                title: "Laporan Keuangan",
                desc: "Analisis penjualan dan keuntungan harian hingga bulanan secara otomatis.",
                icon: "📊",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl shadow-blue-200">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Mengembangkan Bisnis Anda?</h2>
          <p className="text-blue-100 mb-10 text-lg">
            Bergabunglah dengan ribuan pemilik toko yang telah mendigitalisasi bisnis mereka.
          </p>
          <button className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-xl font-bold text-lg transition-all">
            Daftar Sekarang
          </button>
        </div>
      </section>

      {/* Footer Spacer for Sticky Button */}
      <div className="h-24"></div>

      {/* PWA Install Button */}
      <PWAInstallButton />
    </main>
  );
}

