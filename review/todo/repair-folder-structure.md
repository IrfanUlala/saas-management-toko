# Instruksi Agent: Rapikan Struktur Folder

## Tujuan
Tinjau dan rapikan struktur folder proyek agar konsisten, mudah dikembangkan, dan sesuai praktik Next.js App Router. Gunakan [review/folder-structure.md](../folder-structure.md) sebagai konteks dan rekomendasi awal.

## Instruksi kerja

1. Mulai dengan memeriksa `AGENTS.md`, `package.json`, `tsconfig.json`, seluruh folder sumber, dan status Git. Jangan menimpa atau membuang perubahan lokal yang sudah ada.
2. Cocokkan temuan review dengan isi proyek terkini. Verifikasi pemakaian `clients/`, `features/`, dan komponen layout melalui import/pemanggilannya sebelum memindahkan apa pun.
3. Buat rencana perubahan kecil yang menjaga URL, perilaku UI, dan API tetap sama. Terapkan hanya perubahan yang benar-benar bermanfaat; jangan membuat folder kosong untuk kemungkinan masa depan.
4. Jika folder `clients/` tidak digunakan, hapus hanya bila aman dan tidak berisi file yang perlu dipertahankan. Jika fungsinya tidak jelas, jangan menebak—laporkan dan minta klarifikasi.
5. Kelompokkan kode berdasarkan tanggung jawab: route dan komposisi halaman di `app/`, komponen generik di `components/ui/`, layout bersama di `components/layout/`, logika khusus domain di `features/<domain>/`, dan utilitas lintas fitur/infrastruktur di `lib/` bila memang diperlukan.
6. Bila memindahkan file, perbarui semua import, alias, konfigurasi, dan dokumentasi terkait. Pertahankan konvensi penamaan yang sudah dipakai proyek. Jangan melakukan migrasi besar ke `src/` atau perubahan arsitektur lain tanpa alasan kuat.
7. Jangan mengubah logika bisnis atau desain UI sebagai bagian dari pekerjaan ini, kecuali perubahan kecil diperlukan agar hasil pemindahan tetap berfungsi.
8. Jalankan pemeriksaan yang tersedia dan relevan, minimal `npm run lint` dan `npm run build` jika lingkungan/dependensi memungkinkan. Perbaiki regresi yang disebabkan perubahan ini; jangan memperluas scope ke masalah lama yang tidak terkait.
9. Tinjau diff akhir. Pastikan tidak ada file build/cache atau rahasia yang ditambahkan. Jangan commit kecuali diminta.

## Kriteria selesai

- Struktur akhir mempunyai tanggung jawab folder yang jelas dan tidak menambah direktori kosong tanpa kebutuhan.
- Semua import mengarah ke lokasi baru yang benar dan route/perilaku yang ada tetap terjaga.
- Pemeriksaan yang dijalankan dan hasilnya dicantumkan.
- Ringkas perubahan, alasan keputusan, serta item yang sengaja tidak diubah atau memerlukan klarifikasi.
