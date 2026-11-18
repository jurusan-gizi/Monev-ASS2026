/* Daftar Tilik Monitoring Evaluasi Tahap II Program Gizi
   Dasar: RTL Monev Program Gizi Triwulan III 2026, pertemuan 9–11 November 2026 */
const DASAR_KUNJUNGAN = 'RTL Monev Program Gizi Triwulan III 2026, pertemuan 9–11 November 2026';

const KABKOTA = ['Kepulauan Selayar','Bulukumba','Bantaeng','Jeneponto','Takalar','Gowa','Sinjai','Maros',
  'Pangkajene dan Kepulauan','Barru','Bone','Soppeng','Wajo','Sidenreng Rappang','Pinrang','Enrekang','Luwu',
  'Tana Toraja','Luwu Utara','Luwu Timur','Toraja Utara','Kota Makassar','Kota Parepare','Kota Palopo'];

const JENJANG = {
  kab: {
    nama: 'Dinas Kesehatan Kab/Kota', singkat: 'Dinkes', unitLabel: 'Unit/Lokasi (bidang/seksi)', ikon: '🏛️',
    items: [
      { j:'Validasi data status gizi pada pengukuran antropometri', b:'Rekap per indikator dan Puskesmas, berita acara validasi, daftar koreksi.', k:'Kendala dalam validasi',
        q:['Berapa kali validasi data dilakukan dalam setahun?','Bagaimana validasi dilakukan dan kapan terakhir dilaksanakan?','Apa selisih data yang ditemukan?'] },
      { j:'Penimbangan (D/S)', b:'Rekap cakupan bulanan, daftar Puskesmas prioritas, bukti umpan balik.', k:'Kendala Puskesmas yang capaiannya paling rendah',
        q:['Apakah capaian penimbangan dipantau setiap bulan?','Berapa capaian D/S Kabupaten? Puskesmas mana yang cakupannya paling rendah?','Apakah data ini sudah dilakukan diseminasi di tingkat kabupaten?'] },
      { j:'ASI eksklusif dan MP-ASI', b:'Rekap ASI eksklusif dan MP-ASI kategori baik, cakupan recall per sasaran, catatan pembinaan.', k:'Kendala hasil recall tidak sesuai jumlah sasaran ASI dan MP-ASI',
        q:['Apakah rekap recall setiap Puskesmas sudah diverifikasi?','Berapa sasaran yang sudah di-recall dan berapa yang tercatat ASI eksklusif atau MP-ASI kategori baik, masing-masing?','Kenapa hasil recall sangat kecil dibanding jumlah sasaran?'] },
      { j:'Vitamin A', b:'Rekap sasaran usia 6–59 bulan, laporan pemberian, hasil verifikasi.', k:'Kendala tidak semua sasaran mendapat vitamin A',
        q:['Apakah daftar balita 6–59 bulan yang belum mendapat vitamin A sudah ditelusuri?','Berapa sasaran balita yang mendapat vitamin A semester 2 dan berapa selisih yang belum mendapat vitamin A?','Bagaimana kolaborasi Puskesmas dan kader dalam peningkatan cakupan vitamin A?'] },
      { j:'PMT', b:'Rekap PMT per kategori sasaran, laporan pemantauan, catatan koreksi.', k:'Kendala pelaksanaan PMT',
        q:['Apakah daftar penerima PMT sudah diverifikasi per kategori (gizi kurang, BB kurang, BB tidak naik dan ibu hamil KEK)?','Apakah anggaran dana PMT sudah mencakup seluruh sasaran balita dan ibu hamil bermasalah gizi? Puskesmas apa yang realisasi PMT-nya paling rendah?','Berapa selisih balita dan ibu hamil yang dicakup dari anggaran BOK Puskesmas dan berapa selisih yang tidak dicakup anggaran BOK Puskesmas?','Apakah ada sumber anggaran lain untuk PMT?'] },
      { j:'Gizi buruk', b:'Rekap kasus per Puskesmas, hasil verifikasi, rekap tata laksana dan rujukan.', k:'Kendala pelaporan Pelita Kesmas',
        q:['Apakah seluruh laporan kasus dan laporan 0% sudah diperiksa?','Berapa kasus terkonfirmasi yang mendapat tata laksana?','Apakah seluruh gizi buruk sudah diverifikasi dalam laporan Pelita Kesmas dan apakah perawatan harian sudah diisi? Berapa selisih balita gizi buruk yang belum dikonfirmasi dalam laporan Pelita Kesmas?'] },
      { j:'Rawat jalan dengan RUTF', b:'Alokasi, bukti serah terima, kartu stok, rekap kelayakan rawat jalan dan pemberian RUTF.', k:'Kendala RUTF',
        q:['Apakah RUTF sudah didistribusikan pada seluruh Puskesmas?','Berapa balita yang lolos tes nafsu makan di setiap Puskesmas?','Bagaimana kolaborasi Tim Asuhan Gizi Puskesmas (dokter, perawat/bidan dan nutrisionis)?','Apakah protokol RUTF sudah dijalankan (termasuk tata laksana medis oleh dokter dan tindakan yang dilakukan saat kontrol mingguan)?'] },
      { j:'Penelusuran dan rujukan', b:'Rekap wilayah, daftar penelusuran, bukti rujukan dan umpan balik fasilitas rujukan.', k:'Kendala rujukan',
        q:['Apakah ada daftar balita stunting yang perlu dirujuk?','Berapa yang sudah dirujuk? Dan berapa yang belum dilakukan rujukan?','Apakah ada kerja sama Dinkes, Puskesmas dan rumah sakit terutama dalam pemberian formula PKMK pada balita rujukan?'] },
      { j:'Perencanaan Program dan Kolaborasi Lintas Sektor', b:'Notulen bersama Bappelitbangda/perangkat daerah, matriks kebutuhan, dokumen usulan.', k:'Kendala perencanaan program',
        q:['Apakah indikator yang bermasalah sudah masuk dalam rancangan perencanaan tahun 2027?','Bagaimana peran Bappeda/Bapperida dalam perencanaan program gizi?','Bagaimana kolaborasi sektor dalam konvergensi stunting?'] },
      { j:'Peningkatan Kapasitas Petugas', b:'Notulen, matriks kebutuhan, dokumen usulan.', k:'Kendala SDM petugas',
        q:['Pelatihan program gizi apa saja yang dibutuhkan oleh petugas kabupaten?','Bagaimana ketersediaan SDM tenaga pencatatan dan pelaporan?','Bagaimana peran Dinas Kesehatan dalam pengisian webmon Bina Bangda?'] }
    ]
  },
  pkm: {
    nama: 'Puskesmas', singkat: 'Puskesmas', unitLabel: 'Nama Puskesmas', ikon: '🏥',
    items: [
      { j:'Validasi data status gizi pada pengukuran antropometri', b:'Register pengukuran, Buku KIA/KMS, laporan, catatan validasi dan koreksi.', k:'Kendala validasi data antropometri',
        q:['Berapa kali validasi hasil pengukuran dari Posyandu dilakukan dalam setahun?','Bagaimana hasil ukur dicocokkan dengan register, Buku KIA/KMS dan laporan, serta kapan terakhir dilakukan?','Apa selisih yang ditemukan dan bagaimana pengukuran ulang serta koreksi datanya dilakukan?'] },
      { j:'Penimbangan (D/S)', b:'Rekap D/S per Posyandu, daftar sasaran, catatan sweeping dan kunjungan rumah.', k:'Kendala Posyandu dengan capaian paling rendah',
        q:['Apakah capaian penimbangan dipantau setiap bulan?','Berapa capaian D/S Puskesmas? Posyandu mana yang cakupannya paling rendah?','Apakah hasilnya sudah dibahas dengan desa/kelurahan dan kader? Bagaimana hasil sweeping atau kunjungan rumah bagi balita yang belum ditimbang?'] },
      { j:'ASI eksklusif dan MP-ASI', b:'Formulir recall, daftar sasaran, rekap ASI dan MP-ASI, catatan konseling.', k:'Kendala recall dan konseling ASI serta MP-ASI',
        q:['Apakah hasil recall dari setiap Posyandu sudah diverifikasi?','Berapa sasaran yang sudah di-recall dan berapa yang tercatat ASI eksklusif atau MP-ASI kategori baik, masing-masing?','Apa penyebab cakupan recall rendah dan bagaimana penelusuran sasaran serta konseling ditindaklanjuti?'] },
      { j:'Vitamin A', b:'Register vitamin A semester 2, daftar sasaran belum mendapat, catatan penjangkauan.', k:'Kendala penjangkauan sasaran vitamin A',
        q:['Apakah daftar balita 6–59 bulan yang belum mendapat vitamin A sudah ditelusuri?','Berapa sasaran yang mendapat vitamin A semester 2 dan berapa yang belum mendapat?','Bagaimana pembagian tugas petugas dan kader dalam menjangkau sasaran yang belum mendapat vitamin A?'] },
      { j:'PMT', b:'Daftar penerima per kategori, anggaran BOK dan dukungan lain, catatan konsumsi dan pertumbuhan.', k:'Kendala pelaksanaan PMT',
        q:['Apakah penerima PMT sudah diverifikasi per kategori (gizi kurang, BB kurang, BB tidak naik dan ibu hamil KEK)?','Apakah anggaran PMT mencakup seluruh sasaran? Desa/Posyandu mana yang realisasinya paling rendah?','Berapa sasaran yang dicakup dan belum dicakup BOK? Apakah ada dukungan sumber anggaran lain?','Bagaimana konsumsi PMT dan perubahan berat badan atau pertumbuhan penerima dipantau?'] },
      { j:'Gizi buruk', b:'Register gizi buruk, laporan Pelita Kesmas, catatan perawatan dan tindak lanjut.', k:'Kendala pencatatan dan pelaporan Pelita Kesmas',
        q:['Apakah semua laporan kasus dari Posyandu dan laporan 0% sudah diverifikasi?','Berapa kasus terkonfirmasi yang mendapat tata laksana?','Apakah kasus dan perawatan harian sudah diisi dalam Pelita Kesmas? Berapa kasus yang belum dikonfirmasi dan apa tindak lanjutnya?'] },
      { j:'Rawat jalan dengan RUTF', b:'Kartu stok, tes nafsu makan, catatan Tim Asuhan Gizi, pemberian RUTF dan kontrol mingguan.', k:'Kendala tata laksana dan logistik RUTF',
        q:['Apakah RUTF sudah diterima? Berapa saldo stok dan bagaimana penerimaan serta pengeluarannya dicatat?','Berapa balita menjalani tes nafsu makan dan berapa yang lolos?','Bagaimana pembagian tugas dokter, perawat/bidan dan nutrisionis dalam Tim Asuhan Gizi?','Apakah protokol RUTF, tata laksana medis dan kontrol mingguan sudah dilaksanakan dan dicatat? Bagaimana anak yang tidak datang kontrol ditelusuri?'] },
      { j:'Penelusuran dan rujukan', b:'Daftar kasus, surat rujukan, umpan balik RS, catatan koordinasi dan tindak lanjut.', k:'Kendala rujukan dan tindak lanjut',
        q:['Apakah ada daftar balita stunting yang dinilai perlu dirujuk?','Berapa yang sudah dan belum dirujuk? Bagaimana hasil serta umpan balik rujukannya?','Bagaimana koordinasi dengan Dinkes dan rumah sakit terkait layanan lanjutan, termasuk formula PKMK bagi balita rujukan sesuai hasil penilaian?'] },
      { j:'Perencanaan Program dan Kolaborasi Lintas Sektor', b:'Rancangan kegiatan 2027, notulen lintas sektor, usulan desa/kelurahan.', k:'Kendala perencanaan dan kolaborasi lintas sektor',
        q:['Apakah indikator bermasalah di wilayah kerja sudah masuk rancangan kegiatan tahun 2027?','Bagaimana kebutuhan program gizi dibahas bersama desa/kelurahan, kecamatan dan Dinas Kesehatan?','Apa pembagian peran lintas sektor dalam konvergensi stunting dan bagaimana pelaksanaannya dipantau?'] },
      { j:'Peningkatan Kapasitas Petugas', b:'Daftar petugas, pembagian tugas, usulan pelatihan, bukti penyampaian data ke Dinkes.', k:'Kendala SDM petugas dan kader',
        q:['Pelatihan program gizi apa yang dibutuhkan oleh petugas dan kader?','Bagaimana ketersediaan tenaga pencatatan dan pelaporan serta pembagian tugasnya?','Bagaimana data dan bukti kegiatan disampaikan kepada Dinkes untuk mendukung pelaporan, termasuk webmon Bina Bangda?'] }
    ]
  },
  pos: {
    nama: 'Posyandu', singkat: 'Posyandu', unitLabel: 'Nama Posyandu (dan desa/kelurahan)', ikon: '🏡',
    items: [
      { j:'Validasi data status gizi pada pengukuran antropometri', b:'Register Posyandu, Buku KIA/KMS, catatan pemeriksaan bersama petugas.', k:'Kendala pengukuran dan pencatatan',
        q:['Berapa kali hasil timbang dan ukur diperiksa bersama petugas Puskesmas dalam setahun?','Bagaimana hasilnya dicocokkan dengan register dan Buku KIA/KMS, serta kapan terakhir diperiksa?','Apa selisih yang ditemukan dan bagaimana hasil yang meragukan dilaporkan untuk pengukuran ulang?'] },
      { j:'Penimbangan (D/S)', b:'Daftar sasaran, rekap D/S, catatan kunjungan dan perubahan sasaran.', k:'Kendala kehadiran dan penjangkauan balita',
        q:['Apakah jumlah balita yang ditimbang dan seluruh sasaran dicatat setiap bulan?','Berapa capaian D/S Posyandu? Siapa saja yang belum datang ditimbang?','Bagaimana kader menghubungi atau mengunjungi keluarga, termasuk balita pindahan atau yang tidak membawa Buku KIA? Apa hasilnya?'] },
      { j:'ASI eksklusif dan MP-ASI', b:'Formulir recall, daftar sasaran, catatan edukasi dan koordinasi petugas.', k:'Kendala recall ASI dan MP-ASI',
        q:['Apakah wawancara atau recall ASI dan MP-ASI sudah dilakukan bersama petugas?','Berapa sasaran sudah diwawancarai dan berapa yang tercatat ASI eksklusif atau MP-ASI kategori baik, masing-masing?','Mengapa masih ada sasaran belum diwawancarai dan bagaimana keluarga yang perlu konseling disampaikan kepada petugas?'] },
      { j:'Vitamin A', b:'Daftar sasaran dan catatan vitamin A semester 2, hasil penelusuran.', k:'Kendala sasaran belum mendapat vitamin A',
        q:['Apakah kader memiliki daftar balita 6–59 bulan yang belum mendapat vitamin A?','Berapa balita mendapat vitamin A semester 2 dan berapa yang belum mendapat?','Bagaimana kader bersama petugas menjangkau sasaran yang belum mendapat vitamin A?'] },
      { j:'PMT', b:'Daftar penerima dari Puskesmas, catatan pemberian, konsumsi dan hasil timbang.', k:'Kendala pelaksanaan dan pemantauan PMT',
        q:['Apakah daftar penerima PMT balita dan ibu hamil KEK sesuai daftar yang dikonfirmasi Puskesmas?','Berapa sasaran sudah menerima PMT dan berapa yang belum menerima?','Bagaimana pemberian, konsumsi dan hasil timbang penerima PMT dicatat serta dilaporkan?','Adakah dukungan desa atau pihak lain untuk PMT dan bagaimana dikoordinasikan dengan Puskesmas?'] },
      { j:'Gizi buruk', b:'Catatan pelaporan kasus, konfirmasi petugas, catatan pendampingan.', k:'Kendala pelaporan dan pendampingan kasus',
        q:['Apakah balita yang dicurigai gizi buruk sudah dilaporkan kepada petugas Puskesmas?','Berapa yang sudah mendapat pemeriksaan atau tindak lanjut dari petugas?','Bagaimana kader menyampaikan hasil pendampingan kepada Puskesmas untuk mendukung pencatatan kasus dan perawatan?'] },
      { j:'Rawat jalan dengan RUTF', b:'Daftar dampingan, jadwal kontrol, catatan kunjungan dan pelaporan kendala.', k:'Kendala pendampingan keluarga penerima RUTF',
        q:['Apakah ada balita penerima RUTF dari Puskesmas yang didampingi kader?','Berapa anak yang didampingi dan apakah jadwal kontrolnya diketahui kader?','Bagaimana kader membantu keluarga mengikuti anjuran petugas dan mengingatkan kontrol mingguan?','Bagaimana kendala pemberian RUTF atau anak yang tidak datang kontrol dilaporkan kepada petugas?'] },
      { j:'Penelusuran dan rujukan', b:'Catatan anjuran petugas, pendampingan keluarga dan konfirmasi tindak lanjut.', k:'Kendala keluarga mengikuti pemeriksaan atau rujukan',
        q:['Apakah kader memiliki daftar balita stunting yang dianjurkan petugas untuk diperiksa atau dirujuk?','Berapa keluarga sudah dan belum mengikuti anjuran pemeriksaan atau rujukan?','Bagaimana kader berkoordinasi dengan Puskesmas untuk mendampingi keluarga dan mengetahui hasil tindak lanjutnya?'] },
      { j:'Perencanaan Program dan Kolaborasi Lintas Sektor', b:'Usulan kebutuhan Posyandu, notulen desa/kelurahan, catatan dukungan lintas sektor.', k:'Kendala dukungan dan koordinasi lintas sektor',
        q:['Apakah masalah layanan Posyandu sudah diusulkan dalam perencanaan desa/kelurahan tahun 2027?','Bagaimana kader menyampaikan kebutuhan kepada Puskesmas dan pemerintah desa/kelurahan?','Apa dukungan desa/kelurahan, PKK dan pihak lain untuk meningkatkan layanan serta menjangkau balita yang belum terlayani?'] },
      { j:'Peningkatan Kapasitas Petugas dan Kader', b:'Daftar kader aktif, pembagian tugas, catatan pelatihan dan bukti penyampaian laporan.', k:'Kendala jumlah, kemampuan dan pelaporan kader',
        q:['Pelatihan atau pendampingan apa yang dibutuhkan kader untuk pengukuran, konseling dan pencatatan?','Apakah jumlah kader aktif cukup dan bagaimana pembagian tugas pencatatannya?','Bagaimana laporan kegiatan disampaikan kepada Puskesmas dan apa kendala kelengkapan atau ketepatan waktunya?'] }
    ]
  }
};
