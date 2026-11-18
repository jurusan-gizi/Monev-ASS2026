/**
 * Monev Gizi Tahap II – Backend Google Sheet
 * Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel
 *
 * CARA PASANG:
 * 1. Buat Google Sheet baru → Ekstensi → Apps Script → hapus isi, tempel seluruh kode ini → Simpan.
 * 2. Jalankan fungsi `setup` sekali (izinkan akses).
 * 3. Terapkan → Deployment baru → Jenis: Aplikasi web
 *      Jalankan sebagai: Saya | Yang memiliki akses: Siapa saja → Terapkan.
 * 4. Salin URL (berakhiran /exec) → tempel di config.js atau di menu ⚙️ aplikasi.
 */
const SH_RINGKAS = 'Monev_Ringkas';
const SH_DETAIL  = 'Monev_Detail';
const H_RINGKAS = ['ID','Waktu Terima','Jenjang','Kabupaten/Kota','Unit/Lokasi','Tanggal Kunjungan','Tim Verifikasi',
  'Pendamping','Periode Data','Indikator Terisi','Dibuat (HP)','Diubah (HP)','Perangkat'];
const H_DETAIL = ['ID','Waktu Terima','Jenjang','Kabupaten/Kota','Unit/Lokasi','Tanggal Kunjungan','Tim Verifikasi',
  'No','Indikator','Status Bukti','Hasil a','Hasil b','Hasil c','Hasil d','Kendala/Masalah','Upaya yang Akan Dilakukan'];

function setup() {
  const ss = SpreadsheetApp.getActive();
  [[SH_RINGKAS, H_RINGKAS], [SH_DETAIL, H_DETAIL]].forEach(([n, h]) => {
    const sh = ss.getSheetByName(n) || ss.insertSheet(n);
    if (sh.getLastRow() === 0) {
      sh.appendRow(h);
      sh.getRange(1, 1, 1, h.length).setFontWeight('bold').setBackground('#C8102E').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
}

function doGet(e) {
  return json({ ok: true, sheet: SpreadsheetApp.getActive().getName(), waktu: new Date() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    setup();
    const d = JSON.parse(e.postData.contents);
    if (d.action !== 'simpan') return json({ ok: false, error: 'aksi tidak dikenal' });
    const h = d.header, now = new Date();
    const ss = SpreadsheetApp.getActive();

    // Ringkas: upsert berdasarkan ID
    const r1 = [h.id, now, h.jenjang, h.kab, h.unit, h.tanggal, h.tim, h.pendamping, h.periode, h.terisi, h.dibuat, h.diubah, h.perangkat];
    const shR = ss.getSheetByName(SH_RINGKAS);
    const row = findRow(shR, h.id);
    if (row) shR.getRange(row, 1, 1, r1.length).setValues([r1]); else shR.appendRow(r1);

    // Detail: hapus baris lama ID ini, lalu tulis ulang 10 indikator
    const shD = ss.getSheetByName(SH_DETAIL);
    deleteRows(shD, h.id);
    const rows = d.detail.map(x => {
      const a = [0, 1, 2, 3].map(i => x.jawaban[i] ? x.jawaban[i].a : '');
      return [h.id, now, h.jenjang, h.kab, h.unit, h.tanggal, h.tim, x.no, x.indikator, x.status_bukti, ...a, x.kendala, x.upaya];
    });
    shD.getRange(shD.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    return json({ ok: true, id: h.id });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function findRow(sh, id) {
  const n = sh.getLastRow(); if (n < 2) return 0;
  const ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return 0;
}
function deleteRows(sh, id) {
  const n = sh.getLastRow(); if (n < 2) return;
  const ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === id) sh.deleteRow(i + 2);
}
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
