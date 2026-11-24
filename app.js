/* Monev Capaian Gizi ASS – PWA offline-first, sinkron ke Google Sheet
   Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel */
const A = window.A = {};
(() => {
const K = { sess: 'mass_sess', recs: 'mass_recs', url: 'mass_url' };
const $ = s => document.querySelector(s);
const app = $('#app'), navbot = $('#navbot'), navin = $('#navin');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fmtTgl = d => { if (!d) return '-'; const [y, m, t] = d.split('-'); return `${+t} ${BULAN[+m - 1]} ${y}`; };
const fmtWaktu = t => t ? new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const newId = p => p + '-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
Object.assign(A, { $, esc, today, fmtTgl, fmtWaktu, newId, BULAN, load });

/* ---------- IndexedDB untuk foto & tanda tangan ---------- */
const idb = (() => {
  let dbp;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('monev_ass', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('media');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => {
    const t = d.transaction('media', mode), s = t.objectStore('media'), q = fn(s);
    t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
  return { get: k => tx('readonly', s => s.get(k)), set: (k, v) => tx('readwrite', s => s.put(v, k)), del: k => tx('readwrite', s => s.delete(k)) };
})();
A.idb = idb;

/* ---------- State ---------- */
let sess = load(K.sess, null);
let recs = load(K.recs, []);
const saveRecs = () => localStorage.setItem(K.recs, JSON.stringify(recs));
const saveSess = () => localStorage.setItem(K.sess, JSON.stringify(sess));
const getUrl = () => (localStorage.getItem(K.url) || CONFIG.SCRIPT_URL || '').trim();
A.sess = () => sess; A.recs = () => recs; A.saveRecs = saveRecs;
const findRec = id => recs.find(r => r.id === id);

/* ---------- Profil anggota (diisi sendiri oleh tiap anggota) ---------- */
const KP = 'mass_profil';
let profil = load(KP, null);
const saveProfil = () => localStorage.setItem(KP, JSON.stringify(profil));
function anggotaTim() {
  const list = (sess?.anggota || []).map(a => ({ ...a }));
  if (profil) {
    const me = { id: profil.id, nama: profil.nama, pangkat: profil.pangkat, nip: profil.nip };
    const i = list.findIndex(a => a.id === profil.id);
    if (i >= 0) list[i] = me; else list.push(me);
  }
  return list;
}
A.anggotaTim = anggotaTim;
const GOLONGAN = ['Pengatur Muda / II a', 'Pengatur Muda Tk. I / II b', 'Pengatur / II c', 'Pengatur Tk. I / II d',
  'Penata Muda / III a', 'Penata Muda Tk. I / III b', 'Penata / III c', 'Penata Tk. I / III d',
  'Pembina / IV a', 'Pembina Tk. I / IV b', 'Pembina Utama Muda / IV c', 'Pembina Utama Madya / IV d', 'Pembina Utama / IV e'];
async function kirimProfil() {
  if (!profil || !sess?.kode || !navigator.onLine || !getUrl()) return;
  if (profil.synced && profil.kode === sess.kode) return;
  const j = await api('profil', { profil: { id: profil.id, nama: profil.nama, pangkat: profil.pangkat, nip: profil.nip } });
  profil.synced = true; profil.kode = sess.kode; saveProfil();
  if (j.anggota) { sess.anggota = j.anggota; saveSess(); }
}
function profilView(pertama) {
  setNav(null); scrollTo(0, 0);
  $('#hdSub').textContent = sess.tim.nama;
  const p = profil || {}, lain = p.pangkat && !GOLONGAN.includes(p.pangkat);
  const pil = lain ? (/^PPPK/i.test(p.pangkat) ? 'PPPK' : 'LAIN') : (p.pangkat || '');
  app.innerHTML = `<div class="card"><h3 class="t">👤 Profil Saya</h3>
    <div class="hint">${pertama ? `Selamat datang di <b>${esc(sess.tim.nama)}</b>. Isi profil sekali saja; nama Anda akan muncul sebagai anggota tim dan di tanda tangan laporan perjadin.` : 'Perubahan profil akan dikirim ke server saat online.'}</div>
    <label class="f req">Nama lengkap dan gelar</label><input type="text" id="pNama" value="${esc(p.nama)}" placeholder="mis. Andi Dian Purnama, S.Gz., M.KM">
    <label class="f req">Pangkat/Golongan</label><select id="pGol"><option value="">— pilih —</option>
      ${GOLONGAN.map(g => `<option ${pil === g ? 'selected' : ''}>${g}</option>`).join('')}
      <option value="PPPK" ${pil === 'PPPK' ? 'selected' : ''}>PPPK (tulis golongannya)</option>
      <option value="LAIN" ${pil === 'LAIN' ? 'selected' : ''}>Non-ASN / lainnya</option></select>
    <div id="pLainBox" class="${pil === 'PPPK' || pil === 'LAIN' ? '' : 'hide'}"><label class="f">Keterangan pangkat/golongan</label><input type="text" id="pLain" value="${esc(lain ? p.pangkat : '')}" placeholder="mis. PPPK Golongan IX"></div>
    <label class="f" id="nipLab">NIP (18 angka)</label><input type="text" id="pNip" inputmode="numeric" maxlength="18" value="${esc(p.nip)}" placeholder="18 digit tanpa spasi">
    <button class="btn btn-p btn-big" id="pSave" style="margin-top:16px">Simpan Profil</button>
    ${pertama ? '' : '<button class="btn btn-o" id="pBack" style="width:100%;margin-top:8px">Batal</button>'}</div>${footer()}`;
  $('#pGol').onchange = e => $('#pLainBox').classList.toggle('hide', !['PPPK', 'LAIN'].includes(e.target.value));
  $('#pNip').oninput = e => e.target.value = e.target.value.replace(/\D/g, '');
  if (!pertama) $('#pBack').onclick = home;
  $('#pSave').onclick = async () => {
    const nama = $('#pNama').value.trim(), g = $('#pGol').value, nip = $('#pNip').value.trim();
    const pangkat = g === 'PPPK' || g === 'LAIN' ? ($('#pLain').value.trim() || (g === 'PPPK' ? 'PPPK' : 'Non-ASN')) : g;
    if (!nama || !g) return toast('Isi nama dan pangkat/golongan');
    if (g !== 'LAIN' && !/^\d{18}$/.test(nip)) return toast('NIP harus 18 angka');
    profil = { id: profil?.id || newId('AG'), nama, pangkat, nip, synced: false };
    saveProfil();
    try { await kirimProfil(); } catch (e) { console.warn(e); }
    toast('Profil tersimpan ✔'); home();
  };
}
A.profilView = profilView;

/* ---------- UI helpers ---------- */
function toast(msg, ms = 2800) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
function modal(html) {
  const root = $('#modalRoot'); root.innerHTML = `<div class="modal"><div class="card">${html}</div></div>`;
  root.querySelector('.modal').addEventListener('click', e => { if (e.target.classList.contains('modal')) closeModal(); });
  return root.querySelector('.card');
}
const closeModal = () => $('#modalRoot').innerHTML = '';
function confirmBox(msg, okText, onOk) {
  const c = modal(`<p style="margin-top:0">${msg}</p><div class="acts" style="justify-content:flex-end"><button class="btn btn-o" data-x>Batal</button><button class="btn btn-p" data-ok>${okText}</button></div>`);
  c.querySelector('[data-x]').onclick = closeModal; c.querySelector('[data-ok]').onclick = () => { closeModal(); onOk(); };
}
function setNav(btns) {
  if (!btns) { navbot.classList.add('hide'); return; }
  navbot.classList.remove('hide');
  navin.innerHTML = btns.map((b, i) => `<button class="btn ${b.cls}" data-i="${i}">${b.text}</button>`).join('');
  navin.querySelectorAll('button').forEach(el => el.onclick = () => btns[el.dataset.i].fn());
}
const footer = () => `<footer><img src="icons/logo-poltekkes.png" alt="Poltekkes Kemenkes Makassar" style="height:34px;display:block;margin:0 auto 8px">Developed : <b>Manjilala, S.Gz, M.Gizi</b><br>Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel</footer>`;
Object.assign(A, { toast, modal, closeModal, confirmBox, setNav, footer, app });

/* Kamus: tandai istilah agar bisa diketuk */
const kamusRe = new RegExp('(' + Object.keys(KAMUS).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('|') + ')', 'g');
const kam = s => esc(s).replace(kamusRe, m => `<span class="kamus" data-kamus="${m}">${m}</span>`);
document.addEventListener('click', e => {
  const k = e.target.closest('[data-kamus]'); if (!k) return;
  const c = modal(`<b>${esc(k.dataset.kamus)}</b><p>${esc(KAMUS[k.dataset.kamus])}</p><div class="acts" style="justify-content:flex-end"><button class="btn btn-o">Tutup</button></div>`);
  c.querySelector('button').onclick = closeModal;
});

/* ---------- API ---------- */
async function api(action, body = {}) {
  const url = getUrl(); if (!url) throw new Error('URL server belum diatur');
  const res = await fetch(url, { method: 'POST', body: JSON.stringify({ action, kode: sess?.kode, ...body }) });
  const j = await res.json(); if (!j.ok) throw new Error(j.error || 'Server menolak'); return j;
}
A.api = api;

/* ---------- Login & master ---------- */
function loginView(msg) {
  setNav(null);
  app.innerHTML = `<div class="card" style="margin-top:20px;text-align:center">
    <div style="display:flex;justify-content:center;align-items:center;gap:16px"><img src="icons/logo-sulsel.png" style="height:80px"><img src="icons/logo-poltekkes.png" style="height:80px;padding:14px 0"></div><h3 class="t" style="margin-top:8px">Monitoring Evaluasi Capaian<br>Program Gizi Aksi Stop Stunting</h3>
    <p class="hint">Masukkan kode tim dari Dinas Kesehatan Provinsi. Login pertama perlu internet; setelah itu aplikasi bisa dipakai tanpa sinyal.</p>
    <input type="password" id="kode" placeholder="Kode tim" style="text-align:center;font-size:20px;letter-spacing:2px" autocomplete="off">
    ${msg ? `<div class="warn">${esc(msg)}</div>` : ''}
    <button class="btn btn-p btn-big" id="bLogin" style="margin-top:12px">Masuk</button>
    <details style="margin-top:14px;text-align:left"><summary class="hint">Pengaturan server</summary>
      <label class="f">URL Web App Apps Script</label><input type="text" id="lUrl" value="${esc(getUrl())}" placeholder="https://script.google.com/macros/s/…/exec"></details>
  </div>${footer()}`;
  $('#bLogin').onclick = async () => {
    const kode = $('#kode').value.trim(); const u = $('#lUrl').value.trim();
    if (u) localStorage.setItem(K.url, u);
    if (!kode) return toast('Isi kode tim');
    if (!navigator.onLine) return toast('Login pertama perlu internet');
    $('#bLogin').disabled = true; $('#bLogin').textContent = 'Memeriksa…';
    try { sess = { kode: kode.toUpperCase() }; await muatMaster(); if (profil) { profil.synced = false; saveProfil(); try { await kirimProfil(); } catch (e) {} }
      toast('Selamat datang, ' + sess.tim.nama); profil ? home() : profilView(true); }
    catch (e) { sess = null; localStorage.removeItem(K.sess); loginView(e.message); }
  };
}
async function muatMaster() {
  const j = await api('login', {});
  sess = { kode: sess.kode, tim: j.tim, anggota: j.anggota, wilayah: j.wilayah, pengaturan: j.pengaturan, at: Date.now() };
  saveSess();
  // gabungkan data monev tim dari server (dari HP anggota lain)
  (j.monev || []).forEach(s => {
    const l = findRec(s.id);
    if (l && (!l.synced || l.updated > s.updated)) return;
    if (l) Object.assign(l, s, { synced: true, src: l.src || 'server' });
    else recs.push({ ...s, synced: true, src: 'server' });
  });
  saveRecs();
  if (A.terimaLaporanServer) A.terimaLaporanServer(j.laporan || []);
}
A.muatMaster = muatMaster;

function menu() {
  if (!sess?.tim) return;
  const c = modal(`<h3 class="t">⚙️ Menu</h3>
    <div class="mini"><b>${esc(sess.tim.nama)}</b> <span class="m">(kode: ${esc(sess.kode)})</span><div class="m">Wilayah: ${esc(sess.tim.kab.join(', '))}<br>Anggota: ${esc(anggotaTim().map(a => a.nama).join(', ') || '-')}<br>Data master diperbarui: ${fmtWaktu(sess.at)}</div></div>
    <div style="display:grid;gap:8px">
      <button class="btn btn-o" data-a="profil">👤 Profil saya${profil ? ' (' + esc(profil.nama) + ')' : ''}</button>
      <button class="btn btn-o" data-a="master">🔄 Perbarui data master & data tim</button>
      <button class="btn btn-o" data-a="kamus">📖 Kamus singkat</button>
      <button class="btn btn-o" data-a="url">🌐 Pengaturan server</button>
      <button class="btn btn-o" data-a="out" style="color:var(--merah)">🚪 Keluar / ganti kode tim</button>
      <button class="btn btn-o" data-a="x">Tutup</button></div>`);
  c.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => {
    const a = b.dataset.a;
    if (a === 'x') return closeModal();
    if (a === 'profil') { closeModal(); return profilView(false); }
    if (a === 'master') { if (!navigator.onLine) return toast('Perlu internet'); b.textContent = 'Memuat…';
      try { await muatMaster(); closeModal(); toast('Data master diperbarui'); home(); } catch (e) { toast(e.message); b.textContent = '🔄 Perbarui data master & data tim'; } }
    if (a === 'kamus') { const k = modal(`<h3 class="t">📖 Kamus Singkat</h3>${Object.entries(KAMUS).map(([x, y]) => `<p style="margin:6px 0"><b>${esc(x)}</b>: ${esc(y)}</p>`).join('')}<button class="btn btn-o" style="width:100%">Tutup</button>`); k.querySelector('button').onclick = closeModal; }
    if (a === 'url') { const k = modal(`<h3 class="t">🌐 Server</h3><label class="f">URL Web App Apps Script</label><input type="text" id="sUrl" value="${esc(getUrl())}">
      <div class="acts" style="justify-content:flex-end"><button class="btn btn-o" data-x>Tutup</button><button class="btn btn-p" data-s>Simpan</button></div>`);
      k.querySelector('[data-x]').onclick = closeModal; k.querySelector('[data-s]').onclick = () => { localStorage.setItem(K.url, $('#sUrl').value.trim()); closeModal(); toast('Disimpan'); sync(true); }; }
    if (a === 'out') {
      const pend = recs.filter(r => !r.synced).length + (A.pendingLap ? A.pendingLap() : 0);
      confirmBox(pend ? `Masih ada <b>${pend}</b> data belum terkirim. Jika keluar, data di HP ini <b>tetap tersimpan</b> dan akan terkirim setelah masuk lagi dengan kode yang sama.` : 'Keluar dari tim ini?', 'Keluar',
        () => { localStorage.removeItem(K.sess); sess = null; loginView(); });
    }
  });
}
$('#btnMenu').onclick = () => sess?.tim ? menu() : null;

/* ---------- Beranda ---------- */
function statusBar() {
  const on = navigator.onLine;
  const pend = recs.filter(r => r.status === 'final' && !r.synced).length + (A.pendingLap ? A.pendingLap() : 0);
  return `<div class="status" id="statusBar"><span class="pill ${on ? '' : 'off'}"><span class="dot"></span>${on ? 'Online' : 'Offline'}</span>
    ${pend ? `<span class="pill wait">⏳ ${pend} belum terkirim</span>` : `<span class="pill ok">✔ Semua terkirim</span>`}
    ${pend && on ? `<button class="btn btn-o btn-sm" id="btnSync">Kirim sekarang</button>` : ''}</div>`;
}
function refreshStatus() { const el = $('#statusBar'); if (!el) return; el.outerHTML = statusBar(); const b = $('#btnSync'); if (b) b.onclick = () => sync(true); }
A.statusBar = statusBar; A.refreshStatus = refreshStatus;

const badgeStatus = r => r.status === 'draf' ? '<span class="badge b-draf">Draf</span>' : r.synced ? '<span class="badge b-ok">✔ Terkirim</span>' : '<span class="badge b-wait">⏳ Menunggu kirim</span>';
A.badgeStatus = badgeStatus;
const badgeWarna = w => w ? `<span class="badge w-${w}">${w}</span>` : '';
A.badgeWarna = badgeWarna;

function home() {
  if (!sess?.tim) return loginView();
  if (!profil) return profilView(true);
  $('#hdSub').textContent = sess.tim.nama + ' · ' + sess.tim.kab.join(', ');
  setNav(null); scrollTo(0, 0);
  const list = recs.filter(r => r.kode === sess.kode).sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '') || b.updated - a.updated);
  app.innerHTML = `${statusBar()}
    <div class="grid2"><button class="btn btn-p btn-big" id="bNew">＋ Monev Desa</button><button class="btn btn-b btn-big" id="bLap">📄 Laporan Perjadin</button></div>
    <h2>Desa yang sudah dimonev (${list.length})</h2>
    ${list.length ? list.map(r => `<div class="card"><div class="rec"><div class="t">
        <b>Desa ${esc(r.desa || '(belum dipilih)')}</b>
        <div class="m">Kec. ${esc(r.kec || '-')} · ${esc(r.kab || '-')}<br>${fmtTgl(r.tanggal)} · ${doneCount(r)}/13 indikator${r.src === 'server' ? ' · dari HP anggota lain' : ''}</div></div>
        <div style="text-align:right">${badgeStatus(r)}<div style="margin-top:4px">${badgeWarna(r.v?.warna_desa)}</div></div></div>
        <div class="acts"><button class="btn btn-o btn-sm" data-a="open" data-id="${r.id}">✏️ ${r.status === 'draf' ? 'Lanjutkan' : 'Lihat/Ubah'}</button>
        <button class="btn btn-o btn-sm" data-a="print" data-id="${r.id}">🖨️ Cetak</button>
        <button class="btn btn-o btn-sm" data-a="del" data-id="${r.id}">🗑️</button></div></div>`).join('')
      : `<div class="card empty">Belum ada data.<br>Tekan <b>＋ Monev Desa</b> untuk mulai.</div>`}
    ${footer()}`;
  $('#bNew').onclick = () => { const r = blankRec(); recs.push(r); saveRecs(); step(r, 0); };
  $('#bLap').onclick = () => A.laporanHome();
  const b = $('#btnSync'); if (b) b.onclick = () => sync(true);
  app.querySelectorAll('[data-a]').forEach(el => el.onclick = () => {
    const r = findRec(el.dataset.id);
    if (el.dataset.a === 'open') step(r, r.status === 'draf' ? 0 : STEPS.length - 1);
    if (el.dataset.a === 'print') cetak(r);
    if (el.dataset.a === 'del') confirmBox(`Hapus data Desa <b>${esc(r.desa)}</b> dari HP ini?${r.synced ? '<br><small>Data yang sudah terkirim tetap ada di server.</small>' : ''}`, 'Hapus',
      () => { recs = recs.filter(x => x.id !== r.id); saveRecs(); home(); });
  });
}
A.home = home;

/* ---------- Record ---------- */
function blankRec() {
  const kab = sess.tim.kab.length === 1 ? sess.tim.kab[0] : '';
  return { id: newId('MC'), kode: sess.kode, kab, kec: '', desa: '', tanggal: today(),
    tim: anggotaTim().map(a => a.nama).join(', '), pendamping: '', periode: '',
    v: {}, kendala: {}, rencana: {}, balita: [], sepakat: [{}, {}, {}], ulang: '',
    ttd: { tim: { nama: '' }, desa: { nama: '' }, kader: { nama: '' } }, foto: [],
    status: 'draf', synced: false, created: Date.now(), updated: Date.now() };
}
const touch = r => { r.updated = Date.now(); r.synced = false; saveRecs(); };
const isi = x => Array.isArray(x) ? x.length > 0 : (x !== undefined && x !== null && String(x).trim() !== '');
const indDone = (r, it) => it.q.some(q => q.f.some(f => f.type !== 'calc' && isi(r.v[f.k]))) || isi(r.kendala[it.no]) || isi(r.rencana[it.no]);
const doneCount = r => IND.filter(it => indDone(r, it)).length;
A.indDone = indDone; A.isi = isi;

const STEPS = ['id', ...IND.slice(0, 9).map(i => i.no), 'balita', ...IND.slice(9).map(i => i.no), 'sepakat', 'foto', 'ringkas'];
const stepLabel = s => ({ id: 'Identitas', balita: 'Daftar Balita', sepakat: 'Kesepakatan & TTD', foto: 'Foto', ringkas: 'Ringkasan' }[s] || 'Indikator ' + s);
const chipLabel = s => ({ id: 'ID', balita: '👶', sepakat: '✍️', foto: '📷', ringkas: '✔' }[s] || s);
const stepDone = (r, s) => s === 'id' ? !!(r.desa && r.tanggal) : s === 'balita' ? r.balita.length > 0 : s === 'sepakat' ? r.sepakat.some(p => isi(p.masalah)) : s === 'foto' ? r.foto.length > 0 : s === 'ringkas' ? r.status === 'final' : indDone(r, IND.find(i => i.no === s));

function head(r, i) {
  const s = STEPS[i];
  return `<div class="step-top"><span>${r.desa ? 'Desa ' + esc(r.desa) : 'Monev desa baru'}</span><span>${stepLabel(s)}</span></div>
    <div class="bar"><i style="width:${(i + 1) / STEPS.length * 100}%"></i></div>
    <div class="chips">${STEPS.map((x, n) => `<button class="chip ${n === i ? 'on' : stepDone(r, x) ? 'done' : ''}" data-step="${n}">${chipLabel(x)}</button>`).join('')}</div>`;
}
function step(r, i) {
  scrollTo(0, 0);
  const s = STEPS[i];
  if (s === 'id') viewId(r, i); else if (s === 'balita') viewBalita(r, i); else if (s === 'sepakat') viewSepakat(r, i);
  else if (s === 'foto') viewFoto(r, i); else if (s === 'ringkas') viewRingkas(r, i); else viewInd(r, i, IND.find(x => x.no === s));
  app.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { if (i === 0 && !validId(r)) return; step(r, +b.dataset.step); });
  const chipOn = app.querySelector('.chip.on'); if (chipOn) chipOn.scrollIntoView({ inline: 'center', block: 'nearest' });
  if (s !== 'ringkas') setNav([
    { text: '← ' + (i ? 'Kembali' : 'Beranda'), cls: 'btn-o', fn: () => i ? step(r, i - 1) : home() },
    { text: 'Lanjut →', cls: 'btn-p', fn: () => { if (i === 0 && !validId(r)) return; step(r, i + 1); } }]);
}
A.step = step; A.STEPS = STEPS;
function validId(r) {
  if (!r.kab || !r.kec || !r.desa || !r.tanggal || !r.tim.trim()) { toast('Lengkapi isian bertanda *'); return false; }
  return true;
}

