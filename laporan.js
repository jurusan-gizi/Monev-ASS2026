/* Menu Laporan Perjalanan Dinas (Nota Dinas) → .docx
   Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel */
(() => {
const { $, esc, fmtTgl, newId, toast, modal, closeModal, confirmBox, setNav, footer, idb, BULAN } = A;
const app = A.app;
const KL = 'mass_laps';
let laps = A.load(KL, []);
const saveLaps = () => localStorage.setItem(KL, JSON.stringify(laps));
const sess = () => A.sess();
const P = k => (sess().pengaturan || {})[k] || DEFAULT_SET[k] || '';
const DEFAULT_SET = {
  kepada: 'Yth. Kepala Dinas Kesehatan Provinsi Sulawesi Selatan', dari: 'Pelaksana Kegiatan',
  tembusan: 'Pejabat Pelaksana Teknis Kegiatan (PPTK)', sifat: 'Biasa', lampiran: '1 (satu) Exp',
  nama_kegiatan: 'Monitoring dan Evaluasi Capaian Program Gizi Aksi Stop Stunting',
  hal: 'Laporan Perjalanan Dinas Monitoring dan Evaluasi Capaian Program Gizi Aksi Stop Stunting Tahun 2026',
  tujuan: 'Melaksanakan monitoring dan evaluasi capaian program gizi Aksi Stop Stunting di desa lokus untuk memastikan pemantauan sasaran, pemberian bantuan gizi, serta tindak lanjut balita dan ibu hamil berjalan sesuai ketentuan program',
  dpa: 'DPA Tahun Anggaran 2026 Nomor : ……… tanggal ………, Program ………',
  kota: 'Makassar', label_ttd: 'Pelaksana, SPD,'
};
const kabLabel = k => /^(kab|kota)/i.test(k) ? k.replace(/^kab\.?\s/i, 'Kabupaten ') : 'Kabupaten ' + k;
const fnum = x => String(x).replace('.', ',');
const ada = x => A.isi(x);
const lc1 = s => String(s).replace(/^([A-Z])(?=[a-z])/, c => c.toLowerCase());
const kal = s => { s = String(s || '').trim(); return !s ? '' : /[.!?]$/.test(s) ? s : s + '.'; };
const TERBILANG = ['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
const terbilang = n => n < 12 ? TERBILANG[n] : n < 20 ? terbilang(n - 10) + ' belas' : n < 100 ? terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '') : String(n);
function waktu(a, b) {
  if (!a) return '';
  b = b || a; const [ya, ma, da] = a.split('-').map(Number), [yb, mb, db] = b.split('-').map(Number);
  const hari = Math.round((new Date(b) - new Date(a)) / 864e5) + 1;
  const rentang = a === b ? fmtTgl(a) : ya === yb && ma === mb ? `${da} – ${db} ${BULAN[mb - 1]} ${yb}` : ya === yb ? `${da} ${BULAN[ma - 1]} – ${db} ${BULAN[mb - 1]} ${yb}` : `${fmtTgl(a)} – ${fmtTgl(b)}`;
  return `Tanggal ${rentang}, Selama ${hari} (${terbilang(hari)}) hari`;
}

/* ---------- Penyusun draf dari data monev ---------- */
const desaRecs = L => L.desaIds.map(id => A.recs().find(r => r.id === id)).filter(Boolean);
const kendalaDari = (r, nos) => nos.map(n => (r.kendala[n] || '').trim()).filter(Boolean);
const pr = (a, b, sat) => `${fnum(Math.round(a / b * 1000) / 10)}% (${a} dari ${b} ${sat})`;

function teksLembar(r, lb) {
  const v = r.v, s = [];
  const N = k => ada(v[k]) ? +v[k] : null;
  if (lb === 1) {
    const p = [];
    if (N('balita_total')) p.push(`cakupan pemantauan balita sebesar ${pr(N('balita_ada') || 0, N('balita_total'), 'balita')}`);
    if (N('bumil_total')) p.push(`ibu hamil sebesar ${pr(N('bumil_ada') || 0, N('bumil_total'), 'orang')}`);
    if (p.length) s.push(`${p.join(' dan ')}${ada(v.gab_pct) ? `, sehingga cakupan gabungan mencapai ${fnum(v.gab_pct)}% dengan status desa ${v.warna_desa}` : ''}.`);
    if (ada(v.dusun_rendah)) s.push(`Dusun/Posyandu dengan cakupan terendah adalah ${v.dusun_rendah}${N('dusun_belum') !== null ? `, dengan ${N('dusun_belum')} balita belum memiliki data` : ''}.`);
    if (N('bb_n')) s.push(`Dari ${N('bb_n')} balita yang dibandingkan, ${N('bb_naik') ?? 0} balita (${fnum(v.bb_naik_pct || 0)}%) mengalami kenaikan berat badan, ${N('bb_tetap') ?? 0} tetap, dan ${N('bb_turun') ?? 0} turun${ada(v.bb_rata) ? `, dengan rata-rata perubahan berat badan ${fnum(v.bb_rata)} kg` : ''}.`);
    const sg = [['bbk', 'berat badan kurang'], ['pdk', 'pendek (stunting)'], ['krs', 'kurus (wasting)']].filter(([k]) => ada(v[k + '_a']) && ada(v[k + '_m']))
      .map(([k, l]) => `balita ${l} dari ${v[k + '_a']}${ada(v[k + '_an']) ? '/' + v[k + '_an'] : ''} menjadi ${v[k + '_m']}${ada(v[k + '_mn']) ? '/' + v[k + '_mn'] : ''}`);
    if (sg.length) s.push(`Dibandingkan data awal, jumlah ${sg.join(', ')} pada Minggu ke-4.`);
    if (v.janggal === 'Ada') s.push(`Ditemukan ${N('janggal_n') ?? 'beberapa'} data pengukuran yang janggal${ada(v.janggal_cara) ? `, dan perbaikannya dilakukan dengan ${v.janggal_cara.trim().replace(/\.$/, '')}` : ''}.`);
  }
  if (lb === 2) {
    if (N('pmt_sas')) s.push(`PMT lokal balita telah diterima oleh ${N('pmt_trm') ?? 0} dari ${N('pmt_sas')} sasaran${N('pmt_sas') - (N('pmt_trm') || 0) > 0 ? ` (${N('pmt_sas') - (N('pmt_trm') || 0)} belum menerima)` : ''}${ada(v.pmt_cara) ? `; kader memastikan penerimaan dan konsumsi melalui ${v.pmt_cara.map(lc1).join(', ')}` : ''}.`);
    if (N('tab_sas')) s.push(`Taburia telah diterima oleh ${N('tab_trm') ?? 0} dari ${N('tab_sas')} sasaran${v.tab_sesuai ? `, dengan pemakaian ${lc1(v.tab_sesuai)}` : ''}${ada(v.tab_kendala) ? ` (kendala: ${v.tab_kendala.map(lc1).join(', ')}${ada(v.tab_kendala_lain) ? ', ' + v.tab_kendala_lain : ''})` : ''}.`);
    if (N('kons_sas')) s.push(`Konseling gizi/KAP telah diberikan kepada pengasuh ${pr(N('kons_n') || 0, N('kons_sas'), 'balita sasaran')}${ada(v.kons_jadwal) ? `, dengan jadwal pemantauan oleh kader ${v.kons_jadwal}` : ''}.`);
    if (N('pkmk_anj')) s.push(`Dari ${N('pkmk_anj')} balita yang dianjurkan mendapat PKMK, ${N('pkmk_trm') ?? 0} balita sudah menerima${N('pkmk_putus') ? ` dan ${N('pkmk_putus')} balita pemberiannya terputus` : ''}.`);
  }
  if (lb === 3) {
    if (N('tl_n')) s.push(`Terdapat ${N('tl_n')} balita yang perlu ditindaklanjuti${ada(v.tl_alasan) ? `, terutama karena ${v.tl_alasan.map(lc1).join(', ')}` : ''}; ${N('tl_periksa') ?? 0} balita sudah diperiksa di Puskesmas dan ${N('tl_tunggu') ?? 0} balita masih menunggu${ada(v.tl_pendamping) ? `, dengan pendamping ${v.tl_pendamping}` : ''}.`);
    if (N('rj_n')) s.push(`Sebanyak ${N('rj_n')} balita dirujuk ke rumah sakit: ${N('rj_datang') ?? 0} sudah datang, ${N('rj_belum') ?? 0} belum datang, dan ${N('rj_kabar') ?? 0} belum ada kabar hasilnya${ada(v.rj_hambatan) ? `. Hambatan yang disampaikan keluarga antara lain ${v.rj_hambatan.map(lc1).join(', ')}${ada(v.rj_hambatan_lain) ? ', ' + v.rj_hambatan_lain : ''}` : ''}.`);
    const bl = r.balita.filter(b => b.nama);
    if (bl.length) s.push(`Tercatat ${bl.length} balita yang belum diperiksa di Puskesmas atau belum ke rumah sakit dan telah disepakati tindak lanjutnya bersama kader dan bidan desa.`);
  }
  if (lb === 4) {
    const g = [['kek', 'KEK'], ['bahaya', 'dengan tanda bahaya'], ['merah', 'berstatus merah']].filter(([k]) => N(k) !== null).map(([k, l]) => `${N(k)} ibu hamil ${l}`);
    if (g.length) s.push(`Terdapat ${g.join(', ')}${N('bm_rujuk') !== null ? `; ${N('bm_rujuk')} di antaranya dirujuk, ${N('bm_layani') ?? 0} sudah dilayani, dan ${N('bm_cari') ?? 0} masih perlu dicari` : ''}${v.bm_konfirm ? `. Tindak lanjut tanda bahaya ${v.bm_konfirm === 'Sudah' ? 'sudah' : 'belum'} dipastikan ke bidan` : ''}.`);
    if (N('ttd_tot')) s.push(`Ibu hamil yang tercatat minum TTD/MMS sebanyak ${pr(N('ttd_n') || 0, N('ttd_tot'), 'ibu hamil')}${ada(v.ttd_cek) ? `, dicek melalui ${v.ttd_cek.map(lc1).join(', ')}` : ''}.`);
    const sp = [];
    if (N('susu_sas')) sp.push(`susu ibu hamil diterima ${N('susu_trm') ?? 0} dari ${N('susu_sas')} sasaran`);
    if (N('pmtb_sas')) sp.push(`PMT ibu hamil diterima ${N('pmtb_trm') ?? 0} dari ${N('pmtb_sas')} sasaran`);
    if (sp.length) s.push(sp.join(', sedangkan ').replace(/^./, c => c.toUpperCase()) + '.');
    if (N('kb_tot')) s.push(`Konseling gizi/KAP telah diberikan kepada ${pr(N('kb_n') || 0, N('kb_tot'), 'ibu hamil')}${ada(v.kb_topik) ? ` dengan topik ${v.kb_topik.map(lc1).join(', ')}` : ''}${N('kb_perlu') ? `; ${N('kb_perlu')} ibu hamil masih perlu didampingi` : ''}.`);
  }
  const kd = kendalaDari(r, IND.filter(i => i.lb === lb).map(i => i.no));
  if (kd.length) s.push(`Kendala yang ditemukan: ${kd.map(x => x.replace(/\.$/, '')).join('; ')}.`);
  return s.length ? `Di Desa ${r.desa} (Kecamatan ${r.kec}), ${lc1(s.join(' '))}` : '';
}

function susunDraf(L) {
  const R = desaRecs(L), kab = kabLabel(L.kab);
  const daftarDesa = R.map(r => `Desa ${r.desa} (Kecamatan ${r.kec})`);
  const gabung = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' dan ' + a.at(-1);
  const t = {};
  t.tujuan = P('tujuan');
  t.dpa = P('dpa');
  t.penerima = R.map(r => `Pemerintah Desa ${r.desa}, kader, dan bidan desa (Kecamatan ${r.kec})`).join('\n');
  t.c_intro = `Dalam rangka pelaksanaan Perjalanan Dinas ${P('nama_kegiatan')} Tahun 2026, telah dilaksanakan kegiatan monitoring dan evaluasi di ${R.length} desa di ${kab}, yaitu ${gabung(daftarDesa)}. Dalam pelaksanaan kegiatan, pelaksana perjalanan dinas menggunakan Daftar Tilik Monitoring Evaluasi Capaian Program Gizi Aksi Stop Stunting sebagai instrumen pengumpulan informasi, dengan data acuan ${DATA_ACUAN}.\n\nPengumpulan informasi dilakukan melalui wawancara dengan kader, bidan desa, Tenaga Pelaksana Gizi (TPG), dan perwakilan pemerintah desa, serta pemeriksaan bukti catatan sesuai indikator dalam daftar tilik. Berdasarkan hasil monitoring dan wawancara, diperoleh informasi sebagai berikut:`;
  LEMBAR.forEach(lb => { t['c' + lb.no] = R.map(r => teksLembar(r, lb.no)).filter(Boolean).join('\n\n') || 'Tidak ada temuan yang dicatat pada kelompok indikator ini.'; });
  const d = [];
  R.forEach(r => {
    IND.forEach(it => { const x = (r.rencana[it.no] || '').trim(); if (x) d.push(`Desa ${r.desa} – ${it.judul}: ${kal(x)}`); });
    r.sepakat.filter(p => p.kegiatan).forEach(p => d.push(`Desa ${r.desa} menyepakati ${p.kegiatan.trim().replace(/\.$/, '')}${p.masalah ? ` untuk mengatasi ${p.masalah.trim()}` : ''}${p.pj ? `, dengan penanggung jawab ${p.pj}` : ''}${p.batas ? ` dan batas waktu ${fmtTgl(p.batas)}` : ''}.`));
  });
  t.d = d.join('\n') || 'Perlu dilakukan pemantauan lanjutan terhadap indikator yang belum mencapai target.';
  const lemah = [...new Set(R.flatMap(r => IND.filter(it => (r.kendala[it.no] || '').trim()).map(it => lc1(it.judul))))];
  const warna = R.filter(r => r.v.warna_desa).map(r => `Desa ${r.desa} (${r.v.warna_desa})`);
  t.e = `Secara umum, pelaksanaan program gizi Aksi Stop Stunting di ${R.length} desa yang dikunjungi di ${kab} telah berjalan${warna.length ? `, dengan status cakupan pemantauan ${gabung(warna)}` : ''}.${lemah.length ? ` Namun demikian, masih terdapat beberapa aspek yang perlu diperkuat, terutama pada ${gabung(lemah)}.` : ''}\n\nHasil monitoring diharapkan dapat menjadi bahan evaluasi bagi Dinas Kesehatan ${kab}, puskesmas, dan pemerintah desa dalam menyusun langkah tindak lanjut, khususnya terhadap indikator yang masih memerlukan peningkatan. Selain itu, praktik baik yang telah berjalan di desa dapat didokumentasikan dan dikembangkan sebagai pembelajaran untuk pelaksanaan program secara berkelanjutan.`;
  return t;
}

/* ---------- Daftar laporan ---------- */
function laporanHome() {
  scrollTo(0, 0); setNav([{ text: '← Beranda', cls: 'btn-o', fn: A.home }]);
  const list = laps.filter(l => l.kode === sess().kode).sort((a, b) => b.updated - a.updated);
  app.innerHTML = `${A.statusBar()}<button class="btn btn-b btn-big" id="lNew">＋ Buat Laporan Perjadin</button>
    <h2>Laporan Perjadin (${list.length})</h2>
    ${list.length ? list.map(l => `<div class="card"><div class="rec"><div class="t"><b>${esc(kabLabel(l.kab))}</b>
      <div class="m">${l.desaIds.length} desa · ${l.berangkat ? fmtTgl(l.berangkat) : '-'}${l.nomor ? ' · No. ' + esc(l.nomor) : ''}</div></div>${A.badgeStatus(l)}</div>
      <div class="acts"><button class="btn btn-o btn-sm" data-a="open" data-id="${l.id}">✏️ Buka</button>
      <button class="btn btn-o btn-sm" data-a="dl" data-id="${l.id}">⬇️ Unduh .docx</button>
      <button class="btn btn-o btn-sm" data-a="del" data-id="${l.id}">🗑️</button></div></div>`).join('')
      : `<div class="card empty">Belum ada laporan.<br>Laporan disusun otomatis dari desa yang sudah dimonev.</div>`}${footer()}`;
  const sb = $('#btnSync'); if (sb) sb.onclick = () => A.sync(true);
  $('#lNew').onclick = () => {
    const kabs = [...new Set(A.recs().filter(r => r.kode === sess().kode && r.status === 'final').map(r => r.kab))];
    if (!kabs.length) return toast('Belum ada desa yang selesai dimonev (Simpan & Kirim)', 4000);
    if (kabs.length === 1) return buat(kabs[0]);
    const c = modal(`<h3 class="t">Pilih Kabupaten/Kota</h3>${kabs.map(k => `<button class="btn btn-o" style="width:100%;margin-bottom:8px" data-k="${esc(k)}">${esc(k)}</button>`).join('')}`);
    c.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { closeModal(); buat(b.dataset.k); });
  };
  app.querySelectorAll('[data-a]').forEach(el => el.onclick = async () => {
    const L = laps.find(x => x.id === el.dataset.id);
    if (el.dataset.a === 'open') editor(L);
    if (el.dataset.a === 'dl') unduh(L);
    if (el.dataset.a === 'del') confirmBox('Hapus laporan ini dari HP?' + (L.synced ? '<br><small>Arsip di server tetap ada.</small>' : ''), 'Hapus', () => { laps = laps.filter(x => x !== L); saveLaps(); laporanHome(); });
  });
}
A.laporanHome = laporanHome;

function buat(kab) {
  const S = sess(), d = A.recs().filter(r => r.kode === S.kode && r.kab === kab && r.status === 'final');
  if (!d.length) return toast('Belum ada desa yang selesai dimonev (status Simpan & Kirim) di ' + kab, 4000);
  const tgl = d.map(r => r.tanggal).sort();
  const L = { id: newId('LP'), kode: S.kode, kab, nomor: '', tglNota: A.today(), sifat: P('sifat'), lampiran: P('lampiran'), hal: P('hal'),
    kepada: P('kepada'), dari: P('dari'), tembusan: P('tembusan'), noST: '', tglST: '', berangkat: tgl[0], pulang: tgl.at(-1),
    desaIds: d.map(r => r.id), anggota: A.anggotaTim().map(a => ({ ...a, ikut: true })), teks: {}, edited: false,
    status: 'draf', synced: false, created: Date.now(), updated: Date.now() };
  L.teks = susunDraf(L); laps.push(L); saveLaps(); editor(L);
}

/* ---------- Editor ---------- */
const touch = L => { L.updated = Date.now(); L.synced = false; saveLaps(); };
function editor(L) {
  scrollTo(0, 0);
  // anggota yang baru mendaftar ikut masuk; pangkat/NIP diperbarui
  A.anggotaTim().forEach(a => {
    const x = L.anggota.find(y => (a.id && y.id === a.id) || y.nama === a.nama);
    if (x) Object.assign(x, { id: a.id, nama: a.nama, pangkat: a.pangkat, nip: a.nip }); else L.anggota.push({ ...a, ikut: true });
  });
  const S = sess(), semua = A.recs().filter(r => r.kode === S.kode && r.kab === L.kab && r.status === 'final');
  const inp = (k, l, type = 'text', src = L) => `<div class="fi ${type === 'text' ? 'wide' : ''}"><label>${l}</label><input type="${type}" data-l="${k}" value="${esc(src[k] ?? '')}"></div>`;
  const ta = (k, l, rows = 5, hint = '') => `<label class="f">${l}</label>${hint ? `<div class="hint">${hint}</div>` : ''}<textarea data-t="${k}" rows="${rows}" style="min-height:${rows * 24}px">${esc(L.teks[k] || '')}</textarea>`;
  app.innerHTML = `<div class="step-top"><span>📄 Laporan Perjadin</span><span>${esc(kabLabel(L.kab))}</span></div>
    <div class="card"><h3 class="t">1. Data Nota Dinas</h3><div class="fl">
      ${inp('nomor', 'Nomor nota dinas')}${inp('tglNota', 'Tanggal nota dinas', 'date')}${inp('sifat', 'Sifat', 'text')}${inp('lampiran', 'Lampiran')}
      ${inp('hal', 'Hal')}${inp('kepada', 'Kepada')}${inp('dari', 'Dari')}${inp('tembusan', 'Tembusan')}
      ${inp('noST', 'Nomor surat tugas')}${inp('tglST', 'Tanggal surat tugas', 'date')}${inp('berangkat', 'Tanggal berangkat', 'date')}${inp('pulang', 'Tanggal kembali', 'date')}
    </div><div class="hint" id="lama" style="margin-top:8px">${esc(waktu(L.berangkat, L.pulang))}</div></div>

    <div class="card"><h3 class="t">2. Desa yang Dikunjungi</h3><div class="opts">${semua.map(r => `<label><input type="checkbox" data-desa="${r.id}" ${L.desaIds.includes(r.id) ? 'checked' : ''}>Desa ${esc(r.desa)} · ${A.fmtTgl(r.tanggal)}</label>`).join('')}</div>
      <button class="btn btn-o" id="redraft" style="width:100%;margin-top:12px">🔄 Susun ulang draf dari data monev</button></div>

    <div class="card"><h3 class="t">3. Pelaksana & Tanda Tangan</h3><div class="hint">Centang anggota yang ikut, lalu tanda tangan di kotak. Kosongkan jika ingin tanda tangan basah setelah dicetak.</div>
      ${L.anggota.map((a, n) => `<div class="mini" style="margin-top:10px"><label class="hd2" style="cursor:pointer"><span><input type="checkbox" data-ikut="${n}" ${a.ikut ? 'checked' : ''}> ${esc(a.nama)}</span></label>
        <div class="m">${esc(a.pangkat || '-')} · NIP ${esc(a.nip || '-')}</div><div data-pad="${n}" style="margin-top:6px"></div></div>`).join('')}</div>

    <div class="card"><h3 class="t">4. Isi Laporan (bisa diedit)</h3>
      ${ta('tujuan', 'A.1 Tujuan perjalanan dinas', 3)}${ta('dpa', 'A.2 Dasar pelaksanaan – DPA', 3)}
      ${ta('penerima', 'B.3 Pejabat/pelaksana/instansi yang menerima di tujuan', 3, 'Satu baris = satu butir.')}
      ${ta('c_intro', 'C. Pengantar informasi dan hasil', 7)}
      ${LEMBAR.map(lb => ta('c' + lb.no, `C.${'abcd'[lb.no - 1]} ${lb.topik}`, 7)).join('')}
      ${ta('d', 'D. Kesimpulan / saran pertimbangan', 8, 'Satu baris = satu butir.')}
      ${ta('e', 'E. Penutup', 6, 'Kalimat "Demikian dilaporkan…" ditambahkan otomatis.')}</div>
    ${L.status === 'final' ? `<div class="card" style="text-align:center">${L.synced ? '✔ Tersimpan di server' : '⏳ Akan dikirim ke server saat online'}</div>` : ''}
    ${footer()}`;
  app.querySelectorAll('[data-l]').forEach(el => el.oninput = () => { L[el.dataset.l] = el.value; touch(L); $('#lama').textContent = waktu(L.berangkat, L.pulang); });
  app.querySelectorAll('[data-t]').forEach(el => el.oninput = () => { L.teks[el.dataset.t] = el.value; L.edited = true; touch(L); });
  app.querySelectorAll('[data-desa]').forEach(el => el.onchange = () => {
    L.desaIds = [...app.querySelectorAll('[data-desa]:checked')].map(x => x.dataset.desa); touch(L); toast('Tekan "Susun ulang draf" agar isi laporan ikut berubah');
  });
  app.querySelectorAll('[data-ikut]').forEach(el => el.onchange = () => { L.anggota[el.dataset.ikut].ikut = el.checked; touch(L); });
  $('#redraft').onclick = () => {
    if (!L.desaIds.length) return toast('Pilih minimal satu desa');
    const go = () => { L.teks = susunDraf(L); L.edited = false; touch(L); editor(L); toast('Draf disusun ulang'); };
    L.edited ? confirmBox('Isi laporan yang sudah Bapak/Ibu edit akan diganti draf baru. Lanjutkan?', 'Susun ulang', go) : go();
  };
  L.anggota.forEach(async (a, n) => {
    const mid = L.id + '_ttd_' + n, init = a.mid ? await idb.get(mid) : null;
    A.sigPad(app.querySelector(`[data-pad="${n}"]`), init, async data => {
      if (data) { await idb.set(mid, data); a.mid = mid; } else { await idb.del(mid); delete a.mid; }
      touch(L);
    });
  });
  setNav([{ text: '← Daftar', cls: 'btn-o', fn: laporanHome }, { text: '⬇️ .docx', cls: 'btn-b', fn: () => unduh(L) },
    { text: 'Simpan ✔', cls: 'btn-g', fn: () => finalisasi(L) }]);
}

async function finalisasi(L) {
  if (!L.desaIds.length) return toast('Pilih minimal satu desa');
  if (!L.anggota.some(a => a.ikut)) return toast('Centang minimal satu pelaksana');
  try {
    const blob = await buatDocx(L);
    await idb.set(L.id + '_docx', await blobToDataURL(blob));
    L.status = 'final'; L.docxUrl = ''; touch(L); toast('Laporan tersimpan ✔'); laporanHome(); A.sync();
  } catch (e) { console.error(e); toast('Gagal membuat file: ' + e.message, 4000); }
}
const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
const dataURLtoBytes = d => { const b = atob(d.split(',')[1]); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const namaFile = L => `Laporan_Perjadin_Monev_ASS_${L.kab.replace(/\W+/g, '_')}_${L.berangkat || ''}.docx`;

async function unduh(L) {
  try {
    const blob = await buatDocx(L);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = namaFile(L);
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  } catch (e) { console.error(e); toast('Gagal membuat file: ' + e.message, 4000); }
}

/* ---------- Pembuat .docx (format Nota Dinas Dinkes Prov. Sulsel, F4) ---------- */
async function buatDocx(L) {
  if (!window.docx) throw new Error('library docx belum termuat');
  const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, LevelFormat, VerticalAlign, TableLayoutType } = docx;
  const FONT = 'Arial', SZ = 22, CW = 12191 - 1191 - 1134;
  const T = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || SZ, bold: o.bold, underline: o.u ? {} : undefined, italics: o.i });
  const Pg = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [T(children, o)], alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: o.img ? { before: 0, after: o.after ?? 0 } : { before: o.before || 0, after: o.after ?? 0, line: o.line ?? 360 }, indent: o.indent, border: o.border, keepNext: o.keepNext, numbering: o.numbering });
  const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, nob = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
  const cell = (children, w, o = {}) => new TableCell({ children, width: { size: w, type: WidthType.DXA }, borders: nob, verticalAlign: o.va, margins: { left: 60, right: 60 } });
  const logo = new Uint8Array(await (await fetch('icons/kop-logo.png')).arrayBuffer());

  const kop = new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1500, CW - 1500], layout: TableLayoutType.FIXED, borders: nob, rows: [new TableRow({ children: [
    cell([Pg([new ImageRun({ type: 'png', data: logo, transformation: { width: 78, height: 81 } })], { align: AlignmentType.CENTER, img: true })], 1500, { va: VerticalAlign.CENTER }),
    cell([Pg('PEMERINTAH PROVINSI SULAWESI SELATAN', { bold: true, size: 28, align: AlignmentType.CENTER, line: 260 }),
      Pg('DINAS KESEHATAN', { bold: true, size: 36, align: AlignmentType.CENTER, line: 300 }),
      Pg('Jl. Perintis Kemerdekaan KM 11 Tamalanrea Telp 586454 Fax. (0411) 586451', { size: 16, align: AlignmentType.CENTER, line: 240 }),
      Pg('Laman: dinkes.sulselprov.go.id  Pos-el: dinaskesehatanprovsulsel@gmail.com  Kode Pos 90245', { size: 16, align: AlignmentType.CENTER, line: 240 })], CW - 1500, { va: VerticalAlign.CENTER })] })] });
  const garis = new Paragraph({ children: [], spacing: { before: 40, after: 200 }, border: { bottom: { style: BorderStyle.THICK_THIN_SMALL_GAP, size: 18, color: '000000', space: 1 } } });

  const meta = [['Kepada', L.kepada], ['Dari', L.dari], ['Tembusan', L.tembusan], ['Tanggal', fmtTgl(L.tglNota)], ['Nomor', L.nomor || '………'],
    ['Sifat', L.sifat], ['Lampiran', L.lampiran], ['Hal', L.hal]];
  const mt = new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1500, 300, CW - 1800], layout: TableLayoutType.FIXED, borders: nob,
    rows: meta.map(([a, b]) => new TableRow({ children: [cell([Pg(a, { line: 276, align: AlignmentType.LEFT })], 1500), cell([Pg(':', { line: 276 })], 300), cell([Pg(b || '', { line: 276, align: AlignmentType.LEFT })], CW - 1800)] })) });

  const R = desaRecs(L), kab = kabLabel(L.kab);
  const H1 = (h, t) => Pg([T(h + '\t'), T(t)], { before: 160, indent: { left: 360, hanging: 360 }, keepNext: true });
  const H2 = (h, t, o = {}) => Pg(typeof t === 'string' ? [T(h + '\t'), T(t)] : [T(h + '\t'), ...t], { indent: { left: 720, hanging: 360 }, ...o });
  const H3 = (h, t) => Pg([T(h + '\t'), T(t)], { indent: { left: 1080, hanging: 360 } });
  const body = (t, left = 720, first = 0) => String(t || '').split(/\n\s*\n/).filter(x => x.trim()).map(x => Pg(x.trim(), { indent: { left, firstLine: first }, after: 60 }));
  const lines = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean);

  const isi = [
    kop, garis, Pg('NOTA DINAS', { bold: true, size: 36, align: AlignmentType.CENTER, after: 200, line: 276 }), mt,
    new Paragraph({ children: [], spacing: { before: 120, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } } }),
    Pg(`Dengan ini dilaporkan kepada Bapak/Ibu berupa hasil pelaksanaan perjalanan dinas di ${kab}, hal sebagai berikut :`, { indent: { firstLine: 720 }, after: 60 }),
    H1('A.', 'PENDAHULUAN'),
    H2('1.', 'Tujuan Perjalanan Dinas'), ...body(L.teks.tujuan),
    H2('2.', 'Dasar Pelaksanaan'), Pg('Kegiatan perjalanan dinas ini dilaksanakan berdasarkan :', { indent: { left: 720 } }),
    H3('a.', L.teks.dpa || ''),
    H3('b.', `Surat Tugas Nomor : ${L.noST || '………'}, tanggal ${L.tglST ? fmtTgl(L.tglST) : '………'} tentang ${P('nama_kegiatan')} Tahun 2026.`),
    H1('B.', 'KEGIATAN YANG DILAKSANAKAN'),
    H2('1.', `Nama Kegiatan : ${P('nama_kegiatan')} di ${kab}.`),
    H2('2.', `Waktu : ${waktu(L.berangkat, L.pulang)}`),
    H2('3.', 'Pejabat/Pelaksana/Instansi yang menerima di tujuan :'),
    ...lines(L.teks.penerima).map((x, n) => H3(String.fromCharCode(97 + n) + '.', x)),
    H1('C.', 'INFORMASI DAN HASIL YANG DICAPAI'),
    ...body(L.teks.c_intro, 360),
    ...LEMBAR.flatMap(lb => {
      const par = String(L.teks['c' + lb.no] || '').split(/\n\s*\n/).filter(x => x.trim());
      return [H2('abcd'[lb.no - 1] + '.', [T(lb.topik, { bold: true }), T(' : ' + (par[0] || '').trim())], { after: 60 }), ...par.slice(1).map(x => Pg(x.trim(), { indent: { left: 720 }, after: 60 }))];
    }),
    H1('D.', 'KESIMPULAN / SARAN PERTIMBANGAN'),
    ...lines(L.teks.d).map(x => Pg(x, { numbering: { reference: 'bul', level: 0 }, after: 60 })),
    H1('E.', 'PENUTUP'),
    ...body(L.teks.e, 360, 0),
    Pg('Demikian dilaporkan kepada Bapak / Ibu untuk mohon maklum dan bahan pertimbangan lebih lanjut.', { indent: { left: 360 }, after: 240 })
  ];

  // Blok tanda tangan: semua pelaksana
  const ikut = L.anggota.filter(a => a.ikut);
  const ttdCell = async (a, w) => {
    const img = a?.mid ? await idb.get(a.mid) : null;
    if (!a) return cell([Pg('')], w);
    return cell([
      img ? Pg([new ImageRun({ type: 'png', data: dataURLtoBytes(img), transformation: { width: 120, height: 60 } })], { align: AlignmentType.LEFT, img: true, keepNext: true }) : Pg('', { line: 240, after: 660, keepNext: true }),
      Pg([T(a.nama, { bold: true, u: true })], { align: AlignmentType.LEFT, line: 276 }),
      Pg([T('Pangkat : ' + (a.pangkat || '-'), { bold: true })], { align: AlignmentType.LEFT, line: 276 }),
      Pg([T('NIP : ' + (a.nip || '-'), { bold: true })], { align: AlignmentType.LEFT, line: 276, after: 240 })], w);
  };
  const half = Math.floor(CW / 2);
  const pairs = ikut.length === 1 ? [[null, ikut[0]]] : Array.from({ length: Math.ceil(ikut.length / 2) }, (_, i) => [ikut[i * 2], ikut[i * 2 + 1]]);
  const rows = [new TableRow({ cantSplit: true, children: [cell([Pg('', { keepNext: true })], half),
    cell([Pg(`${P('kota')}, ${fmtTgl(L.tglNota)}`, { align: AlignmentType.LEFT, line: 276, keepNext: true }), Pg([T(P('label_ttd'), { bold: true })], { align: AlignmentType.LEFT, line: 276, after: 60, keepNext: true })], half)] })];
  for (const [a, b] of pairs) rows.push(new TableRow({ cantSplit: true, children: [await ttdCell(a, half), await ttdCell(b, half)] }));
  isi.push(new Table({ width: { size: half * 2, type: WidthType.DXA }, columnWidths: [half, half], layout: TableLayoutType.FIXED, borders: nob, rows }));

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: SZ } } } },
    numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{ properties: { page: { size: { width: 12191, height: 18711 }, margin: { top: 709, bottom: 1701, left: 1191, right: 1134, header: 567, footer: 510 } } }, children: isi }]
  });
  return Packer.toBlob(doc);
}
A.buatDocx = buatDocx;

