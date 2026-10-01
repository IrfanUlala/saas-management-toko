import {
  ArrowRight,
  Mail,
  MapPin,
  Package,
  BarChart3,
  Users,
  Store,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-white to-orange-50/40" />

        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Tentang Toman
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Membantu bisnis tumbuh dengan
              <span className="text-primary"> pengelolaan yang lebih mudah.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Toman adalah platform manajemen toko yang membantu pemilik bisnis
              mengelola operasional, stok, karyawan, dan penjualan dalam satu
              sistem yang sederhana dan mudah digunakan.
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Tentang Kami
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Teknologi untuk membuat operasional toko lebih sederhana.
            </h2>

            <div className="mt-6 space-y-5 text-gray-600 leading-7">
              <p>
                Mengelola toko tidak seharusnya membutuhkan banyak aplikasi
                dan proses yang rumit. Toman hadir untuk membantu bisnis
                menyatukan berbagai kebutuhan operasional dalam satu platform.
              </p>

              <p>
                Mulai dari transaksi kasir, pengelolaan stok, absensi
                karyawan, hingga laporan bisnis dapat dikelola dengan lebih
                terstruktur sehingga pemilik usaha dapat lebih fokus
                mengembangkan bisnisnya.
              </p>

              <p>
                Kami membangun Toman dengan satu prinsip sederhana:
                <span className="font-medium text-gray-900">
                  {" "}
                  teknologi harus membantu pekerjaan, bukan menambah
                  kerumitan.
                </span>
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Manajemen Toko
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Kelola operasional toko dengan sistem yang terintegrasi.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                <Package className="h-5 w-5 text-orange-600" />
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Kontrol Stok
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Pantau persediaan dan pergerakan barang dengan lebih mudah.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Kelola Karyawan
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Bantu mengatur absensi dan aktivitas tim toko.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Laporan Bisnis
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Dapatkan informasi bisnis untuk membantu mengambil keputusan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Visi Toman
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Memberikan akses teknologi yang mudah untuk setiap bisnis.
            </h2>

            <p className="mt-5 text-gray-600 leading-7">
              Kami ingin membantu bisnis dari berbagai skala menggunakan
              teknologi tanpa harus menghadapi sistem yang rumit. Dengan
              pengalaman operasional yang lebih terstruktur dan data yang
              lebih mudah dipahami, bisnis dapat berkembang dengan lebih
              percaya diri.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Hubungi Kami
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Ada pertanyaan tentang Toman?
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Kami siap membantu menjawab pertanyaan Anda mengenai Toman,
              fitur, maupun kebutuhan bisnis Anda.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href="mailto:halo@toman.id"
                    className="mt-1 block font-medium text-gray-900 hover:text-primary"
                  >
                    halo@toman.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="mt-1 font-medium text-gray-900">
                    Jakarta, Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 shadow-sm">
            <div className="flex h-80 items-center justify-center md:h-full md:min-h-90">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Kantor Toman
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Jakarta, Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20 md:pb-24">
        <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-white md:px-12 md:py-16">
          <h2 className="text-3xl font-bold md:text-4xl">
            Siap mengelola toko dengan lebih mudah?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/80 md:text-base">
            Gunakan Toman untuk membantu mengelola operasional bisnis Anda
            dalam satu platform.
          </p>

          <button className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition hover:bg-gray-50">
            Mulai Sekarang
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}