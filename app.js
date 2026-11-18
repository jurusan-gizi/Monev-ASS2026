/* Monev Gizi Tahap II – PWA offline-first, sinkron ke Google Sheet
   Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel */
(() => {
const KEY = 'monev2_records', KEY_URL = 'monev2_url', KEY_TIM = 'monev2_tim';
const $ = s => document.querySelector(s);
const app = $('#app'), navbot = $('#navbot'), navin = $('#navin');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STATUS_BUKTI = ['Lengkap & sesuai', 'Ada, belum lengkap', 'Tidak ada'];

/* ---------- Penyimpanan lokal ---------- */
let recs = [];
try { recs = JSON.parse(localStorage.getItem(KEY)) || []; } catch { recs = []; }
const save = () => localStorage.setItem(KEY, JSON.stringify(recs));
const getUrl = () => (localStorage.getItem(KEY_URL) || CONFIG.SCRIPT_URL || '').trim();
const find = id => recs.find(r => r.id === id);
const newId = () => 'MV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
const today = () => new Date().toISOString().slice(0, 10);
const fmtTgl = d => d ? new Date(d + 'T00:00').toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '-';
const fmtWaktu = t => t ? new Date(t).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : '';

function blankRecord(jenjang) {
  const last = JSON.parse(localStorage.getItem(KEY_TIM) || '{}');
  return {
    id: newId(), jenjang, kab: last.kab || '', unit: '', tanggal: today(),
    tim: last.tim || '', pendamping: '', periode: '',
    items: JENJANG[jenjang].items.map(it => ({ st: '', h: it.q.map(() => ''), k: '', u: '' })),
    status: 'draf', synced: false, created: Date.now(), updated: Date.now()
  };
}
const itemDone = it => !!(it.st || it.k.trim() || it.u.trim() || it.h.some(x => x.trim()));
const countDone = r => r.items.filter(itemDone).length;

/* ---------- UI helpers ---------- */
function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}
function modal(html) {
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal"><div class="card">${html}</div></div>`;
  root.querySelector('.modal').addEventListener('click', e => { if (e.target.classList.contains('modal')) root.innerHTML = ''; });
  return root;
}
const closeModal = () => $('#modalRoot').innerHTML = '';
function confirmBox(msg, okText, onOk) {
  const root = modal(`<p style="margin-top:0">${msg}</p><div class="acts" style="justify-content:flex-end">
    <button class="btn btn-o" id="mNo">Batal</button><button class="btn btn-p" id="mOk">${okText}</button></div>`);
  root.querySelector('#mNo').onclick = closeModal;
  root.querySelector('#mOk').onclick = () => { closeModal(); onOk(); };
}
function setNav(btns) {
  if (!btns) { navbot.classList.add('hide'); return; }
  navbot.classList.remove('hide');
  navin.innerHTML = btns.map((b, i) => `<button class="btn ${b.cls}" data-i="${i}">${b.text}</button>`).join('');
  navin.querySelectorAll('button').forEach(el => el.onclick = () => btns[el.dataset.i].fn());
}
const footer = () => `<footer class="app">Developed : <b>Manjilala, S.Gz, M.Gizi</b><br>Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel</footer>`;

/* ---------- Beranda ---------- */
function statusBar() {
  const on = navigator.onLine, pend = recs.filter(r => r.status === 'final' && !r.synced).length;
  const url = getUrl();
  return `<div class="status" id="statusBar">
    <span class="pill ${on ? '' : 'off'}"><span class="dot"></span>${on ? 'Online' : 'Offline'}</span>
    ${!url ? `<span class="pill wait">⚠️ Server belum diatur</span>` :
      pend ? `<span class="pill wait">⏳ ${pend} belum terkirim</span>` : `<span class="pill ok">✔ Semua terkirim</span>`}
    ${pend && on && url ? `<button class="btn btn-o" style="padding:5px 12px;font-size:13px" id="btnSync">Kirim sekarang</button>` : ''}
  </div>`;
}
function refreshStatus() {
  const el = $('#statusBar'); if (!el) return;
  el.outerHTML = statusBar();
  const b = $('#btnSync'); if (b) b.onclick = () => sync(true);
}

function home() {
  setNav(null); scrollTo(0, 0);
  const list = [...recs].sort((a, b) => b.updated - a.updated);
  app.innerHTML = `${statusBar()}
    <button class="btn btn-p btn-big" id="btnNew">＋ Isi Monev Baru</button>
    <h2>Riwayat Pengisian</h2>
    ${list.length ? list.map(r => {
      const J = JENJANG[r.jenjang];
      const badge = r.status === 'draf' ? '<span class="badge b-draf">Draf</span>'
        : r.synced ? '<span class="badge b-ok">✔ Terkirim</span>' : '<span class="badge b-wait">⏳ Menunggu kirim</span>';
      return `<div class="card"><div class="rec"><div class="ic">${J.ikon}</div><div class="t">
        <b>${esc(r.unit || '(tanpa nama unit)')}</b>
        <div class="m">${J.nama} · ${esc(r.kab || '-')}<br>${fmtTgl(r.tanggal)} · ${countDone(r)}/10 indikator</div></div>${badge}</div>
        <div class="acts">
          <button class="btn btn-o" data-a="open" data-id="${r.id}">✏️ ${r.status === 'draf' ? 'Lanjutkan' : 'Lihat/Ubah'}</button>
          <button class="btn btn-o" data-a="print" data-id="${r.id}">🖨️ Cetak</button>
          <button class="btn btn-o" data-a="del" data-id="${r.id}">🗑️</button>
        </div></div>`;
    }).join('') : `<div class="card empty">Belum ada data.<br>Tekan <b>＋ Isi Monev Baru</b> untuk mulai.</div>`}
    ${footer()}`;
  $('#btnNew').onclick = pilihJenjang;
  const b = $('#btnSync'); if (b) b.onclick = () => sync(true);
  app.querySelectorAll('[data-a]').forEach(el => el.onclick = () => {
    const r = find(el.dataset.id);
    if (el.dataset.a === 'open') r.status === 'draf' ? identitas(r) : ringkasan(r);
    if (el.dataset.a === 'print') cetak(r);
    if (el.dataset.a === 'del') confirmBox(`Hapus data <b>${esc(r.unit)}</b> dari HP ini?${r.synced ? '<br><small>Data yang sudah terkirim tetap tersimpan di server.</small>' : ''}`,
      'Hapus', () => { recs = recs.filter(x => x.id !== r.id); save(); home(); });
  });
}

/* ---------- Pilih jenjang ---------- */
function pilihJenjang() {
  scrollTo(0, 0);
  app.innerHTML = `<h2 style="margin-top:4px">Pilih sasaran kunjungan</h2>
    <div class="jenjang">${Object.entries(JENJANG).map(([k, J]) =>
      `<button class="jcard" data-k="${k}"><span class="ic">${J.ikon}</span><div><b>${J.nama}</b><span>10 indikator verifikasi</span></div></button>`).join('')}
    </div>${footer()}`;
  app.querySelectorAll('.jcard').forEach(el => el.onclick = () => {
    const r = blankRecord(el.dataset.k); recs.push(r); save(); identitas(r);
  });
  setNav([{ text: '← Kembali', cls: 'btn-o', fn: home }]);
}

/* ---------- Identitas kunjungan ---------- */
function identitas(r) {
  scrollTo(0, 0);
  const J = JENJANG[r.jenjang];
  app.innerHTML = `
    <div class="step-top"><span>${J.ikon} ${J.nama}</span><span>Identitas</span></div>
    <div class="bar"><i style="width:4%"></i></div>
    <div class="card">
      <div class="hint" style="margin:0 0 4px">Dasar kunjungan: ${DASAR_KUNJUNGAN}</div>
      <label class="f req">Kabupaten/Kota</label>
      <select id="kab"><option value="">— pilih —</option>${KABKOTA.map(k => `<option ${k === r.kab ? 'selected' : ''}>${k}</option>`).join('')}</select>
      <label class="f req">${J.unitLabel}</label><input type="text" id="unit" value="${esc(r.unit)}">
      <label class="f req">Tanggal kunjungan</label><input type="date" id="tanggal" value="${esc(r.tanggal)}">
      <label class="f req">Tim verifikasi</label><input type="text" id="tim" value="${esc(r.tim)}" placeholder="Nama anggota tim">
      <label class="f">Pendamping</label><input type="text" id="pendamping" value="${esc(r.pendamping)}">
      <label class="f">Periode data</label><input type="text" id="periode" value="${esc(r.periode)}" placeholder="mis. Januari–Oktober 2026">
    </div>${footer()}`;
  ['kab', 'unit', 'tanggal', 'tim', 'pendamping', 'periode'].forEach(f =>
    $('#' + f).addEventListener('input', e => touch(r, () => r[f] = e.target.value)));
  setNav([
    { text: '← Beranda', cls: 'btn-o', fn: home },
    { text: 'Mulai Isi →', cls: 'btn-p', fn: () => {
      if (!r.kab || !r.unit.trim() || !r.tanggal || !r.tim.trim()) return toast('Lengkapi isian bertanda *');
      localStorage.setItem(KEY_TIM, JSON.stringify({ kab: r.kab, tim: r.tim }));
      indikator(r, 0);
    }}
  ]);
}

function touch(r, fn) {
  fn(); r.updated = Date.now(); r.synced = false; save();
}

/* ---------- Isian per indikator ---------- */
function indikator(r, i) {
  scrollTo(0, 0);
  const J = JENJANG[r.jenjang], it = J.items[i], v = r.items[i];
  const huruf = 'abcdefgh';
  app.innerHTML = `
    <div class="step-top"><span>${J.ikon} ${esc(r.unit)}</span><span>Indikator ${i + 1} dari 10</span></div>
    <div class="bar"><i style="width:${(i + 1) * 9.5}%"></i></div>
    <div class="chips">${J.items.map((_, n) =>
      `<button class="chip ${n === i ? 'on' : itemDone(r.items[n]) ? 'done' : ''}" data-n="${n}">${n + 1}</button>`).join('')}</div>
    <div class="card">
      <h3 class="ind-title">${i + 1}. ${it.j}</h3>
      <div class="bukti"><b>Bukti yang diperiksa:</b> ${it.b}</div>
      <label class="f">Status bukti</label>
      <div class="radios">${STATUS_BUKTI.map(s =>
        `<label><input type="radio" name="st" value="${s}" ${v.st === s ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>
      <div class="sec"><b>Hasil penelusuran</b><div class="hint">Isi sesuai nomor pertanyaan, termasuk jumlah, periode dan cakupan yang relevan.</div>
      ${it.q.map((q, n) => `<div class="q"><div class="ql"><b>${huruf[n]}.</b> ${q}</div>
        <textarea data-h="${n}" placeholder="Jawaban ${huruf[n]}…">${esc(v.h[n])}</textarea></div>`).join('')}</div>
      <div class="sec"><label class="f" style="margin-top:0">Kendala/masalah yang ditemukan</label>
        <div class="hint" style="margin-bottom:6px">${it.k}</div>
        <textarea id="k">${esc(v.k)}</textarea>
        <label class="f">Upaya yang akan dilakukan</label>
        <textarea id="u">${esc(v.u)}</textarea></div>
    </div>${footer()}`;
  app.querySelectorAll('input[name=st]').forEach(el => el.onchange = () => touch(r, () => v.st = el.value));
  app.querySelectorAll('[data-h]').forEach(el => el.oninput = () => touch(r, () => v.h[el.dataset.h] = el.value));
  $('#k').oninput = e => touch(r, () => v.k = e.target.value);
  $('#u').oninput = e => touch(r, () => v.u = e.target.value);
  app.querySelectorAll('.chip').forEach(el => el.onclick = () => indikator(r, +el.dataset.n));
  setNav([
    { text: '← ' + (i ? 'Sebelumnya' : 'Identitas'), cls: 'btn-o', fn: () => i ? indikator(r, i - 1) : identitas(r) },
    i < 9 ? { text: 'Berikutnya →', cls: 'btn-p', fn: () => indikator(r, i + 1) }
          : { text: 'Selesai ✔', cls: 'btn-g', fn: () => ringkasan(r) }
  ]);
}

/* ---------- Ringkasan & simpan ---------- */
function ringkasan(r) {
  scrollTo(0, 0);
  const J = JENJANG[r.jenjang], done = countDone(r);
  app.innerHTML = `
    <div class="step-top"><span>${J.ikon} ${J.nama}</span><span>Ringkasan</span></div>
    <div class="bar"><i style="width:100%"></i></div>
    <div class="card">
      <b style="font-size:17px">${esc(r.unit)}</b>
      <div class="m" style="color:var(--redup);font-size:14px">${esc(r.kab)} · ${fmtTgl(r.tanggal)}<br>Tim: ${esc(r.tim)}${r.pendamping ? ' · Pendamping: ' + esc(r.pendamping) : ''}${r.periode ? '<br>Periode data: ' + esc(r.periode) : ''}</div>
      <div class="acts"><button class="btn btn-o" id="eId">✏️ Ubah identitas</button></div>
    </div>
    <div class="card">
      <b>${done}/10 indikator terisi</b> <span class="hint">— ketuk untuk mengubah</span>
      ${J.items.map((it, n) => `<div class="sum-item" data-n="${n}" style="cursor:pointer">
        <span class="n ${itemDone(r.items[n]) ? 'ok' : 'no'}">${n + 1}</span>
        <span style="flex:1">${it.j}<br><small style="color:var(--redup)">${esc(r.items[n].st || 'status bukti belum dipilih')}</small></span>›</div>`).join('')}
    </div>
    ${r.status === 'final' ? `<div class="card" style="text-align:center">${r.synced
      ? `✔ Terkirim ke server ${fmtWaktu(r.syncedAt)}` : '⏳ Tersimpan di HP, akan dikirim otomatis saat online'}</div>` : ''}
    ${footer()}`;
  $('#eId').onclick = () => identitas(r);
  app.querySelectorAll('.sum-item').forEach(el => el.onclick = () => indikator(r, +el.dataset.n));
  const finalize = () => {
    const go = () => { r.status = 'final'; r.updated = Date.now(); r.synced = false; save(); toast('Tersimpan ✔'); home(); sync(); };
    done < 10 ? confirmBox(`Baru ${done} dari 10 indikator yang terisi. Tetap simpan & kirim?`, 'Ya, simpan', go) : go();
  };
  setNav([
    { text: '🖨️ Cetak', cls: 'btn-o', fn: () => cetak(r) },
    { text: r.status === 'final' ? 'Simpan & Kirim' : 'Simpan & Kirim ✔', cls: 'btn-g', fn: finalize }
  ]);
}

/* ---------- Sinkronisasi ke Google Sheet ---------- */
let syncing = false;
function payload(r) {
  const J = JENJANG[r.jenjang];
  return {
    action: 'simpan',
    header: { id: r.id, jenjang: J.nama, kab: r.kab, unit: r.unit, tanggal: r.tanggal, tim: r.tim,
      pendamping: r.pendamping, periode: r.periode, terisi: countDone(r),
      dibuat: new Date(r.created).toISOString(), diubah: new Date(r.updated).toISOString(),
      perangkat: navigator.userAgent.slice(0, 120) },
    detail: J.items.map((it, n) => {
      const v = r.items[n];
      return { no: n + 1, indikator: it.j, bukti: it.b, status_bukti: v.st,
        jawaban: it.q.map((q, k) => ({ q, a: v.h[k] || '' })), kendala: v.k, upaya: v.u };
    })
  };
}
async function sync(manual) {
  const url = getUrl();
  if (syncing || !navigator.onLine || !url) { if (manual && !url) toast('URL server belum diatur (⚙️)'); refreshStatus(); return; }
  const pend = recs.filter(r => r.status === 'final' && !r.synced);
  if (!pend.length) { refreshStatus(); return; }
  syncing = true; let ok = 0, fail = 0;
  for (const r of pend) {
    const ver = r.updated;
    try {
      const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload(r)) }); // text/plain → tanpa preflight CORS
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'gagal');
      const cur = find(r.id);
      if (cur && cur.updated === ver) { cur.synced = true; cur.syncedAt = Date.now(); save(); }
      ok++;
    } catch (e) { fail++; console.warn('Sync gagal', r.id, e); }
  }
  syncing = false;
  if (ok) toast(`☁️ ${ok} data terkirim ke server`);
  else if (fail && manual) toast('Gagal mengirim. Periksa koneksi / URL server.');
  if (app.querySelector('#btnNew')) home(); else refreshStatus();
}

/* ---------- Cetak ---------- */
function cetak(r) {
  const J = JENJANG[r.jenjang], huruf = 'abcdefgh';
  $('#printArea').innerHTML = `
    <div class="kop"><img src="icons/logo-sulsel.png"><div><h3>Daftar Tilik Monitoring Evaluasi Tahap II Program Gizi ke ${J.nama}</h3>
      Dasar kunjungan | ${DASAR_KUNJUNGAN}</div></div>
    <table class="id"><tr><td width="14%">Kabupaten/Kota</td><td width="36%">: ${esc(r.kab)}</td><td width="14%">Unit/Lokasi</td><td>: ${esc(r.unit)}</td></tr>
      <tr><td>Tim verifikasi</td><td>: ${esc(r.tim)}</td><td>Pendamping</td><td>: ${esc(r.pendamping)}</td></tr>
      <tr><td>Tanggal</td><td>: ${fmtTgl(r.tanggal)}</td><td>Periode data</td><td>: ${esc(r.periode)}</td></tr></table><br>
    <table><thead><tr><th width="3%">No</th><th width="25%">Verifikasi kunjungan lapangan</th><th width="13%">Bukti yang diperiksa</th>
      <th width="27%">Hasil penelusuran</th><th width="16%">Kendala/masalah yang ditemukan</th><th width="16%">Upaya yang akan dilakukan</th></tr></thead>
    <tbody>${J.items.map((it, n) => { const v = r.items[n]; return `<tr><td>${n + 1}</td>
      <td><b>${it.j}</b>${it.q.map((q, k) => `<br>${huruf[k]}. ${q}`).join('')}</td>
      <td>${it.b}${v.st ? `<br><br><i>Status: ${esc(v.st)}</i>` : ''}</td>
      <td>${it.q.map((_, k) => `${huruf[k]}. ${esc(v.h[k]).replace(/\n/g, '<br>')}`).join('<br>')}</td>
      <td>${esc(v.k).replace(/\n/g, '<br>')}</td><td>${esc(v.u).replace(/\n/g, '<br>')}</td></tr>`; }).join('')}</tbody></table>
    <div class="ttd"><div>${esc(r.kab)}, ${fmtTgl(r.tanggal)}<br>Tim Verifikasi<br><br><br><br>( ${esc(r.tim)} )</div></div>
    <div class="dev">ID: ${r.id} · Developed : Manjilala, S.Gz, M.Gizi | Poltekkes Kemenkes Makassar | DPD PERSAGI Sulsel</div>`;
  setTimeout(() => window.print(), 150);
}

/* ---------- Pengaturan ---------- */
$('#btnSet').onclick = () => {
  const root = modal(`<h3 style="margin-top:0">⚙️ Pengaturan Server</h3>
    <label class="f">URL Web App Google Apps Script</label>
    <input type="text" id="sUrl" value="${esc(getUrl())}" placeholder="https://script.google.com/macros/s/…/exec">
    <div class="hint">Data tersimpan di HP dan dikirim otomatis ke Google Sheet setiap kali ada internet.</div>
    <div class="acts" style="justify-content:space-between;margin-top:14px">
      <button class="btn btn-o" id="sTest">Tes koneksi</button>
      <span><button class="btn btn-o" id="sNo">Tutup</button> <button class="btn btn-p" id="sOk">Simpan</button></span></div>`);
  root.querySelector('#sNo').onclick = closeModal;
  root.querySelector('#sOk').onclick = () => {
    localStorage.setItem(KEY_URL, root.querySelector('#sUrl').value.trim()); closeModal(); toast('Pengaturan disimpan'); sync(true);
  };
  root.querySelector('#sTest').onclick = async () => {
    const u = root.querySelector('#sUrl').value.trim(); if (!u) return toast('Isi URL dulu');
    try { const j = await (await fetch(u + (u.includes('?') ? '&' : '?') + 'ping=1')).json(); toast(j.ok ? '✔ Terhubung: ' + (j.sheet || 'server') : 'Server merespons, tapi tidak OK'); }
    catch { toast('❌ Tidak bisa terhubung'); }
  };
};

/* ---------- Mulai ---------- */
window.addEventListener('online', () => { refreshStatus(); sync(); });
window.addEventListener('offline', refreshStatus);
setInterval(sync, 60000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.warn);
home(); sync();
})();
