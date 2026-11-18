# Monev Gizi Tahap II – Dinkes Prov. Sulsel (PWA)

Aplikasi isian Daftar Tilik Monitoring Evaluasi Tahap II Program Gizi untuk 3 sasaran kunjungan:
Dinkes Kab/Kota, Puskesmas, dan Posyandu (masing-masing 10 indikator).
Bisa dipakai tanpa internet. Data otomatis terkirim ke Google Sheet saat ada sinyal.

Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel

## A. Siapkan Google Sheet (sekali saja)
1. Buat Google Sheet baru, beri nama mis. "Database Monev Gizi Tahap II".
2. Menu Ekstensi → Apps Script. Hapus isi editor, tempel seluruh isi `Code.gs`, lalu Simpan.
3. Pilih fungsi `setup` → Jalankan → izinkan akses. Sheet `Monev_Ringkas` dan `Monev_Detail` akan terbentuk.
4. Terapkan → Deployment baru → jenis "Aplikasi web":
   - Jalankan sebagai: Saya
   - Yang memiliki akses: Siapa saja
5. Salin URL Web App (berakhiran `/exec`).

## B. Pasang URL server
Pilih salah satu:
- Tempel URL di `config.js` → `SCRIPT_URL: 'https://script.google.com/macros/s/.../exec'` (berlaku untuk semua pengguna), atau
- Buka aplikasi → tombol ⚙️ → tempel URL → "Tes koneksi" → Simpan (hanya di HP itu).

## C. Unggah ke GitHub Pages
1. Buat repository baru, unggah SEMUA file & folder `icons/` (kecuali Code.gs dan README boleh ikut, tidak masalah).
2. Settings → Pages → Branch: main / root → Save.
3. Buka link GitHub Pages di HP (Chrome) → menu ⋮ → "Tambahkan ke layar utama" / "Instal aplikasi".
4. Setelah dibuka sekali saat online, aplikasi bisa dipakai penuh tanpa internet.

## Cara pakai
1. ＋ Isi Monev Baru → pilih sasaran (Dinkes / Puskesmas / Posyandu).
2. Isi identitas kunjungan.
3. Isi indikator 1–10: status bukti, hasil penelusuran per pertanyaan (a, b, c, d), kendala, dan upaya.
   Semua ketikan tersimpan otomatis di HP (aman walau aplikasi tertutup).
4. Selesai → Simpan & Kirim. Bila offline, data menunggu dan terkirim otomatis saat online.
5. 🖨️ Cetak → format tabel seperti daftar tilik kertas (bisa "Simpan sebagai PDF").

## Isi Google Sheet
- `Monev_Ringkas`: 1 baris per kunjungan (identitas + jumlah indikator terisi).
- `Monev_Detail`: 10 baris per kunjungan (status bukti, hasil a–d, kendala, upaya per indikator) – siap difilter/pivot.
Data yang diubah lalu dikirim ulang akan menimpa baris lama (berdasarkan ID), tidak dobel.

## Catatan
- Bila `Code.gs` diubah, lakukan Terapkan → Kelola deployment → Edit → Versi baru (URL tetap sama).
- Bila file aplikasi diperbarui, naikkan nama cache di `sw.js` (mis. `monev-gizi2-v2`) agar HP mengambil versi baru.
- Menghapus data di HP tidak menghapus data yang sudah ada di Google Sheet.
