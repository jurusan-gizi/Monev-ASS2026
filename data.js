/* Definisi Daftar Tilik Monitoring Evaluasi Capaian Program Gizi Aksi Stop Stunting
   Jenis isian: num (angka bulat), dec (desimal), text, area, checks (centang banyak), radio, calc (hitung otomatis) */
const DATA_ACUAN = 'Rekap Monitoring Minggu ke-4 (per 5 November 2026)';

const n = v => (v === '' || v === undefined || v === null || isNaN(+v)) ? null : +v;
const pct = (a, b) => (n(a) === null || !n(b)) ? '' : Math.round(n(a) / n(b) * 1000) / 10;
const kurang = (a, b) => (n(a) === null || n(b) === null) ? '' : n(a) - n(b);
const warnaDesa = p => p === '' ? '' : p >= 100 ? 'Hijau' : p >= 50 ? 'Kuning' : 'Merah';

const LEMBAR = [
  { no: 1, judul: 'Cakupan pemantauan sasaran dan pertumbuhan balita', topik: 'Cakupan Pemantauan Sasaran dan Pertumbuhan Balita' },
  { no: 2, judul: 'Bantuan gizi untuk balita', topik: 'Bantuan Gizi untuk Balita' },
  { no: 3, judul: 'Pemeriksaan dan rujukan balita', topik: 'Pemeriksaan dan Rujukan Balita' },
  { no: 4, judul: 'Pemantauan dan bantuan gizi ibu hamil', topik: 'Pemantauan dan Bantuan Gizi Ibu Hamil' }
];

