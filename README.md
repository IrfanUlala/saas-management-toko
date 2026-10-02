# Toman — Toko Maju & Nyaman

Aplikasi manajemen toko terpadu berbasis [Next.js](https://nextjs.org) (App Router) untuk mengelola penjualan POS kasir, stok gudang, absensi karyawan, multi-role pengguna, dan laporan keuangan dalam satu sistem.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Halaman beranda ada di `app/(main)/page.tsx` dan akan diperbarui otomatis saat Anda mengedit file.

Proyek ini memakai [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) untuk mengoptimalkan dan memuat font Nunito secara otomatis.

## Struktur Folder

```text
.
├── app/                  # Routing, layout, dan komposisi halaman (Next.js App Router)
│   ├── (main)/           # Route group area publik (beranda, about)
│   ├── admin/            # Area admin
│   ├── auth/             # Halaman autentikasi
│   ├── layout.tsx        # Root layout (font, metadata, PWA install button)
│   └── globals.css
├── components/
│   ├── ui/               # Primitives generik & reusable (button, input, checkbox, select)
│   └── layout/           # Shell/navigasi yang dipakai lintas route
│       ├── admin/        # Header, footer, navigation area admin
│       ├── main/         # Header, footer, slides area publik
│       └── pwa-install-button.tsx  # Banner instalasi PWA global
├── features/             # Logika khusus per domain: buy/, inventory/, profile/, sell/
│                         # (diisi komponen/hooks/services saat fitur diimplementasikan)
├── public/               # Aset statis yang disajikan langsung
└── review/               # Catatan review/dokumentasi teknis
```

Konvensi:

- `app/` hanya mengatur URL, layout, dan komposisi halaman; logika domain tidak ditaruh di sana.
- Komponen yang hanya relevan untuk satu domain diletakkan di `features/<domain>/`; yang reusable lintas fitur di `components/`.
- Nama file memakai huruf kecil (`button.tsx`, `pwa-install-button.tsx`).
- Jangan menambah folder baru kecuali ada file nyata yang membutuhkannya.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