/* ---------- Sinkron laporan ---------- */
A.pendingLap = () => laps.filter(l => l.status === 'final' && !l.synced && l.kode === sess()?.kode).length;
A.syncLaporan = async () => {
  let ok = 0, fail = 0;
  for (const L of laps.filter(l => l.status === 'final' && !l.synced && l.kode === sess().kode)) {
    const ver = L.updated;
    try {
      if (!L.docxUrl) { const data = await idb.get(L.id + '_docx'); if (data) { const j = await A.api('upload', { path: ['Laporan Perjadin', L.kab], name: namaFile(L), data }); L.docxUrl = j.url; saveLaps(); } }
      const R = desaRecs(L);
      const row = { 'ID': L.id, 'Kode Tim': L.kode, 'Nama Tim': sess().tim.nama, 'Kabupaten/Kota': L.kab, 'Nomor Nota Dinas': L.nomor, 'Tanggal Nota Dinas': L.tglNota,
        'Hal': L.hal, 'Nomor Surat Tugas': L.noST, 'Tanggal Surat Tugas': L.tglST, 'Tanggal Berangkat': L.berangkat, 'Tanggal Kembali': L.pulang,
        'Desa Dikunjungi': R.map(r => r.desa).join(', '), 'ID Monev Desa': L.desaIds.join(', '), 'Pelaksana': L.anggota.filter(a => a.ikut).map(a => a.nama).join('; '),
        'Penerima di Tujuan': L.teks.penerima, 'C. Pengantar': L.teks.c_intro, ...Object.fromEntries(LEMBAR.map(lb => ['C.' + 'abcd'[lb.no - 1] + ' ' + lb.topik, L.teks['c' + lb.no]])),
        'D. Kesimpulan/Saran': L.teks.d, 'E. Penutup': L.teks.e, 'Link File Laporan (.docx)': L.docxUrl || '',
        'Dibuat (HP)': new Date(L.created).toISOString(), 'Diubah (HP)': new Date(L.updated).toISOString() };
      const json = JSON.stringify({ ...L, anggota: L.anggota.map(({ mid, ...a }) => a) });
      await A.api('simpanLaporan', { id: L.id, row, json });
      if (L.updated === ver) { L.synced = true; saveLaps(); }
      ok++;
    } catch (e) { fail++; console.warn('sync laporan', L.id, e); }
  }
  return { ok, fail };
};
A.terimaLaporanServer = list => {
  list.forEach(s => { const l = laps.find(x => x.id === s.id); if (l && (!l.synced || l.updated > s.updated)) return;
    if (l) Object.assign(l, s, { synced: true }); else laps.push({ ...s, synced: true }); });
  saveLaps();
};
})();
