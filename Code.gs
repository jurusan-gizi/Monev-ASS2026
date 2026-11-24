/**
 * Monev Capaian Gizi ASS – Backend Google Sheet + Google Drive
 * Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel
 *
 * CARA PASANG (ringkas – lengkapnya di README.md):
 * 1. Buat Google Sheet BARU → Ekstensi → Apps Script → hapus isi, tempel seluruh kode ini → Simpan.
 * 2. Periksa ROOT_FOLDER_ID di bawah (folder induk dokumentasi ASS di Google Drive).
 * 3. Pilih fungsi `setup` → Jalankan → izinkan akses. Semua sheet akan dibuat otomatis.
 * 4. Isi sheet MASTER_WILAYAH dan cek PENGATURAN_LAPORAN. MASTER_TIM (kode = nama kab/kota) terisi otomatis;
 *    anggota tim mendaftar sendiri dari aplikasi ke sheet ANGGOTA_TIM.
 * 5. Terapkan → Deployment baru → Aplikasi web: Jalankan sebagai "Saya", Akses "Siapa saja" → salin URL /exec.
 */
const ROOT_FOLDER_ID = '1J0kBlBFOxLz2P18qOaspdKmeyqccOy4I'; // folder "ASS 2026 - Dokumentasi Kegiatan"
const SUBFOLDER = 'Monev Capaian';

const SH = {
  WIL: 'MASTER_WILAYAH', TIM: 'MASTER_TIM', AGT: 'ANGGOTA_TIM', SET: 'PENGATURAN_LAPORAN',
  MONEV: 'MONEV_CAPAIAN', BALITA: 'DAFTAR_BALITA_TL', SEPAKAT: 'KESEPAKATAN_TL', FOTO: 'FOTO_MONEV', LAP: 'LAPORAN_PERJADIN'
};
const HEADERS = {
  MASTER_WILAYAH: ['Kabupaten/Kota', 'Kecamatan', 'Desa/Kelurahan'],
  MASTER_TIM: ['Kode Tim', 'Kabupaten/Kota'],
  ANGGOTA_TIM: ['ID', 'Waktu Terima', 'Kode Tim', 'Kabupaten/Kota', 'Nama', 'Pangkat/Golongan', 'NIP'],
  PENGATURAN_LAPORAN: ['Kunci', 'Nilai', 'Keterangan'],
  MONEV_CAPAIAN: ['ID', 'Waktu Terima'], DAFTAR_BALITA_TL: ['ID', 'Waktu Terima'], KESEPAKATAN_TL: ['ID', 'Waktu Terima'],
  FOTO_MONEV: ['ID', 'Waktu Terima'], LAPORAN_PERJADIN: ['ID', 'Waktu Terima']
};
const DEFAULT_SET = [
  ['kepada', 'Yth. Kepala Dinas Kesehatan Provinsi Sulawesi Selatan', 'Baris "Kepada" nota dinas'],
  ['dari', 'Pelaksana Kegiatan', 'Baris "Dari"'],
  ['tembusan', 'Pejabat Pelaksana Teknis Kegiatan (PPTK)', 'Baris "Tembusan"'],
  ['sifat', 'Biasa', 'Baris "Sifat"'],
  ['lampiran', '1 (satu) Exp', 'Baris "Lampiran"'],
  ['hal', 'Laporan Perjalanan Dinas Monitoring dan Evaluasi Capaian Program Gizi Aksi Stop Stunting Tahun 2026', 'PERLU DIKONFIRMASI ke Dinkes'],
  ['nama_kegiatan', 'Monitoring dan Evaluasi Capaian Program Gizi Aksi Stop Stunting', 'Dipakai di B.1 dan surat tugas. PERLU DIKONFIRMASI'],
  ['tujuan', 'Melaksanakan monitoring dan evaluasi capaian program gizi Aksi Stop Stunting di desa lokus untuk memastikan pemantauan sasaran, pemberian bantuan gizi, serta tindak lanjut balita dan ibu hamil berjalan sesuai ketentuan program', 'A.1 Tujuan. PERLU DIKONFIRMASI'],
  ['dpa', 'DPA Tahun Anggaran 2026 Nomor : ……… tanggal ………, Program ………', 'A.2.a Dasar DPA – isi sesuai DPA kegiatan ASS'],
  ['kota', 'Makassar', 'Tempat penandatanganan'],
  ['label_ttd', 'Pelaksana, SPD,', 'Label di atas tanda tangan']
];

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(n => {
    const sh = ss.getSheetByName(n) || ss.insertSheet(n);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS[n]);
      sh.getRange(1, 1, 1, HEADERS[n].length).setFontWeight('bold').setBackground('#C8102E').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  const set = ss.getSheetByName(SH.SET);
  if (set.getLastRow() === 1) set.getRange(2, 1, DEFAULT_SET.length, 3).setValues(DEFAULT_SET);
  if (ss.getSheetByName(SH.TIM).getLastRow() <= 1) isiMasterTim();
  const wil = ss.getSheetByName(SH.WIL);
  if (wil.getLastRow() === 1) wil.getRange(2, 1, 2, 3).setValues([['Kabupaten Soppeng', 'Contoh Kecamatan', 'Contoh Desa A'], ['Kabupaten Soppeng', 'Contoh Kecamatan', 'Contoh Desa B']]);
  ['MONEV_CAPAIAN', 'DAFTAR_BALITA_TL', 'KESEPAKATAN_TL', 'FOTO_MONEV', 'LAPORAN_PERJADIN'].forEach(n => ss.setActiveSheet(ss.getSheetByName(n)));
  ss.setActiveSheet(ss.getSheetByName(SH.TIM));
  DriveApp.getFolderById(ROOT_FOLDER_ID); // memastikan izin Drive
}

