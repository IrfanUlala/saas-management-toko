# Review Struktur Folder

## Ringkasan

Struktur saat ini sudah memisahkan routing Next.js di `app/`, komponen bersama di `components/`, dan domain bisnis di `features/`. Ini fondasi yang baik untuk aplikasi yang masih berkembang. Belum perlu memindahkan semua file sekarang; beberapa folder domain masih kosong dan sebaiknya baru diisi saat fitur terkait mulai diimplementasikan.

## Temuan dan rekomendasi

1. **`clients/` belum memiliki isi yang terlihat.** Tentukan kegunaannya sebelum menambahkan kode. Jika untuk API/backend clients, beri nama eksplisit seperti `lib/api/` atau `services/`; bila memang menyimpan integrasi per vendor, gunakan `clients/<vendor>/`. Hindari folder kosong tanpa konvensi.
2. **`features/` baru berupa kerangka domain.** Tempatkan komponen, hooks, schema, dan logika yang khusus untuk fitur di dalam domain masing-masing, misalnya `features/inventory/components/` dan `features/inventory/services/`. Jangan memindahkan komponen umum ke sana.
3. **Pemisahan `components/layout/` belum sepenuhnya konsisten dengan route groups.** `components/layout/main` dan `components/layout/admin` cocok untuk layout yang dipakai lintas halaman masing-masing area. Untuk komponen yang hanya dipakai satu route/segmen, pertimbangkan folder privat Next.js seperti `app/admin/_components/` atau `app/(main)/about/_components/` agar cakupannya jelas.
4. **Komponen UI umum dan layout sudah terpisah**, namun pertahankan batasnya: `components/ui/` untuk primitives reusable (button, input), sedangkan navigasi/header/footer khusus area berada di `components/layout/` atau dekat route terkait.
5. **Belum tampak folder pengujian.** Tambahkan pengujian bersama saat mulai membuat test, misalnya `tests/` untuk end-to-end/integrasi, dan unit test berdampingan dengan modul bila tooling yang dipilih mendukungnya. Jangan menambahkan folder kosong hanya untuk berjaga-jaga.
6. **Dokumentasi proyek masih template bawaan.** Perbarui `README.md` agar menjelaskan domain aplikasi dan konvensi folder setelah struktur mulai stabil.
7. **Artefak build tidak perlu dikelola sebagai source.** `.next/` sudah di-ignore; pertahankan ignore untuk output/cache dan jangan memasukkan hasil build ke Git.

## Skema struktur yang disarankan

Skema berikut adalah arah bertahap, bukan daftar folder yang harus dibuat seluruhnya sekarang. Pertahankan rute yang ada; pindahkan file hanya saat ada kebutuhan konkret dan sesuaikan import serta pengujian.

```text
.
├── app/                              # Routing, layout, dan UI tingkat route (Next.js App Router)
│   ├── (main)/                       # Route group untuk area publik
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── auth/
│   │   └── page.tsx
│   ├── api/                          # Route handlers, bila diperlukan
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                           # Primitives generik dan reusable
│   └── layout/                       # Shell/navigasi yang digunakan lintas route
│       ├── admin/
│       └── main/
├── features/                         # Implementasi per domain bisnis
│   ├── buy/
│   ├── inventory/
│   ├── profile/
│   └── sell/
│       ├── components/                # Contoh isi jika diperlukan
│       ├── hooks/
│       ├── schemas/
│       ├── services/
│       └── types.ts
├── lib/                              # Utilitas/infrastruktur lintas fitur
│   ├── api/                           # API client jika memang dibutuhkan
│   └── utils/
├── hooks/                            # Hooks lintas fitur (opsional)
├── types/                            # Tipe global lintas domain (opsional)
├── public/                           # Aset statis yang disajikan langsung
├── tests/                            # E2E/integrasi bersama (bila ada)
├── review/                           # Catatan review/dokumentasi teknis
├── next.config.ts
├── package.json
└── README.md
```

## Aturan praktis

- `app/` mengatur URL, layout, loading/error boundary, dan komposisi halaman; hindari menaruh seluruh logika domain di sana.
- Pilih satu lokasi berdasarkan pemakaian: fitur tunggal di `features/<domain>/`, reusable lintas fitur di `components/`, utilitas infrastruktur di `lib/`.
- Hindari barrel export (`index.ts`) yang tidak memberi manfaat jelas, serta folder generik seperti `utils/` tanpa batas tanggung jawab.
- Gunakan nama folder/file yang konsisten; struktur saat ini memakai nama file huruf kecil, jadi pertahankan gaya tersebut.
- Pertimbangkan `src/` hanya bila tim menginginkan pemisahan eksplisit antara source dan konfigurasi root. Ini bukan keharusan untuk proyek ini dan tidak perlu dilakukan bersamaan dengan perubahan lain.
- Tambahkan folder baru ketika terdapat file nyata yang membutuhkannya, bukan untuk mengantisipasi semua kemungkinan.
