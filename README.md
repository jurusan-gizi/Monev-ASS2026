# Monev Capaian Gizi ASS – Dinkes Prov. Sulsel (PWA)

Aplikasi isian **Daftar Tilik Monitoring Evaluasi Capaian Program Gizi Aksi Stop Stunting** (13 indikator, 4 lembar),
plus menu **Laporan Perjadin** (Nota Dinas → file Word .docx).
Bisa dipakai tanpa internet; data, foto, dan tanda tangan terkirim otomatis ke Google Sheet & Google Drive saat ada sinyal.

Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel

---

## A. Siapkan Google Sheet (sekali saja)
1. Buat **Google Sheet baru**, mis. "Database Monev Capaian Gizi ASS 2026".
2. Menu **Ekstensi → Apps Script**. Hapus isi editor, tempel seluruh isi `Code.gs`, Simpan.
3. Periksa baris `ROOT_FOLDER_ID` di bagian atas `Code.gs`. Isinya sudah ID folder **"ASS 2026 - Dokumentasi Kegiatan"**.
   Foto, tanda tangan, dan laporan otomatis masuk ke subfolder:
   - `Monev Capaian / <Kabupaten> / <Kecamatan> / <Desa>` → foto & tanda tangan
   - `Monev Capaian / Laporan Perjadin / <Kabupaten>` → file laporan .docx
4. Pilih fungsi **`setup`** → **Jalankan** → izinkan akses (Sheet & Drive). Semua sheet terbentuk otomatis, lengkap dengan baris contoh.

## B. Isi sheet master
| Sheet | Cara isi |
|---|---|
| `MASTER_WILAYAH` | Satu baris per desa: Kabupaten/Kota, Kecamatan, Desa/Kelurahan. Bisa disalin dari MASTER_WILAYAH logbook ASS. |
| `MASTER_TIM` | **Satu baris per anggota.** Anggota satu tim memakai Kode Tim yang sama. Kolom "Kabupaten/Kota Tugas" boleh lebih dari satu, pisahkan dengan koma. |
| `PENGATURAN_LAPORAN` | Teks baku Nota Dinas (Hal, nama kegiatan, tujuan, DPA, dll). Baris bertanda **PERLU DIKONFIRMASI** sebaiknya disesuaikan dengan teks resmi Dinkes. Perubahan berlaku di semua HP setelah "Perbarui data master". |

Penting:
- Tulisan **Kabupaten/Kota harus sama persis** di MASTER_TIM dan MASTER_WILAYAH (mis. sama-sama "Kabupaten Soppeng").
- Format kolom **NIP** sebagai *Teks biasa* (Format → Angka → Teks biasa) agar 18 digit tidak berubah.
- Hapus baris contoh (CONTOH01, Contoh Desa) setelah data asli diisi.

Sheet berikut terisi otomatis dari aplikasi: `MONEV_CAPAIAN` (1 baris per desa), `DAFTAR_BALITA_TL`, `KESEPAKATAN_TL`,
`FOTO_MONEV` (link foto & tanda tangan), `LAPORAN_PERJADIN` (arsip laporan + link .docx).
Kolom paling kanan bernama **JSON** dipakai aplikasi untuk berbagi data antar-HP anggota tim — jangan dihapus/diubah.

## C. Terapkan Apps Script
**Terapkan → Deployment baru → Aplikasi web**
- Jalankan sebagai: **Saya**
- Yang memiliki akses: **Siapa saja**

Salin URL (berakhiran `/exec`) lalu tempel di `config.js` → `SCRIPT_URL: '...'`.
(Bisa juga diisi di layar login → "Pengaturan server".)

Jika `Code.gs` diubah kemudian: **Terapkan → Kelola deployment → Edit → Versi baru** (URL tetap sama).

## D. Unggah ke GitHub Pages
1. Buat repository baru, unggah semua file & folder (`icons/`, `lib/`). `Code.gs` dan `README.md` boleh ikut.
2. **Settings → Pages → Branch: main / root → Save.**
3. Buka link GitHub Pages di HP (Chrome) → menu ⋮ → **Instal aplikasi / Tambahkan ke layar utama**.
4. Login pertama dengan kode tim **perlu internet**. Setelah itu semua fitur jalan tanpa sinyal.

Bila file aplikasi diperbarui, naikkan nama cache di `sw.js` (mis. `monev-ass-v2`) agar HP mengambil versi baru.

---

## Cara pakai (untuk tim)
1. **Masuk** dengan kode tim → Kab/Kota tugas, daftar desa, dan nama anggota terisi otomatis.
2. **＋ Monev Desa**: Identitas → Indikator 1–13 → Daftar balita → Kesepakatan & tanda tangan (Tim, Pemdes, Kader) → Foto (opsional, maks. 5) → Ringkasan → **Simpan & Kirim**.
   - Angka "Belum", persentase, cakupan gabungan, dan **warna desa** dihitung otomatis.
   - Muncul peringatan bila angka janggal (mis. penerima > sasaran).
   - Istilah bergaris biru bisa diketuk untuk melihat artinya.
3. **📄 Laporan Perjadin**: pilih desa yang dikunjungi → isi nomor nota dinas & surat tugas → draf A–E tersusun otomatis →
   edit seperlunya → tanda tangan semua pelaksana di layar → **⬇️ .docx** untuk unduh, **Simpan ✔** untuk arsip ke Sheet & Drive.
4. Data dari HP anggota lain dalam tim yang sama ikut muncul setelah ⚙️ → **Perbarui data master & data tim**,
   jadi laporan bisa disusun dari HP siapa saja.

## Catatan
- Draf laporan disusun dari kalimat baku + angka hasil monev (bukan AI). Baca & poles bagian C–E sebelum diunduh.
- Menghapus data di HP tidak menghapus data yang sudah ada di Google Sheet.
- Foto dikecilkan otomatis (±200–300 KB) agar tetap ringan dikirim dari desa dengan sinyal lemah.