const IND = [
 { no:1, lb:1, judul:'Cakupan pemantauan balita', tanya:'Kader', fokus:'Sasaran belum terjangkau',
   bukti:'Rekap Minggu ke-4, daftar balita per dusun/Posyandu, catatan kunjungan rumah.',
   q:[ {t:'Dari daftar induk, berapa balita yang sudah punya data Minggu ke-4? Berapa yang belum?', f:[
        {k:'balita_total',l:'Total balita di daftar induk',type:'num',u:'anak'},
        {k:'balita_ada',l:'Sudah ada data',type:'num',u:'anak'},
        {k:'balita_belum',l:'Belum ada data',type:'calc',u:'anak',fn:v=>kurang(v.balita_total,v.balita_ada)},
        {k:'balita_pct',l:'Cakupan balita',type:'calc',u:'%',fn:v=>pct(v.balita_ada,v.balita_total)} ]},
       {t:'Dusun/Posyandu mana yang cakupannya paling rendah? Berapa balita yang belum punya data di sana?', f:[
        {k:'dusun_rendah',l:'Dusun/Posyandu',type:'text'},
        {k:'dusun_belum',l:'Belum ada data di sana',type:'num',u:'anak'} ]} ],
   cek:v=>[n(v.balita_ada)>n(v.balita_total)&&'Balita yang ada data lebih banyak dari total balita.'] },

 { no:2, lb:1, judul:'Cakupan pemantauan ibu hamil dan status warna desa', tanya:'Kader, Bidan desa', fokus:'Selisih cakupan dan status desa',
   bukti:'Daftar ibu hamil aktif, rekap Minggu ke-4, tampilan rekap online ASS.',
   q:[ {t:'Dari ibu hamil aktif, berapa yang sudah punya data Minggu ke-4? Berapa yang belum?', f:[
        {k:'bumil_total',l:'Total ibu hamil aktif',type:'num',u:'orang'},
        {k:'bumil_ada',l:'Sudah ada data',type:'num',u:'orang'},
        {k:'bumil_belum',l:'Belum ada data',type:'calc',u:'orang',fn:v=>kurang(v.bumil_total,v.bumil_ada)},
        {k:'bumil_pct',l:'Cakupan ibu hamil',type:'calc',u:'%',fn:v=>pct(v.bumil_ada,v.bumil_total)} ]},
       {t:'Cakupan gabungan balita dan ibu hamil, serta warna desa (dihitung otomatis).', f:[
        {k:'gab_pct',l:'Cakupan gabungan',type:'calc',u:'%',fn:v=>{const t=(n(v.balita_total)||0)+(n(v.bumil_total)||0);return t?pct((n(v.balita_ada)||0)+(n(v.bumil_ada)||0),t):''}},
        {k:'warna_desa',l:'Status warna desa',type:'calc',fn:v=>warnaDesa(v.gab_pct)} ]} ],
   cek:v=>[n(v.bumil_ada)>n(v.bumil_total)&&'Ibu hamil yang ada data lebih banyak dari total ibu hamil.'] },

 { no:3, lb:1, judul:'Perubahan berat badan dan status gizi balita', tanya:'TPG, Bidan desa', tpg:true, fokus:'Selisih data dan kelengkapan pengukuran',
   bukti:'Data awal e-PPGBM, buku catatan timbang-ukur, Buku KIA/KMS, rekap Minggu ke-4.',
   q:[ {t:'Untuk balita yang punya data awal dan data Minggu ke-4 yang lengkap, bagaimana perubahan berat badannya?', f:[
        {k:'bb_n',l:'Jumlah balita yang dibandingkan',type:'num',u:'anak'},
        {k:'bb_naik',l:'BB naik',type:'num',u:'anak'},
        {k:'bb_naik_pct',l:'BB naik',type:'calc',u:'%',fn:v=>pct(v.bb_naik,v.bb_n)},
        {k:'bb_tetap',l:'BB tetap',type:'num',u:'anak'},
        {k:'bb_turun',l:'BB turun',type:'num',u:'anak'},
        {k:'bb_rata',l:'Rata-rata perubahan BB',type:'dec',u:'kg'} ]},
       {t:'Berapa balita dengan berat badan kurang, pendek (stunting), dan kurus (wasting), saat data awal dan saat Minggu ke-4?', f:[
        {k:'bbk_a',l:'BB kurang – awal',type:'num'},{k:'bbk_an',l:'dari',type:'num'},
        {k:'bbk_m',l:'BB kurang – Minggu 4',type:'num'},{k:'bbk_mn',l:'dari',type:'num'},
        {k:'pdk_a',l:'Pendek – awal',type:'num'},{k:'pdk_an',l:'dari',type:'num'},
        {k:'pdk_m',l:'Pendek – Minggu 4',type:'num'},{k:'pdk_mn',l:'dari',type:'num'},
        {k:'krs_a',l:'Kurus – awal',type:'num'},{k:'krs_an',l:'dari',type:'num'},
        {k:'krs_m',l:'Kurus – Minggu 4',type:'num'},{k:'krs_mn',l:'dari',type:'num'} ], grid:4},
       {t:'Adakah data umur, berat badan, atau panjang/tinggi badan yang janggal? Bagaimana diukur ulang atau diperbaiki?', f:[
        {k:'janggal',l:'Data janggal',type:'radio',opt:['Tidak ada','Ada']},
        {k:'janggal_n',l:'Jumlah anak dengan data janggal',type:'num',u:'anak'},
        {k:'janggal_cara',l:'Cara perbaikan',type:'area'} ]} ],
   cek:v=>[n(v.bb_n)!==null&&((n(v.bb_naik)||0)+(n(v.bb_tetap)||0)+(n(v.bb_turun)||0))>n(v.bb_n)&&'Jumlah naik + tetap + turun melebihi jumlah balita yang dibandingkan.'] },

 { no:4, lb:2, judul:'PMT lokal balita', tanya:'Kader', fokus:'Pembagian dan konsumsi PMT',
   bukti:'Daftar sasaran dan penerima, catatan pembagian dan makan PMT, logbook kader.',
   q:[ {t:'Berapa sasaran dan penerima PMT lokal pada Minggu ke-4? Berapa yang belum menerima?', f:[
        {k:'pmt_sas',l:'Sasaran',type:'num'},{k:'pmt_trm',l:'Menerima',type:'num'},
        {k:'pmt_blm',l:'Belum menerima',type:'calc',fn:v=>kurang(v.pmt_sas,v.pmt_trm)} ]},
       {t:'Bagaimana kader memastikan PMT benar-benar diterima dan dimakan anak? Apa tindak lanjutnya bila ada masalah?', f:[
        {k:'pmt_cara',l:'Cara memastikan',type:'checks',opt:['Kunjungan rumah','Tanya ibu/pengasuh','Melihat langsung anak makan']},
        {k:'pmt_cara_lain',l:'Lainnya',type:'text'},
        {k:'pmt_tl',l:'Tindak lanjut bila ada masalah',type:'area'} ]} ],
   cek:v=>[n(v.pmt_trm)>n(v.pmt_sas)&&'Penerima PMT lebih banyak dari sasaran.'] },

 { no:5, lb:2, judul:'Pemberian Taburia', tanya:'Kader, Bidan desa', fokus:'Ketersediaan dan penggunaan Taburia',
   bukti:'Daftar sasaran dan penerima, catatan serah terima, pengakuan ibu/pengasuh.',
   q:[ {t:'Berapa sasaran yang tercatat dan berapa yang sudah menerima Taburia?', f:[
        {k:'tab_sas',l:'Sasaran',type:'num'},{k:'tab_trm',l:'Menerima',type:'num'},
        {k:'tab_blm',l:'Belum',type:'calc',fn:v=>kurang(v.tab_sas,v.tab_trm)} ]},
       {t:'Apakah keluarga memakai Taburia sesuai anjuran petugas (ditaburkan ke makanan anak)? Apa kendalanya?', f:[
        {k:'tab_sesuai',l:'Pemakaian',type:'radio',opt:['Sesuai anjuran','Belum sesuai']},
        {k:'tab_kendala',l:'Kendala',type:'checks',opt:['Stok kosong','Anak tidak mau','Cara pakai keliru']},
        {k:'tab_kendala_lain',l:'Kendala lainnya',type:'text'} ]} ],
   cek:v=>[n(v.tab_trm)>n(v.tab_sas)&&'Penerima Taburia lebih banyak dari sasaran.'] },

 { no:6, lb:2, judul:'Konseling gizi dan KAP untuk pengasuh balita', tanya:'Kader, TPG', fokus:'Jangkauan konseling dan tindak lanjut',
   bukti:'Buku catatan konseling, logbook kader, catatan kunjungan rumah, pengakuan pengasuh.',
   q:[ {t:'Berapa balita yang ibu/pengasuhnya sudah mendapat konseling gizi atau KAP (konseling tatap muka)?', f:[
        {k:'kons_n',l:'Balita yang pengasuhnya sudah dikonseling',type:'num',u:'balita'},
        {k:'kons_sas',l:'dari sasaran',type:'num',u:'balita'},
        {k:'kons_pct',l:'Cakupan konseling',type:'calc',u:'%',fn:v=>pct(v.kons_n,v.kons_sas)} ]},
       {t:'Pesan dan janji (komitmen) apa yang disepakati dengan pengasuh? Kapan kader memantau pelaksanaannya?', f:[
        {k:'kons_jadwal',l:'Jadwal kader memantau',type:'text'},
        {k:'kons_janji',l:'Pesan/janji yang disepakati',type:'area'} ]} ],
   cek:v=>[n(v.kons_n)>n(v.kons_sas)&&'Jumlah yang dikonseling lebih banyak dari sasaran.'] },

 { no:7, lb:2, judul:'Pemberian PKMK untuk balita', tanya:'Bidan desa, TPG, Kader', fokus:'Penerimaan dan kelanjutan PKMK',
   bukti:'Catatan anjuran petugas, daftar penerima, catatan penerimaan atau pemantauan keluarga.',
   q:[ {t:'Berapa balita yang dianjurkan petugas kesehatan mendapat PKMK (susu/makanan khusus), dan berapa yang sudah menerima?', f:[
        {k:'pkmk_anj',l:'Dianjurkan',type:'num'},{k:'pkmk_trm',l:'Sudah menerima',type:'num'} ]},
       {t:'Berapa yang belum menerima atau pemberiannya terputus? Apa akibatnya bagi anak?', f:[
        {k:'pkmk_blm',l:'Belum menerima',type:'calc',fn:v=>kurang(v.pkmk_anj,v.pkmk_trm)},
        {k:'pkmk_putus',l:'Terputus',type:'num'},
        {k:'pkmk_akibat',l:'Akibatnya',type:'area'} ]} ],
   cek:v=>[n(v.pkmk_trm)>n(v.pkmk_anj)&&'Penerima PKMK lebih banyak dari yang dianjurkan.'] },

 { no:8, lb:3, judul:'Balita yang perlu ditindaklanjuti dan diperiksa di Puskesmas', tanya:'Kader, Bidan desa', fokus:'Pemeriksaan yang belum terlaksana',
   bukti:'Daftar tindak lanjut, Buku KIA/KMS, logbook kader, bukti atau hasil pemeriksaan.',
   q:[ {t:'Berapa balita yang perlu ditindaklanjuti? Apa alasannya dan tindakan apa yang tercatat untuk balita prioritas?', f:[
        {k:'tl_n',l:'Jumlah',type:'num',u:'anak'},
        {k:'tl_alasan',l:'Alasan',type:'checks',opt:['BB tidak naik','BB kurang','Pendek','Kurus','Sakit']},
        {k:'tl_alasan_lain',l:'Alasan lainnya',type:'text'} ]},
       {t:'Berapa yang sudah diperiksa di Puskesmas (ada buktinya di desa)? Berapa yang masih menunggu, dan siapa pendampingnya?', f:[
        {k:'tl_periksa',l:'Sudah diperiksa',type:'num'},{k:'tl_tunggu',l:'Masih menunggu',type:'num'},
        {k:'tl_pendamping',l:'Pendamping',type:'text'} ]} ],
   cek:v=>[((n(v.tl_periksa)||0)+(n(v.tl_tunggu)||0))>(n(v.tl_n)??Infinity)&&'Sudah diperiksa + masih menunggu melebihi jumlah balita yang perlu ditindaklanjuti.'] },

 { no:9, lb:3, judul:'Rujukan balita ke rumah sakit', tanya:'Kader, Bidan desa, Keluarga', fokus:'Akses dan penyelesaian rujukan',
   bukti:'Daftar dan surat rujukan, hasil/umpan balik rumah sakit, catatan pendampingan, pengakuan keluarga.',
   q:[ {t:'Berapa balita yang dirujuk ke rumah sakit? Berapa yang sudah datang, belum datang, atau belum ada kabar hasilnya?', f:[
        {k:'rj_n',l:'Dirujuk',type:'num'},{k:'rj_datang',l:'Sudah datang',type:'num'},
        {k:'rj_belum',l:'Belum datang',type:'num'},{k:'rj_kabar',l:'Belum ada kabar',type:'num'} ]},
       {t:'Apa hambatan yang disampaikan keluarga? Tindak lanjut tiap balita ditulis di langkah "Daftar Balita" berikutnya.', f:[
        {k:'rj_hambatan',l:'Hambatan',type:'checks',opt:['Jarak/biaya transport','Belum punya BPJS','Keluarga belum bersedia']},
        {k:'rj_hambatan_lain',l:'Hambatan lainnya',type:'text'} ]} ],
   cek:v=>[((n(v.rj_datang)||0)+(n(v.rj_belum)||0))>(n(v.rj_n)??Infinity)&&'Sudah datang + belum datang melebihi jumlah yang dirujuk.'] },

 { no:10, lb:4, judul:'Ibu hamil KEK, tanda bahaya, status merah, dan rujukan', tanya:'Bidan desa, Kader', fokus:'Tindak lanjut ibu hamil prioritas',
   bukti:'Buku KIA, buku catatan ibu hamil, catatan ukur LiLA, tampilan rekap online, bukti rujukan.',
   q:[ {t:'Berapa ibu hamil pada setiap kelompok berikut? (satu ibu bisa masuk lebih dari satu kelompok)', f:[
        {k:'kek',l:'KEK (LiLA kurang dari 23,5 cm)',type:'num',u:'orang'},
        {k:'bahaya',l:'Ada tanda bahaya',type:'num',u:'orang'},
        {k:'merah',l:'Status merah di rekap online',type:'num',u:'orang'},
        {k:'multi',l:'Masuk lebih dari satu kelompok',type:'num',u:'orang'} ]},
       {t:'Berapa yang dirujuk, sudah dilayani, atau masih perlu dicari? Apakah tindak lanjut tanda bahaya sudah dipastikan ke bidan?', f:[
        {k:'bm_rujuk',l:'Dirujuk',type:'num'},{k:'bm_layani',l:'Sudah dilayani',type:'num'},
        {k:'bm_cari',l:'Masih dicari',type:'num'},
        {k:'bm_konfirm',l:'Sudah dipastikan ke bidan',type:'radio',opt:['Sudah','Belum']} ]} ] },

 { no:11, lb:4, judul:'Minum Tablet Tambah Darah (TTD) atau multivitamin ibu hamil (MMS)', tanya:'Kader, Bidan desa, Ibu hamil', fokus:'Ketersediaan dan kepatuhan minum TTD/MMS',
   bukti:'Buku KIA, catatan terima dan minum TTD/MMS, logbook, pengakuan ibu.',
   q:[ {t:'Berapa ibu hamil yang tercatat minum TTD atau MMS, dari seluruh ibu hamil yang dilaporkan?', f:[
        {k:'ttd_n',l:'Ibu yang minum TTD/MMS',type:'num',u:'ibu'},{k:'ttd_tot',l:'dari ibu hamil',type:'num',u:'ibu'},
        {k:'ttd_pct',l:'Persentase',type:'calc',u:'%',fn:v=>pct(v.ttd_n,v.ttd_tot)} ]},
       {t:'Bagaimana kader mengecek catatan minum tablet dan menindaklanjuti ibu yang belum minum?', f:[
        {k:'ttd_cek',l:'Cara mengecek',type:'checks',opt:['Cek Buku KIA','Tanya langsung','Hitung sisa tablet']},
        {k:'ttd_tl',l:'Tindak lanjut',type:'area'} ]} ],
   cek:v=>[n(v.ttd_n)>n(v.ttd_tot)&&'Ibu yang minum TTD/MMS lebih banyak dari total ibu hamil.'] },

 { no:12, lb:4, judul:'Susu dan PMT ibu hamil', tanya:'Kader, Bidan desa', fokus:'Jangkauan dan konsumsi susu/PMT',
   bukti:'Daftar sasaran dan penerima, catatan pembagian, logbook, pengakuan ibu.',
   q:[ {t:'Berapa sasaran dan penerima susu ibu hamil? Berapa sasaran dan penerima PMT ibu hamil?', f:[
        {k:'susu_sas',l:'Susu – sasaran',type:'num'},{k:'susu_trm',l:'Susu – menerima',type:'num'},
        {k:'susu_blm',l:'Susu – belum',type:'calc',fn:v=>kurang(v.susu_sas,v.susu_trm)},
        {k:'pmtb_sas',l:'PMT – sasaran',type:'num'},{k:'pmtb_trm',l:'PMT – menerima',type:'num'},
        {k:'pmtb_blm',l:'PMT – belum',type:'calc',fn:v=>kurang(v.pmtb_sas,v.pmtb_trm)} ]},
       {t:'Bagaimana pembagian dan konsumsi (benar-benar diminum/dimakan) dipantau?', f:[
        {k:'bm_pantau',l:'Cara memantau',type:'checks',opt:['Kunjungan rumah','Tanya ibu','Catatan di logbook']},
        {k:'bm_pantau_lain',l:'Keterangan',type:'text'} ]} ],
   cek:v=>[n(v.susu_trm)>n(v.susu_sas)&&'Penerima susu lebih banyak dari sasaran.',n(v.pmtb_trm)>n(v.pmtb_sas)&&'Penerima PMT ibu hamil lebih banyak dari sasaran.'] },

 { no:13, lb:4, judul:'Konseling gizi dan KAP ibu hamil', tanya:'Bidan desa, Kader', fokus:'Jangkauan dan tindak lanjut konseling',
   bukti:'Buku catatan konseling, Buku KIA, logbook, catatan kunjungan rumah.',
   q:[ {t:'Berapa ibu hamil yang sudah mendapat konseling gizi atau KAP? Topik apa yang dibahas dan apa yang disepakati?', f:[
        {k:'kb_n',l:'Ibu yang sudah dikonseling',type:'num',u:'ibu'},{k:'kb_tot',l:'dari ibu hamil',type:'num',u:'ibu'},
        {k:'kb_pct',l:'Cakupan konseling',type:'calc',u:'%',fn:v=>pct(v.kb_n,v.kb_tot)},
        {k:'kb_topik',l:'Topik',type:'checks',opt:['Makan bergizi','TTD/MMS','Tanda bahaya','Periksa kehamilan']},
        {k:'kb_sepakat',l:'Yang disepakati',type:'area'} ]},
       {t:'Ibu hamil mana yang masih perlu didampingi, dan kapan kader atau bidan menindaklanjutinya?', f:[
        {k:'kb_perlu',l:'Masih perlu didampingi',type:'num',u:'orang'},
        {k:'kb_jadwal',l:'Jadwal',type:'text'},
        {k:'kb_oleh',l:'Oleh',type:'checks',opt:['Kader','Bidan']} ]} ],
   cek:v=>[n(v.kb_n)>n(v.kb_tot)&&'Ibu yang dikonseling lebih banyak dari total ibu hamil.'] }
];