/* Kode tim = nama kabupaten/kota. Jalankan sekali untuk mengisi/menyusun ulang MASTER_TIM (24 kab/kota Sulsel). */
const KABKOTA_SULSEL = [
  ['SELAYAR', 'Kabupaten Kepulauan Selayar'], ['BULUKUMBA', 'Kabupaten Bulukumba'], ['BANTAENG', 'Kabupaten Bantaeng'],
  ['JENEPONTO', 'Kabupaten Jeneponto'], ['TAKALAR', 'Kabupaten Takalar'], ['GOWA', 'Kabupaten Gowa'], ['SINJAI', 'Kabupaten Sinjai'],
  ['MAROS', 'Kabupaten Maros'], ['PANGKEP', 'Kabupaten Pangkajene dan Kepulauan'], ['BARRU', 'Kabupaten Barru'], ['BONE', 'Kabupaten Bone'],
  ['SOPPENG', 'Kabupaten Soppeng'], ['WAJO', 'Kabupaten Wajo'], ['SIDRAP', 'Kabupaten Sidenreng Rappang'], ['PINRANG', 'Kabupaten Pinrang'],
  ['ENREKANG', 'Kabupaten Enrekang'], ['LUWU', 'Kabupaten Luwu'], ['TATOR', 'Kabupaten Tana Toraja'], ['LUTRA', 'Kabupaten Luwu Utara'],
  ['LUTIM', 'Kabupaten Luwu Timur'], ['TORUT', 'Kabupaten Toraja Utara'], ['MAKASSAR', 'Kota Makassar'], ['PAREPARE', 'Kota Parepare'], ['PALOPO', 'Kota Palopo']];
function isiMasterTim() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SH.TIM);
  sh.clear();
  sh.getRange(1, 1, 1, 2).setValues([HEADERS.MASTER_TIM]).setFontWeight('bold').setBackground('#C8102E').setFontColor('#ffffff');
  sh.getRange(2, 1, KABKOTA_SULSEL.length, 2).setValues(KABKOTA_SULSEL);
  sh.setFrozenRows(1);
  const ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName(SH.AGT)) { const a = ss.insertSheet(SH.AGT); a.appendRow(HEADERS.ANGGOTA_TIM); a.getRange(1, 1, 1, HEADERS.ANGGOTA_TIM.length).setFontWeight('bold').setBackground('#C8102E').setFontColor('#ffffff'); a.setFrozenRows(1); }
}

function doGet() { return json({ ok: true, app: 'Monev Capaian Gizi ASS', sheet: SpreadsheetApp.getActive().getName() }); }

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Data tidak terbaca' }); }
  try {
    const tim = cariTim(d.kode);
    if (!tim) return json({ ok: false, error: 'Kode tim tidak terdaftar' });
    if (d.action === 'login') return json(login(tim));
    if (d.action === 'upload') return json(upload(d));
    if (d.action === 'profil') return json(simpanProfil(d, tim));
    const lock = LockService.getScriptLock(); lock.waitLock(30000);
    try {
      if (d.action === 'simpanMonev') return json(simpanMonev(d, tim));
      if (d.action === 'simpanLaporan') return json(simpanLaporan(d, tim));
    } finally { lock.releaseLock(); }
    return json({ ok: false, error: 'Aksi tidak dikenal' });
  } catch (err) { return json({ ok: false, error: String(err && err.message || err) }); }
}

