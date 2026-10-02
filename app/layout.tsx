import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import PWAInstallButton from "@/components/layout/pwa-install-button";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const siteConfig = {
  name: "Toko Maju & Nyaman",
  title: "Toko Maju & Nyaman — Kelola Toko, Kasir, & Stok Lebih Mudah",
  description:
    "Aplikasi manajemen toko terpadu untuk mengelola penjualan POS kasir, stok gudang, absensi karyawan, multi-role pengguna, hingga laporan keuangan dalam satu sistem.",
  url: "https://example.id", // Ganti dengan domain asli Anda
  locale: "id_ID",
  keywords: [
    "management toko",
    "manajemen toko",
    "aplikasi toko",
    "software toko",
    "aplikasi kasir",
    "POS kasir online",
    "stok barang",
    "manajemen gudang",
    "absensi karyawan",
    "manajemen karyawan",
    "laporan penjualan",
    "software retail",
  ],
  // Tambahan untuk Local/Geo SEO
  country: "Indonesia",
  language: "Indonesian",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  keywords: siteConfig.keywords,

  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],

  creator: siteConfig.name,
  publisher: siteConfig.name,

  applicationName: siteConfig.name,
  category: "Business Software, POS, Retail Management",

  // Optimasi Alternatif & Canonical
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
    },
  },

  // Konfigurasi Robots yang Kuat untuk Crawler
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Verifikasi Webmaster (Opsional, isi jika sudah mendaftar)
  verification: {
    // google: "masukkan-kode-verifikasi-google-search-console",
    // yandex: "kode-yandex",
    // bing: "kode-bing",
  },

  // Open Graph untuk Social Media (Facebook, LinkedIn, WhatsApp, dll)
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.png", // Ukuran rekomendasi: 1200 x 630 px
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Solusi Kasir dan Manajemen Toko`,
        type: "image/png",
      },
    ],
  },

  // Twitter / X Card
  // twitter: {
  //   card: "summary_large_image",
  //   site: "@namatwittertoko", // Ganti dengan akun Twitter Anda jika ada
  //   creator: "@namatwittertoko",
  //   title: siteConfig.title,
  //   description: siteConfig.description,
  //   images: ["/og-image.png"],
  // },

  // Ikon & Favicon yang Lengkap
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // PWA & Apple Web App Settings
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },

  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#008000" },
    { media: "(prefers-color-scheme: dark)", color: "#006400" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        {children}
        <PWAInstallButton />
      </body>
    </html>
  );
}