const KAMUS = {
 'Daftar induk':'Daftar seluruh sasaran (balita dan ibu hamil) desa yang tercatat di sistem online Aksi Stop Stunting.',
 'Minggu ke-4':'Data pemantauan minggu keempat program (rekap per 5 November 2026).',
 'Logbook':'Buku catatan harian kegiatan kader.',
 'TPG':'Tenaga Pelaksana Gizi (petugas gizi Puskesmas).',
 'PMT':'Pemberian Makanan Tambahan, dibuat dari bahan pangan setempat.',
 'Taburia':'Bubuk vitamin dan mineral yang ditaburkan ke makanan balita.',
 'PKMK':'Pangan Olahan untuk Keperluan Medis Khusus: susu/makanan khusus untuk balita atas anjuran dokter/petugas kesehatan.',
 'TTD':'Tablet Tambah Darah untuk ibu hamil.',
 'MMS':'Tablet multivitamin dan mineral untuk ibu hamil.',
 'KAP':'Komunikasi Antarpribadi: konseling tatap muka dengan ibu/pengasuh untuk menyepakati perubahan perilaku.',
 'e-PPGBM':'Aplikasi pencatatan hasil timbang dan ukur balita milik Puskesmas; dipakai sebagai data awal.',
 'KIA':'Buku Kesehatan Ibu dan Anak.',
 'KMS':'Kartu Menuju Sehat (grafik pertumbuhan anak).',
 'BB':'Berat Badan.',
 'Stunting':'Pendek: panjang/tinggi badan anak lebih rendah dari standar untuk umurnya.',
 'Wasting':'Kurus: berat badan anak terlalu rendah dibanding panjang/tinggi badannya.',
 'KEK':'Kurang Energi Kronis pada ibu hamil; ditandai lingkar lengan atas (LiLA) kurang dari 23,5 cm.',
 'LiLA':'Lingkar Lengan Atas, diukur dengan pita LiLA.',
 'Tanda bahaya':'Tanda bahaya kehamilan, misalnya perdarahan, bengkak di wajah/tangan, demam tinggi, gerak janin berkurang, sakit kepala hebat.',
 'Status merah':'Ibu hamil yang ditandai perlu perhatian segera pada tampilan rekap online.',
 'BPJS':'Jaminan Kesehatan Nasional (kartu BPJS Kesehatan).',
 'Rujukan':'Pengiriman sasaran ke Puskesmas atau rumah sakit untuk diperiksa/ditangani lebih lanjut.',
 'Cakupan':'Persentase sasaran yang sudah terlayani/terpantau dibanding seluruh sasaran.',
 'Warna desa':'Hijau = cakupan 100%; Kuning = 50% sampai di bawah 100%; Merah = di bawah 50%.'
};

/* semua field berurutan (untuk kolom Sheet & perhitungan) */
const ALL_FIELDS = IND.flatMap(it => it.q.flatMap(q => q.f.map(f => ({ ...f, no: it.no }))));
function hitung(v) { ALL_FIELDS.filter(f => f.type === 'calc').forEach(f => { v[f.k] = f.fn(v); }); return v; }
