import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="Toman Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold text-primary">Toman</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Solusi manajemen toko terpadu untuk membantu UMKM Indonesia naik kelas melalui digitalisasi sistem kasir, stok, dan laporan keuangan.
            </p>
            {/* <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Layanan</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary transition-colors">Fitur Utama</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Solusi Bisnis</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Paket Harga</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Demo Aplikasi</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Perusahaan</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>halo@toman.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Toman. Hak Cipta Dilindungi.
          </p>
          {/* <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">ID</a>
            <a href="#" className="hover:text-primary transition-colors">EN</a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}