/* ---------- Tim & master ---------- */
function rows(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name); if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getDisplayValues();
}
function cariTim(kode) {
  kode = String(kode || '').trim().toUpperCase(); if (!kode) return null;
  const sh = SpreadsheetApp.getActive().getSheetByName(SH.TIM); if (!sh || sh.getLastRow() < 2) return null;
  const data = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
  const ik = kolom(data[0], ['kode'], 0), ib = kolom(data[0], ['kab', 'kota'], 1);
  const r = data.slice(1).filter(x => String(x[ik]).trim().toUpperCase() === kode);
  if (!r.length) return null;
  const kab = [...new Set(r.flatMap(x => String(x[ib]).split(/[,;]/).map(t => t.trim()).filter(Boolean)))];
  const anggota = rows(SH.AGT).filter(x => String(x[2]).toUpperCase() === kode)
    .map(x => ({ id: x[0], nama: x[4], pangkat: x[5], nip: String(x[6]).replace(/^'/, '') })).filter(a => a.nama);
  return { kode: kode, nama: 'Tim ' + kab.join(' & '), kab: kab, anggota: anggota };
}
function simpanProfil(d, tim) {
  const p = d.profil || {};
  if (!p.id || !p.nama) return { ok: false, error: 'Profil belum lengkap' };
  upsert(SH.AGT, p.id, { 'Waktu Terima': new Date(), 'Kode Tim': tim.kode, 'Kabupaten/Kota': tim.kab.join(', '),
    'Nama': p.nama, 'Pangkat/Golongan': p.pangkat || '', 'NIP': p.nip ? "'" + p.nip : '' });
  return { ok: true, anggota: cariTim(tim.kode).anggota };
}
/* Nama kabupaten dicocokkan longgar: "Kabupaten Barru" = "Kab. Barru" = "BARRU" */
const ALIAS_KAB = { 'kepulauan selayar': 'selayar', 'pangkajene dan kepulauan': 'pangkep', 'pangkajene kepulauan': 'pangkep',
  'sidenreng rappang': 'sidrap', 'tana toraja': 'tator', 'toraja utara': 'torut', 'luwu utara': 'lutra', 'luwu timur': 'lutim', 'pare-pare': 'parepare', 'pare pare': 'parepare', 'kep. selayar': 'selayar', 'kep selayar': 'selayar' };
function normKab(x) {
  const k = String(x || '').toLowerCase().replace(/^\s*(kabupaten|kab\.?|kota)\s+/, '').replace(/\s+/g, ' ').trim();
  return ALIAS_KAB[k] || k;
}
function kolom(h, kata, cadangan) {
  const i = h.findIndex(x => kata.some(k => String(x).toLowerCase().indexOf(k) >= 0));
  return i >= 0 ? i : cadangan;
}
function login(tim) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SH.WIL);
  const data = sh && sh.getLastRow() > 1 ? sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues() : [[]];
  const h = data[0], ik = kolom(h, ['kab', 'kota'], 0), ic = kolom(h, ['kec'], 1), id = kolom(h, ['desa', 'kel'], 2);
  // semua kab/kota ditampilkan; nama kabupaten diseragamkan ke nama resmi
  const peta = {}; KABKOTA_SULSEL.forEach(k => peta[normKab(k[1])] = k[1]); tim.kab.forEach(k => peta[normKab(k)] = k);
  const wilayah = data.slice(1).map(x => ({ kab: peta[normKab(x[ik])] || String(x[ik] || '').trim(), kec: String(x[ic] || '').trim(), desa: String(x[id] || '').trim() }))
    .filter(w => w.kab && w.kec && w.desa);
  const pengaturan = {}; rows(SH.SET).forEach(x => { if (x[0]) pengaturan[String(x[0]).trim()] = x[1]; });
  return { ok: true, tim: { kode: tim.kode, nama: tim.nama, kab: tim.kab }, anggota: tim.anggota, wilayah: wilayah, pengaturan: pengaturan,
    monev: ambilJson(SH.MONEV, tim.kode), laporan: ambilJson(SH.LAP, tim.kode) };
}
function ambilJson(name, kode) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name); if (!sh || sh.getLastRow() < 2) return [];
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], ik = h.indexOf('Kode Tim'), ij = h.indexOf('JSON');
  if (ik < 0 || ij < 0) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues()
    .filter(r => String(r[ik]).toUpperCase() === kode && r[ij]).map(r => { try { return JSON.parse(r[ij]); } catch (e) { return null; } }).filter(Boolean);
}