/* Identitas */
function viewId(r, i) {
  const W = sess.wilayah.filter(w => sess.tim.kab.includes(w.kab));
  const kabs = sess.tim.kab, kecs = [...new Set(W.filter(w => w.kab === r.kab).map(w => w.kec))];
  const desas = W.filter(w => w.kab === r.kab && w.kec === r.kec).map(w => w.desa);
  const opt = (arr, v) => `<option value="">— pilih —</option>` + arr.map(x => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('');
  app.innerHTML = `${head(r, i)}<div class="card">
    <div class="hint">Data acuan: ${DATA_ACUAN}</div>
    <label class="f req">Kabupaten/Kota</label><select id="kab">${opt(kabs, r.kab)}</select>
    <label class="f req">Kecamatan</label><select id="kec">${opt(kecs, r.kec)}</select>
    <label class="f req">Desa/Kelurahan</label><select id="desa">${opt(desas, r.desa)}</select>
    <label class="f req">Tanggal kunjungan</label><input type="date" id="tanggal" value="${esc(r.tanggal)}">
    <label class="f req">Tim verifikasi</label><input type="text" id="tim" value="${esc(r.tim)}">
    <label class="f">Pendamping desa/kader</label><input type="text" id="pendamping" value="${esc(r.pendamping)}">
    <label class="f">Periode data</label><input type="text" id="periode" value="${esc(r.periode)}" placeholder="mis. Minggu ke-4 (per 5 November 2026)">
    ${!W.length ? `<div class="warn">Belum ada data kecamatan/desa untuk <b>${esc(sess.tim.kab.join(', '))}</b>. Pastikan desanya sudah diisi di sheet MASTER_WILAYAH, lalu buka ⚙️ → <b>Perbarui data master</b> saat ada internet.</div>` : ''}
  </div>${footer()}`;
  $('#kab').onchange = e => { r.kab = e.target.value; r.kec = ''; r.desa = ''; touch(r); step(r, i); };
  $('#kec').onchange = e => { r.kec = e.target.value; r.desa = ''; touch(r); step(r, i); };
  $('#desa').onchange = e => {
    r.desa = e.target.value; touch(r);
    const dup = recs.find(x => x !== r && x.desa === r.desa && x.kec === r.kec && x.tanggal === r.tanggal);
    if (dup) toast('Perhatian: Desa ini sudah dimonev pada tanggal yang sama.', 4000);
  };
  ['tanggal', 'tim', 'pendamping', 'periode'].forEach(f => $('#' + f).addEventListener('input', e => { r[f] = e.target.value; touch(r); }));
}

/* Indikator */
function fieldHtml(r, f) {
  const v = r.v[f.k];
  const lab = `<label>${esc(f.l)}${f.u ? ` <span class="u">(${f.u})</span>` : ''}</label>`;
  if (f.type === 'calc') return `<div class="fi">${lab}<div class="calc" data-calc="${f.k}">${calcText(f, r.v[f.k])}</div></div>`;
  if (f.type === 'num' || f.type === 'dec') return `<div class="fi">${lab}<input type="number" inputmode="${f.type === 'num' ? 'numeric' : 'decimal'}" ${f.type === 'num' ? 'min="0" step="1"' : 'step="0.01"'} data-k="${f.k}" value="${esc(v ?? '')}"></div>`;
  if (f.type === 'text') return `<div class="fi wide">${lab}<input type="text" data-k="${f.k}" value="${esc(v ?? '')}"></div>`;
  if (f.type === 'area') return `<div class="fi wide">${lab}<textarea data-k="${f.k}">${esc(v ?? '')}</textarea></div>`;
  if (f.type === 'radio') return `<div class="fi wide">${lab}<div class="opts">${f.opt.map(o => `<label><input type="radio" name="${f.k}" data-k="${f.k}" value="${esc(o)}" ${v === o ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div></div>`;
  if (f.type === 'checks') return `<div class="fi wide">${lab}<div class="opts">${f.opt.map(o => `<label><input type="checkbox" data-k="${f.k}" value="${esc(o)}" ${(v || []).includes(o) ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div></div>`;
}
function calcText(f, x) {
  if (x === '' || x === undefined || x === null) return '<span class="hint">otomatis</span>';
  if (f.k === 'warna_desa') return badgeWarna(x);
  return `${String(x).replace('.', ',')}${f.u === '%' ? ' %' : f.u ? ' ' + f.u : ''}`;
}
function viewInd(r, i, it) {
  const lb = LEMBAR[it.lb - 1];
  app.innerHTML = `${head(r, i)}<div class="card">
    <div class="lb">Lembar ${lb.no} · ${esc(lb.judul)}</div>
    <h3 class="t">${it.no}. ${kam(it.judul)}</h3>
    <div class="tanya">Tanya ke: ${esc(it.tanya)}</div>${it.tpg ? '<div class="tpg">Diisi oleh petugas gizi/TPG</div>' : ''}
    <div class="bukti"><b>Bukti yang dilihat:</b> ${kam(it.bukti)}</div>
    ${it.q.map((q, n) => `<div class="qbox"><div class="qt"><b>${'abc'[n]}.</b> ${kam(q.t)}</div><div class="fl ${q.grid ? 'g4' : ''}">${q.f.map(f => fieldHtml(r, f)).join('')}</div></div>`).join('')}
    ${it.no === 2 ? `<div class="hint" style="margin-top:8px">Contoh: 20 balita + 5 ibu hamil = 25 sasaran; yang ada data 20 → 80% → Kuning.</div>` : ''}
    <div id="warns"></div>
    <div class="sec"><label class="f" style="margin-top:0">Kendala/masalah yang ditemukan</label><div class="hint">Fokus: ${esc(it.fokus)}</div>
      <textarea data-x="kendala">${esc(r.kendala[it.no] || '')}</textarea>
      <label class="f">Rencana perbaikan</label><textarea data-x="rencana">${esc(r.rencana[it.no] || '')}</textarea></div>
  </div>${footer()}`;
  const upd = () => {
    hitung(r.v);
    app.querySelectorAll('[data-calc]').forEach(el => { const f = ALL_FIELDS.find(x => x.k === el.dataset.calc); el.innerHTML = calcText(f, r.v[f.k]); });
    const w = (it.cek ? it.cek(r.v) : []).filter(Boolean);
    $('#warns').innerHTML = w.map(x => `<div class="warn">⚠️ ${esc(x)}</div>`).join('');
  };
  app.querySelectorAll('[data-k]').forEach(el => el.addEventListener(el.type === 'checkbox' || el.type === 'radio' ? 'change' : 'input', () => {
    const k = el.dataset.k;
    if (el.type === 'checkbox') r.v[k] = [...app.querySelectorAll(`input[data-k="${k}"]:checked`)].map(x => x.value);
    else r.v[k] = el.value;
    touch(r); upd();
  }));
  app.querySelectorAll('[data-x]').forEach(el => el.oninput = () => { r[el.dataset.x][it.no] = el.value; touch(r); });
  upd();
}

/* Daftar balita belum diperiksa/dirujuk */
function viewBalita(r, i) {
  app.innerHTML = `${head(r, i)}<div class="card"><div class="lb">Lembar 3 · Lanjutan indikator 8–9</div>
    <h3 class="t">Daftar balita yang belum diperiksa di Puskesmas / belum ke rumah sakit</h3>
    <div class="hint">Lewati jika tidak ada.</div><div id="bl" style="margin-top:10px"></div>
    <button class="btn btn-o" id="addB" style="width:100%">＋ Tambah balita</button></div>${footer()}`;
  const draw = () => {
    $('#bl').innerHTML = r.balita.map((b, n) => `<div class="mini"><div class="hd2"><span>Balita ${n + 1}</span><button class="btn btn-o btn-sm" data-del="${n}">🗑️</button></div>
      <div class="fl"><div class="fi wide"><label>Nama balita</label><input type="text" data-n="${n}" data-f="nama" value="${esc(b.nama)}"></div>
      <div class="fi"><label>Umur</label><input type="text" data-n="${n}" data-f="umur" value="${esc(b.umur)}" placeholder="mis. 18 bln"></div>
      <div class="fi"><label>Jenis</label><select data-n="${n}" data-f="jenis">${['', 'Pemeriksaan ke Puskesmas', 'Rujukan ke RS'].map(o => `<option ${b.jenis === o ? 'selected' : ''} value="${o}">${o || '— pilih —'}</option>`).join('')}</select></div>
      <div class="fi wide"><label>Hambatan</label><input type="text" data-n="${n}" data-f="hambatan" value="${esc(b.hambatan)}"></div>
      <div class="fi wide"><label>Tindak lanjut & pendamping</label><input type="text" data-n="${n}" data-f="tl" value="${esc(b.tl)}"></div></div></div>`).join('');
    app.querySelectorAll('[data-f]').forEach(el => el.addEventListener('input', () => { r.balita[el.dataset.n][el.dataset.f] = el.value; touch(r); }));
    app.querySelectorAll('[data-del]').forEach(el => el.onclick = () => { r.balita.splice(+el.dataset.del, 1); touch(r); draw(); });
  };
  $('#addB').onclick = () => { r.balita.push({ nama: '', umur: '', jenis: '', hambatan: '', tl: '' }); touch(r); draw(); };
  draw();
}

/* Tanda tangan di layar */
function sigPad(holder, initial, onDone) {
  holder.innerHTML = `<div class="sigwrap"><canvas></canvas></div><div class="acts" style="margin-top:6px"><button class="btn btn-o btn-sm" data-c>Hapus tanda tangan</button><span class="hint" data-s></span></div>`;
  const cv = holder.querySelector('canvas'), ctx = cv.getContext('2d');
  const fit = () => { const w = cv.clientWidth; cv.width = w * 2; cv.height = 300; ctx.scale(2, 2); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0b1d51'; };
  fit(); let drawing = false, dirty = false, last;
  if (initial) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, cv.clientWidth, 150); im.src = initial; holder.querySelector('[data-s]').textContent = '✔ tersimpan'; }
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.addEventListener('pointerdown', e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke(); last = p; dirty = true; });
  const end = () => { if (!drawing) return; drawing = false; if (dirty) { onDone(cv.toDataURL('image/png')); holder.querySelector('[data-s]').textContent = '✔ tersimpan'; } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  holder.querySelector('[data-c]').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); dirty = false; onDone(null); holder.querySelector('[data-s]').textContent = ''; };
}
A.sigPad = sigPad;

function viewSepakat(r, i) {
  const pihak = [['tim', 'Tim Verifikasi'], ['desa', 'Perwakilan Pemerintah Desa'], ['kader', 'Kader/Pendamping Desa']];
  app.innerHTML = `${head(r, i)}<div class="card"><h3 class="t">Kesepakatan Tindak Lanjut Desa</h3>
    <div class="hint">Diisi bersama perwakilan desa di akhir kunjungan. Pilih masalah yang paling penting untuk segera diperbaiki.</div>
    ${r.sepakat.map((p, n) => `<div class="mini" style="margin-top:10px"><div class="hd2">Prioritas ${n + 1}</div>
      <div class="fl"><div class="fi wide"><label>Masalah paling penting (No. indikator)</label><input type="text" data-p="${n}" data-f="masalah" value="${esc(p.masalah)}"></div>
      <div class="fi wide"><label>Kegiatan perbaikan yang disepakati</label><textarea data-p="${n}" data-f="kegiatan">${esc(p.kegiatan)}</textarea></div>
      <div class="fi"><label>Penanggung jawab</label><input type="text" data-p="${n}" data-f="pj" value="${esc(p.pj)}"></div>
      <div class="fi"><label>Batas waktu</label><input type="date" data-p="${n}" data-f="batas" value="${esc(p.batas)}"></div></div></div>`).join('')}
    <label class="f">Jadwal kunjungan ulang</label><input type="date" id="ulang" value="${esc(r.ulang)}"></div>
    <div class="card"><h3 class="t">✍️ Tanda Tangan</h3><div class="hint">Minta tiap pihak menulis nama lalu tanda tangan dengan jari di kotak.</div>
    ${pihak.map(([k, l]) => `<div style="margin-top:14px"><label class="f">${l} – nama & jabatan</label><input type="text" data-ttd="${k}" value="${esc(r.ttd[k].nama)}"><div data-pad="${k}" style="margin-top:6px"></div></div>`).join('')}
    </div>${footer()}`;
  app.querySelectorAll('[data-p]').forEach(el => el.addEventListener('input', () => { r.sepakat[el.dataset.p][el.dataset.f] = el.value; touch(r); }));
  $('#ulang').oninput = e => { r.ulang = e.target.value; touch(r); };
  app.querySelectorAll('[data-ttd]').forEach(el => el.oninput = () => { r.ttd[el.dataset.ttd].nama = el.value; touch(r); });
  pihak.forEach(async ([k]) => {
    const mid = r.id + '_ttd_' + k, init = r.ttd[k].mid ? await idb.get(mid) : null;
    sigPad(app.querySelector(`[data-pad="${k}"]`), init, async data => {
      if (data) { await idb.set(mid, data); r.ttd[k].mid = mid; } else { await idb.del(mid); delete r.ttd[k].mid; }
      delete r.ttd[k].url; touch(r);
    });
  });
}

/* Foto (opsional, maks 5) */
function kompres(file) {
  return new Promise((res, rej) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => { const m = 1280, s = Math.min(1, m / Math.max(im.width, im.height)); const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', 0.72)); };
    im.onerror = rej; im.src = u;
  });
}
function viewFoto(r, i) {
  app.innerHTML = `${head(r, i)}<div class="card"><h3 class="t">📷 Foto Dokumentasi</h3>
    <div class="hint">Opsional, maksimal ${CONFIG.MAX_FOTO} foto. Foto dikecilkan otomatis dan tersimpan di HP sampai ada internet.</div>
    <div class="fotos" id="fl" style="margin-top:12px"></div>
    <input type="file" accept="image/*" id="fin" class="hide" multiple>
    <button class="btn btn-o" id="addF" style="width:100%;margin-top:12px">＋ Ambil / pilih foto</button></div>${footer()}`;
  const draw = async () => {
    const items = await Promise.all(r.foto.map(async (f, n) => ({ f, n, src: (await idb.get(f.mid)) || f.url || '' })));
    $('#fl').innerHTML = items.map(({ f, n, src }) => `<div class="foto"><img src="${esc(src)}" alt=""><div class="c">
      <input type="text" data-ket="${n}" value="${esc(f.ket)}" placeholder="Keterangan foto"><button class="btn btn-o btn-sm" data-del="${n}" style="margin-top:6px;width:100%">🗑️ Hapus</button></div></div>`).join('');
    $('#addF').disabled = r.foto.length >= CONFIG.MAX_FOTO;
    app.querySelectorAll('[data-ket]').forEach(el => el.oninput = () => { r.foto[el.dataset.ket].ket = el.value; touch(r); });
    app.querySelectorAll('[data-del]').forEach(el => el.onclick = async () => { const f = r.foto.splice(+el.dataset.del, 1)[0]; await idb.del(f.mid); touch(r); draw(); });
  };
  $('#addF').onclick = () => $('#fin').click();
  $('#fin').onchange = async e => {
    const files = [...e.target.files].slice(0, CONFIG.MAX_FOTO - r.foto.length);
    for (const file of files) { const data = await kompres(file); const mid = newId(r.id + '_foto'); await idb.set(mid, data); r.foto.push({ mid, ket: '' }); }
    if (e.target.files.length > files.length) toast('Maksimal ' + CONFIG.MAX_FOTO + ' foto');
    e.target.value = ''; touch(r); draw();
  };
  draw();
}

/* Ringkasan */
function viewRingkas(r, i) {
  const warns = IND.flatMap(it => (it.cek ? it.cek(r.v) : []).filter(Boolean).map(w => `${it.no}. ${w}`));
  app.innerHTML = `${head(r, i)}<div class="card"><b style="font-size:17px">Desa ${esc(r.desa)}</b> ${badgeWarna(r.v.warna_desa)}
    <div class="m">Kec. ${esc(r.kec)} · ${esc(r.kab)} · ${fmtTgl(r.tanggal)}<br>Tim: ${esc(r.tim)}</div>
    ${r.v.gab_pct !== undefined && r.v.gab_pct !== '' ? `<div style="margin-top:6px">Cakupan gabungan: <b>${String(r.v.gab_pct).replace('.', ',')} %</b></div>` : ''}</div>
    ${warns.length ? `<div class="card"><b>⚠️ Angka yang perlu dicek</b>${warns.map(w => `<div class="warn">${esc(w)}</div>`).join('')}</div>` : ''}
    <div class="card"><b>${doneCount(r)}/13 indikator terisi</b> <span class="hint">— ketuk untuk mengubah</span>
    ${STEPS.slice(0, -1).map((s, n) => `<div class="sum-item" data-go="${n}"><span class="nn ${stepDone(r, s) ? 'ok' : 'no'}">${chipLabel(s)}</span>
      <span style="flex:1">${typeof s === 'number' ? esc(IND.find(x => x.no === s).judul) : stepLabel(s)}</span>›</div>`).join('')}</div>
    ${r.status === 'final' ? `<div class="card" style="text-align:center">${r.synced ? '✔ Sudah terkirim ke server' : '⏳ Tersimpan di HP, akan dikirim otomatis saat online'}</div>` : ''}
    ${footer()}`;
  app.querySelectorAll('[data-go]').forEach(el => el.onclick = () => step(r, +el.dataset.go));
  app.querySelectorAll('[data-step]').forEach(b => b.onclick = () => step(r, +b.dataset.step));
  const fin = () => {
    const go = () => { r.status = 'final'; touch(r); toast('Tersimpan ✔'); home(); sync(); };
    const d = doneCount(r);
    d < 13 ? confirmBox(`Baru ${d} dari 13 indikator yang terisi. Tetap simpan & kirim?`, 'Ya, simpan', go) : go();
  };
  setNav([{ text: '🖨️ Cetak', cls: 'btn-o', fn: () => cetak(r) }, { text: 'Simpan & Kirim ✔', cls: 'btn-g', fn: fin }]);
}

/* ---------- Teks jawaban (dipakai cetak & laporan) ---------- */
function jawabTeks(r, it) {
  return it.q.map((q, n) => {
    const parts = q.f.map(f => { const x = r.v[f.k]; if (!isi(x)) return ''; const val = Array.isArray(x) ? x.join(', ') : String(x).replace('.', ',');
      return `${f.l}: ${val}${f.u === '%' ? '%' : f.u ? ' ' + f.u : ''}`; }).filter(Boolean);
    return parts.length ? `${'abc'[n]}. ${parts.join('; ')}` : '';
  }).filter(Boolean);
}
A.jawabTeks = jawabTeks;

/* ---------- Cetak ---------- */
async function cetak(r) {
  const img = async m => m?.mid ? (await idb.get(m.mid)) || m.url || '' : m?.url || '';
  const ttdImgs = {}; for (const k of ['tim', 'desa', 'kader']) ttdImgs[k] = await img(r.ttd[k]);
  const fotos = await Promise.all(r.foto.map(img));
  $('#printArea').innerHTML = `<div style="display:flex;gap:10px;align-items:center;border-bottom:2px solid #000;padding-bottom:6px">
    <img src="icons/kop-logo.png" style="width:46px"><div style="flex:1"><h3>Daftar Tilik Monitoring Evaluasi Capaian Program Gizi Aksi Stop Stunting</h3>
    <div style="text-align:center">Data acuan: ${DATA_ACUAN}</div></div></div>
    <table class="noborder"><tr><td>Kabupaten/Kota: ${esc(r.kab)}</td><td>Kecamatan: ${esc(r.kec)}</td><td>Desa: ${esc(r.desa)}</td><td>Tanggal: ${fmtTgl(r.tanggal)}</td></tr>
    <tr><td colspan="2">Tim verifikasi: ${esc(r.tim)}</td><td>Pendamping: ${esc(r.pendamping)}</td><td>Periode: ${esc(r.periode)}</td></tr>
    <tr><td colspan="4"><b>Cakupan gabungan: ${esc(String(r.v.gab_pct ?? '-').replace('.', ','))}% · Status desa: ${esc(r.v.warna_desa || '-')}</b></td></tr></table>
    <table><tr><th width="4%">No</th><th width="24%">Yang ditanyakan</th><th width="32%">Jawaban & angka temuan</th><th width="20%">Kendala</th><th width="20%">Rencana perbaikan</th></tr>
    ${IND.map(it => `<tr><td>${it.no}</td><td><b>${esc(it.judul)}</b><br><i>Tanya ke: ${esc(it.tanya)}</i></td><td>${jawabTeks(r, it).map(esc).join('<br>')}</td>
      <td>${esc(r.kendala[it.no] || '').replace(/\n/g, '<br>')}</td><td>${esc(r.rencana[it.no] || '').replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
    ${r.balita.length ? `<p><b>Daftar balita yang belum diperiksa di Puskesmas / belum ke rumah sakit</b></p><table><tr><th>No</th><th>Nama balita</th><th>Umur</th><th>Pemeriksaan/Rujukan</th><th>Hambatan</th><th>Tindak lanjut & pendamping</th></tr>
      ${r.balita.map((b, n) => `<tr><td>${n + 1}</td><td>${esc(b.nama)}</td><td>${esc(b.umur)}</td><td>${esc(b.jenis)}</td><td>${esc(b.hambatan)}</td><td>${esc(b.tl)}</td></tr>`).join('')}</table>` : ''}
    <p><b>Kesepakatan Tindak Lanjut Desa</b></p><table><tr><th>Prioritas</th><th>Masalah</th><th>Kegiatan perbaikan</th><th>Penanggung jawab</th><th>Batas waktu</th></tr>
    ${r.sepakat.map((p, n) => `<tr><td>${n + 1}</td><td>${esc(p.masalah)}</td><td>${esc(p.kegiatan)}</td><td>${esc(p.pj)}</td><td>${p.batas ? fmtTgl(p.batas) : ''}</td></tr>`).join('')}</table>
    <p>Jadwal kunjungan ulang: ${r.ulang ? fmtTgl(r.ulang) : '-'}</p>
    <table class="noborder"><tr>${[['tim', 'Tim Verifikasi'], ['desa', 'Perwakilan Pemerintah Desa'], ['kader', 'Kader/Pendamping Desa']].map(([k, l]) =>
      `<td style="text-align:center;width:33%">${l}<br>${ttdImgs[k] ? `<img class="s" src="${esc(ttdImgs[k])}">` : '<br><br><br>'}<br>( ${esc(r.ttd[k].nama || '....................')} )</td>`).join('')}</tr></table>
    ${fotos.filter(Boolean).length ? `<p><b>Dokumentasi</b></p><div>${fotos.map((s, n) => s ? `<div style="display:inline-block;width:32%;margin:0 1% 6px 0;vertical-align:top"><img src="${esc(s)}" style="width:100%"><br>${esc(r.foto[n].ket)}</div>` : '').join('')}</div>` : ''}
    <p style="text-align:center;font-size:8pt;color:#555">ID: ${r.id} · Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel</p>`;
  setTimeout(() => window.print(), 300);
}

/* ---------- Sinkronisasi ---------- */
const kolomMonev = () => {
  const cols = []; let prev = '';
  ALL_FIELDS.forEach(f => { const h = f.l.startsWith('dari') ? `${prev} (${f.l})` : f.l; if (!f.l.startsWith('dari')) prev = f.l; cols.push([f.k, `${f.no}. ${h}${f.u === '%' ? ' (%)' : ''}`]); });
  return cols;
};
const KOLOM = kolomMonev();
async function uploadMedia(r, m, nama) {
  if (m.url || !m.mid) return;
  const data = await idb.get(m.mid); if (!data) return;
  const j = await api('upload', { path: [r.kab, r.kec, r.desa], name: nama, data });
  m.url = j.url; saveRecs();
}
function payloadMonev(r) {
  const row = { 'ID': r.id, 'Kode Tim': r.kode, 'Nama Tim': sess.tim.nama, 'Kabupaten/Kota': r.kab, 'Kecamatan': r.kec, 'Desa': r.desa,
    'Tanggal Kunjungan': r.tanggal, 'Tim Verifikasi': r.tim, 'Pendamping': r.pendamping, 'Periode Data': r.periode };
  KOLOM.forEach(([k, h]) => { const x = r.v[k]; row[h] = Array.isArray(x) ? x.join(', ') : (x ?? ''); });
  IND.forEach(it => { row[`${it.no}. Kendala`] = r.kendala[it.no] || ''; row[`${it.no}. Rencana perbaikan`] = r.rencana[it.no] || ''; });
  row['Jadwal Kunjungan Ulang'] = r.ulang;
  [['tim', 'Tim Verifikasi'], ['desa', 'Pemdes'], ['kader', 'Kader']].forEach(([k, l]) => { row[`TTD ${l} (nama)`] = r.ttd[k].nama || ''; row[`TTD ${l} (link)`] = r.ttd[k].url || ''; });
  row['Jumlah Foto'] = r.foto.length; row['Dibuat (HP)'] = new Date(r.created).toISOString(); row['Diubah (HP)'] = new Date(r.updated).toISOString();
  const base = { 'ID': r.id, 'Kabupaten/Kota': r.kab, 'Kecamatan': r.kec, 'Desa': r.desa };
  const json = JSON.stringify({ ...r, foto: r.foto.map(f => ({ ket: f.ket, url: f.url })), ttd: Object.fromEntries(Object.entries(r.ttd).map(([k, t]) => [k, { nama: t.nama, url: t.url }])) });
  return {
    id: r.id, row, json,
    balita: r.balita.filter(b => b.nama).map((b, n) => ({ ...base, 'No': n + 1, 'Nama Balita': b.nama, 'Umur': b.umur, 'Pemeriksaan/Rujukan': b.jenis, 'Hambatan': b.hambatan, 'Tindak Lanjut & Pendamping': b.tl })),
    sepakat: r.sepakat.filter(p => p.masalah || p.kegiatan).map((p, n) => ({ ...base, 'Prioritas': n + 1, 'Masalah': p.masalah, 'Kegiatan Perbaikan': p.kegiatan, 'Penanggung Jawab': p.pj, 'Batas Waktu': p.batas })),
    foto: [...r.foto.map(f => ({ ...base, 'Jenis': 'Foto', 'Keterangan': f.ket, 'Link': f.url || '' })),
      ...Object.entries(r.ttd).filter(([, t]) => t.url).map(([k, t]) => ({ ...base, 'Jenis': 'Tanda tangan ' + k, 'Keterangan': t.nama, 'Link': t.url }))]
  };
}
let syncing = false;
async function sync(manual) {
  if (syncing || !navigator.onLine || !getUrl() || !sess?.tim) { refreshStatus(); return; }
  syncing = true; let ok = 0, fail = 0;
  try { await kirimProfil(); } catch (e) { console.warn('profil', e); }
  for (const r of recs.filter(x => x.status === 'final' && !x.synced && x.kode === sess.kode)) {
    const ver = r.updated;
    try {
      const tag = `${r.desa}_${r.tanggal}`.replace(/\s+/g, '_');
      for (const [k, t] of Object.entries(r.ttd)) await uploadMedia(r, t, `${tag}_ttd_${k}.png`);
      for (let n = 0; n < r.foto.length; n++) await uploadMedia(r, r.foto[n], `${tag}_foto${n + 1}.jpg`);
      await api('simpanMonev', payloadMonev(r));
      if (r.updated === ver) { r.synced = true; r.syncedAt = Date.now(); saveRecs(); }
      ok++;
    } catch (e) { fail++; console.warn('sync', r.id, e); }
  }
  if (A.syncLaporan) { const x = await A.syncLaporan(); ok += x.ok; fail += x.fail; }
  syncing = false;
  if (ok) toast(`☁️ ${ok} data terkirim ke server`); else if (fail && manual) toast('Gagal mengirim. Periksa koneksi/URL server.');
  if ($('#bNew')) home(); else refreshStatus();
}
A.sync = sync;

window.addEventListener('online', () => { refreshStatus(); sync(); });
window.addEventListener('offline', refreshStatus);
setInterval(sync, 60000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.warn);
window.addEventListener('load', () => { if (sess?.tim) { home(); sync(); } else loginView(); });
})();