/* ---------- Drive ---------- */
function folderPath(parts) {
  let f = DriveApp.getFolderById(ROOT_FOLDER_ID);
  [SUBFOLDER].concat(parts).forEach(p => {
    p = String(p || 'Lainnya').trim() || 'Lainnya';
    const it = f.getFoldersByName(p); f = it.hasNext() ? it.next() : f.createFolder(p);
  });
  return f;
}
function upload(d) {
  const m = String(d.data).match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return { ok: false, error: 'Format file tidak valid' };
  const folder = folderPath(d.path || []);
  const old = folder.getFilesByName(d.name); while (old.hasNext()) old.next().setTrashed(true); // ganti versi lama
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], d.name));
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* kebijakan domain */ }
  return { ok: true, id: file.getId(), url: file.getUrl() };
}

/* ---------- Simpan ---------- */
function simpanMonev(d, tim) {
  const now = new Date();
  const row = Object.assign({}, d.row, { 'Waktu Terima': now, 'JSON': d.json });
  upsert(SH.MONEV, d.id, row);
  replaceChildren(SH.BALITA, d.id, (d.balita || []).map(r => Object.assign({ 'Waktu Terima': now }, r)));
  replaceChildren(SH.SEPAKAT, d.id, (d.sepakat || []).map(r => Object.assign({ 'Waktu Terima': now }, r)));
  replaceChildren(SH.FOTO, d.id, (d.foto || []).map(r => Object.assign({ 'Waktu Terima': now }, r)));
  return { ok: true, id: d.id };
}
function simpanLaporan(d, tim) {
  upsert(SH.LAP, d.id, Object.assign({}, d.row, { 'Waktu Terima': new Date(), 'JSON': d.json }));
  return { ok: true, id: d.id };
}

/* Tambah kolom baru otomatis bila belum ada; kolom JSON selalu di paling kanan */
function ensureHeaders(sh, keys) {
  let h = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
  const miss = keys.filter(k => h.indexOf(k) < 0 && k !== 'JSON');
  if (miss.length) {
    let pos = h.indexOf('JSON');
    if (pos >= 0) { sh.insertColumnsBefore(pos + 1, miss.length); sh.getRange(1, pos + 1, 1, miss.length).setValues([miss]); }
    else sh.getRange(1, h.length + 1, 1, miss.length).setValues([miss]);
    h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  }
  if (keys.indexOf('JSON') >= 0 && h.indexOf('JSON') < 0) { sh.getRange(1, h.length + 1).setValue('JSON'); h.push('JSON'); }
  sh.getRange(1, 1, 1, h.length).setFontWeight('bold').setBackground('#C8102E').setFontColor('#ffffff');
  return h;
}
function toRow(h, obj) { return h.map(k => obj[k] === undefined || obj[k] === null ? '' : obj[k]); }
function upsert(name, id, obj) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  const h = ensureHeaders(sh, Object.keys(obj));
  const r = toRow(h, Object.assign({ 'ID': id }, obj));
  const n = sh.getLastRow(), ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(x => x[0]) : [];
  const i = ids.indexOf(id);
  if (i >= 0) sh.getRange(i + 2, 1, 1, r.length).setValues([r]); else sh.getRange(n + 1, 1, 1, r.length).setValues([r]);
}
function replaceChildren(name, id, list) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  const n = sh.getLastRow();
  if (n > 1) { const ids = sh.getRange(2, 1, n - 1, 1).getValues(); for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === id) sh.deleteRow(i + 2); }
  if (!list.length) return;
  const keys = [...new Set(list.flatMap(o => Object.keys(o)))];
  const h = ensureHeaders(sh, keys);
  sh.getRange(sh.getLastRow() + 1, 1, list.length, h.length).setValues(list.map(o => toRow(h, Object.assign({ 'ID': id }, o))));
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
