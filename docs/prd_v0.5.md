# PRD: Web App & Direktori Hafalan Asmaul Husna

**Status:** Live v0.5 (`https://asmaulhusna.ipadillah.com`, di-deploy via Cloudflare Workers Static Assets) | **Perubahan dari v0.4:** Membuka halaman utama `/` sebagai **Direktori Publik 99 Asmaul Husna** (pencarian instan, daftar lengkap Arab/Latin/arti, salin teks, catatan riwayat, FAQ, dan kredit pembuat) tanpa menghadang pengunjung dengan Onboarding; memisahkan alur hafalan dan streak ke `/hafalan` serta latihan ke `/hafalan/latihan` (diakses dari dalam menu Hafalan, dengan redirect otomatis dari `/latihan`); menyederhanakan navigasi menjadi 3 menu utama dengan *floating iOS glass bottom dock* di mobile; menambahkan **99 halaman detail statis** (`/nama/:slug`) dengan URL nyata (`react-router`); menambahkan paket ikon *Rub el Hizb* & `site.webmanifest`; serta menambahkan **pre-rendering statis (SSG) di Vite**, metadata SEO, JSON-LD, `sitemap.xml`, `robots.txt`, dan konfigurasi domain via `VITE_SITE_URL`.

## 1. Ringkasan

Web app publik dan offline-first untuk membaca, memahami, dan menghafal **99 Asmaul Husna**. Pengunjung yang datang dari mesin pencari langsung disambut **Direktori 99 Asmaul Husna** di halaman utama (`/`) yang bersih, cepat, dan bebas iklan, lengkap dengan pencarian instan, tulisan Arab berharakat, transliterasi Latin, arti bahasa Indonesia, tombol salin, serta 99 halaman detail berreferensi (`/nama/:slug`).

Pengunjung yang ingin melangkah dari sekadar membaca menjadi menghafal diarahkan ke fitur **Hafalan & Latihan** (`/hafalan` dan `/hafalan/latihan`). Di dalam fitur hafalan, pengguna berlatih lewat metode *drilling* (mencocokkan tulisan Arab dengan artinya) dengan sistem **poin hafalan 0–100**, pilihan mode **Bertahap** (per 15 nama, ambang buka tahap rata-rata `>= 80`) atau **Acak** (langsung 99 nama), serta pelacakan **streak harian**.

## 2. Masalah

- Banyak orang mencari arti Asmaul Husna di Google, namun hasil pencarian didominasi situs berita penuh iklan, lambat, dan hanya menyajikan teks pasif.
- Banyak orang menghafal 99 nama sebagai deretan bunyi tanpa memahami maknanya.
- Membaca berulang kurang efektif dibanding menguji diri, dan pengguna sulit tahu nama mana yang masih lemah.
- 99 nama sekaligus terasa berat bagi pemula; latihan perlu bertahap, singkat, dan jelas progresnya—namun tetap fleksibel bagi pengguna yang sudah pernah hafal dan ingin langsung mengulang secara acak.
- Menghadang pengunjung pertama dengan formulir Onboarding menghambat keterbukaan akses sekaligus mencegah konten 99 nama terindeks dengan baik oleh mesin pencari.

## 3. Tujuan dan Bukan Tujuan

### Tujuan

1. **Mudah ditemukan & langsung bermanfaat:** Halaman utama (`/`) dan 99 halaman detail (`/nama/:slug`) terindeks penuh oleh mesin pencari (HTML statis hasil *pre-rendering*) sehingga siapa pun yang mencari Asmaul Husna atau arti nama tertentu langsung mendapatkan referensi yang bersih dan akurat.
2. **Funnel alami ke hafalan:** Pengunjung yang awalnya hanya mencari arti dapat berpindah dengan mudah ke fitur hafalan lewat navigasi utama, sidebar, maupun CTA di halaman detail nama.
3. **Satu sesi latihan (drilling) singkat:** 5 pertanyaan, 15 nama.
4. **Progres hafalan transparan:** Pengguna selalu tahu nama mana yang kuat dan lemah lewat poin 0–100 dan status warna.
5. **Belajar sesuai kesiapan:** Mode **Bertahap** (15 nama dikuasai bertahap) atau **Acak** (langsung seluruh 99 nama).
6. **Konsistensi harian:** Pengguna terdorong rutin lewat streak harian yang terlihat per hari dalam seminggu.
7. **Pemahaman bermakna:** Pengguna dapat memahami makna setiap nama lewat penjelasan berreferensi sahih di halaman detail.

### Bukan Tujuan (versi ini)

- Akun, sinkronisasi antar perangkat, dan pengingat.
- Audio, irama, jadwal ulangan otomatis berbasis waktu, dan format tes lain.
- Papan peringkat publik atau fitur kompetisi.
- Tafsir mendalam dan fatwa.
- Migrasi ke framework SSR penuh (tetap menggunakan Vite dengan *static pre-rendering*).

## 4. Target Pengguna

1. **Pengunjung publik / pencari arti:** Masyarakat umum, pelajar, mahasiswa, orang tua, dan guru yang mencari daftar 99 Asmaul Husna atau arti nama tertentu melalui mesin pencari.
2. **Pembelajar hafalan:** Pembelajar dewasa yang ingin menghafal 99 Asmaul Husna lewat latihan singkat harian, termasuk yang sudah pernah hafal dan ingin menyegarkan ingatan. Orang tua juga dapat memakainya bersama anak, tetapi mode khusus anak tidak termasuk versi ini.

## 5. Struktur Halaman, URL, dan Alur

| URL | Halaman | Isi Utama | Perilaku Akses |
| --- | --- | --- | --- |
| `/` | **Direktori 99 Asmaul Husna** *(Beranda Publik)* | Pencarian instan, daftar lengkap 99 nama (Arab, Latin, arti, salin teks), catatan riwayat, FAQ singkat, dan footer kredit | Terbuka langsung untuk semua pengunjung tanpa onboarding |
| `/nama/:slug` | **Detail Nama** *(99 halaman statis, mis. `/nama/ar-rahman`)* | Arab berharakat, Latin, arti, tombol salin, penjelasan makna, daftar referensi, navigasi nama sebelumnya/berikutnya, CTA latihan | Terbuka langsung untuk publik; indikator poin & status tahap hanya tampil jika pengguna sudah memulai hafalan |
| `/hafalan` | **Dashboard Progres & Streak** | Sapaan, streak mingguan, modal kalender streak, recap 4 status, target hari, pintu masuk ke halaman Latihan | Jika belum onboarding, tampilkan layar **Onboarding** terlebih dahulu (dengan tombol kembali ke `/`) |
| `/hafalan/latihan` | **Halaman Latihan (Drilling)** | Ringkasan progres (sesuai mode aktif), tombol mulai latihan, sesi 5 pertanyaan, summary, grid 99 nama | Diakses dari menu Hafalan (atau CTA); jika belum onboarding, tampilkan **Onboarding** lalu arahkan langsung ke `/hafalan/latihan`. Jalur `/latihan` otomatis diarahkan (*redirect*) ke `/hafalan/latihan` |
| `/pengaturan` | **Pengaturan** | Tema (Terang/Gelap/Sistem); serta ganti nama, mode hafalan, target hari, reset progress, versi, dan kredit pembuat (opsi hafalan tampil bila sudah onboarding) | Terbuka untuk semua; pengunjung publik tetap bisa mengganti tema |

**Alur pengguna:**
- **Pencari arti dari Google:** `/` atau `/nama/:slug` $\rightarrow$ membaca/mencari arti $\rightarrow$ *(opsional)* membuka menu **Hafalan** atau klik CTA latihan $\rightarrow$ Onboarding singkat $\rightarrow$ `/hafalan` atau `/hafalan/latihan`.
- **Pengguna rutin hafalan:** Membuka `/hafalan` $\rightarrow$ klik recap atau tombol **Buka Halaman Latihan** $\rightarrow$ `/hafalan/latihan` $\rightarrow$ tombol **Mulai Latihan** $\rightarrow$ 5 pertanyaan $\rightarrow$ Summary $\rightarrow$ kembali ke halaman Latihan.

## 6. Metode Drilling (Inti Fitur Hafalan)

### 6.1 Poin hafalan dan status

- Setiap nama punya poin 0–100, awalnya 0.
- Pasangan benar: **+20**. Pasangan salah: **-5**. Poin tidak pernah di bawah 0 atau di atas 100.
- Status per tingkat poin:

| Poin | Status | Penanda (selain warna) |
| --- | --- | --- |
| 0–19 | Belum hafal | Lingkaran kosong |
| 20–59 | Belajar | Lingkaran terisi sepertiga |
| 60–99 | Hampir hafal | Lingkaran terisi dua pertiga |
| 100 | Hafal | Lingkaran penuh dengan centang |

### 6.2 Satu pertanyaan dan satu sesi latihan (drilling)

- Satu pertanyaan menampilkan **6 kartu: 3 kartu Arab dan 3 kartu arti**, urutannya diacak.
- Pengguna **memasangkan tiap kartu Arab dengan arti yang sesuai**.
- Satu sesi latihan = **5 pertanyaan = 15 pasangan = 15 nama berbeda**.
- **Satu kesempatan per pasangan:** Jika benar, poin nama tersebut bertambah **+20**. Jika salah, poin nama pada kartu Arab yang dipilih berkurang **-5**, lalu pasangan arti yang benar langsung ditunjukkan sebelum lanjut.
- Poin disimpan setiap pasangan dijawab. Hari dihitung untuk streak bila satu sesi latihan (15 pasangan) diselesaikan.

### 6.3 Dua mode hafalan global

Mode hafalan diatur secara global (dipilih saat Onboarding dan dapat diubah kapan saja di halaman Pengaturan). Perubahan mode tidak menghapus poin nama maupun progres tahap yang sudah dicapai.

#### A. Mode Bertahap (`sequential`)

99 nama dibagi menjadi 7 tahap:

| Tahap | Nama (urutan daftar) | Jumlah nama |
| --- | --- | --- |
| 1 | 1–15 | 15 |
| 2 | 16–30 | 15 |
| 3 | 31–45 | 15 |
| 4 | 46–60 | 15 |
| 5 | 61–75 | 15 |
| 6 | 76–90 | 15 |
| 7 | 91–99 | 9 |

Aturan mode Bertahap:

1. **Status Grid 99 Nama (di halaman `/hafalan/latihan`):** Hanya Tahap 1 yang terbuka (*unlocked*) di awal. Nama pada tahap yang masih terkunci (*locked*) menampilkan ikon gembok di grid latihan, tetap dapat diklik untuk membaca halaman Detail Nama, tetapi tidak masuk ke sesi latihan. *(Catatan: di halaman direktori publik `/`, seluruh 99 nama selalu tampil terbuka tanpa gembok).*
2. **Pemilihan Soal:** Latihan mengambil **15 nama dari seluruh nama yang sudah terbuka (*unlocked*)** (Tahap 1 hingga tahap terbuka terbaru), diurutkan dari **poin terendah lebih dulu** (jika poin sama, dipilih acak). Nama dengan poin terlemah muncul di pertanyaan pertama.
   - *Saat masih Tahap 1:* 15 nama terbuka seluruhnya masuk ke sesi latihan.
   - *Saat Tahap 2+ terbuka:* 15 nama diambil dari gabungan tahap-tahap yang terbuka berdasarkan poin terendah, sehingga nama tahap lama yang poinnya belum 100 atau sempat turun ikut terlatih kembali.
3. **Syarat Buka Tahap Berikutnya:** Setelah tiap sesi latihan selesai, sistem menghitung **rata-rata poin dari 15 nama pada tahap terbuka terbaru** (khusus Tahap 7 dihitung dari 9 nama di Tahap 7). Bila rata-rata **`>= 80`**, tahap berikutnya terbuka (*unlock*). Bila kurang dari 80, tahap terbuka tidak bertambah.
4. Karena poin naik per `+20` dan dibatasi `100`, rata-rata `>= 80` minimal membutuhkan **4 sesi latihan sempurna** pada tahap tersebut.
5. Setelah Tahap 7 mencapai rata-rata `>= 80`, seluruh 99 nama telah terbuka dan latihan berikutnya otomatis mengambil 15 nama berpoin terendah dari seluruh 99 nama.
6. Ketika tahap baru terbuka, layar summary latihan menampilkan pemberitahuan, misalnya: *"Tahap 2 terbuka (Nama 16–30)"*.

#### B. Mode Acak (`random`)

1. **Status Grid 99 Nama:** Seluruh 99 nama langsung tampil terbuka (*unlocked*) tanpa ikon gembok.
2. **Pemilihan Soal:** Setiap sesi latihan mengambil **15 nama dari seluruh 99 nama** dengan prioritas **poin terendah lebih dulu** (nama dengan poin sama diacak di antara mereka).
3. **Pemisahan State:** Sistem tetap menyimpan nilai `unlockedStage` terakhir secara terpisah di latar belakang. Jika pengguna berpindah dari mode Bertahap ke Acak lalu kembali lagi ke Bertahap, tampilan gembok kembali mengikuti `unlockedStage`, sementara poin yang sudah didapat pada nama mana pun tetap tersimpan utuh.

### 6.4 Summary latihan

Setelah pertanyaan ke-5 selesai, tampil:
- **Poin bersih yang didapat** (total perubahan poin pada sesi tersebut, misal `+275` atau `+300`).
- **Akurasi** (persentase pasangan benar dari 15 pasangan).
- **Pemberitahuan tahap baru terbuka** (khusus mode Bertahap apabila ambang `>= 80` baru saja tercapai).
- Tombol **Kembali ke Halaman Latihan**.

### 6.5 Keselarasan dengan riset

| Temuan riset | Penerapan | Catatan |
| --- | --- | --- |
| Menguji diri lebih efektif daripada membaca ulang (*retrieval practice*) | Latihan mencocokkan tanpa melihat jawaban terlebih dahulu | Mencocokkan 3 pasangan adalah pengenalan (*recognition*), pasangan terakhir berpotensi ditebak lewat eliminasi (disederhanakan untuk v0.1) |
| Ulangi sampai berhasil (*successive relearning*) | Mode Bertahap mengulang hingga rata-rata tahap terbaru `>= 80`; Acak memprioritaskan poin terendah | — |
| Bertahap dan tidak melupakan materi lama | Tahap per 15 nama dengan *unlock*, namun soal diambil dari seluruh daftar yang sudah *unlocked* | Menjaga retensi tahap sebelumnya tanpa algoritma *spaced repetition* yang kompleks |
| Hafal dan paham (*ahsaha*) | Arti tampil di kartu latihan, penjelasan berreferensi tersedia di Detail Nama | Makna tidak diuji sebagai soal terpisah di v0.1 |
| *Spacing* berbasis waktu | Belum diterapkan sebagai jadwal otomatis | Data `lastPracticedAt` tetap disimpan sejak v0.1 untuk kesiapan v0.2 |
| Amal (menerapkan makna) | Belum ada | Masuk backlog (Bagian 11) |

## 7. Spesifikasi Halaman

### 7.1 Direktori Publik 99 Asmaul Husna (`/`)

- **Fokus Langsung ke Konten:** Tanpa header dekoratif maupun banner yang menunda bacaan; pengunjung langsung disambut kolom pencarian dan daftar lengkap 99 Asmaul Husna. Struktur semantik tetap menyertakan `<h1 class="sr-only">` (*"99 Asmaul Husna: Arab, Latin, dan Artinya"*) untuk aksesibilitas dan SEO.
- **Pencarian Instan:** Kolom pencarian cepat berdasarkan tulisan Latin (tahan tanda kutip/strip/diakritik), arti bahasa Indonesia, tulisan Arab, atau nomor urut (`1–99`), menampilkan jumlah hasil secara langsung (`aria-live="polite"`) dan tombol hapus pencarian.
- **Daftar 99 Nama Lengkap (`<ol>`):** Seluruh 99 nama langsung tampil di DOM/HTML (tanpa pagination atau gembok) agar nyaman dipindai pengunjung dan terindeks utuh oleh Google. Tiap kartu menampilkan:
  - Nomor urut (`1`–`99`), tulisan Arab berharakat (`Amiri`), transliterasi Latin, dan arti bahasa Indonesia.
  - Badge *Hafal* halus (kondisional, hanya bagi pengguna yang sudah menghafal nama tersebut hingga poin 100).
  - Tombol **Salin** cepat (menyalin format `Nomor. Arab — Latin: Arti` disertai notifikasi toast).
  - Tautan asli (`<a href="/nama/:slug">`) menuju halaman Detail Nama.
- **Catatan Transparansi & FAQ Singkat:** Menampilkan catatan riwayat `sourceNote` serta 4 pertanyaan umum dalam `<details>`/`<summary>` (*Apa itu Asmaul Husna?*, *Berapa jumlah Asmaul Husna?*, *Dari mana urutan 99 Asmaul Husna berasal?*, *Bagaimana cara menghafalnya?*) untuk memperkaya nilai edukatif dan mendukung *rich result* pencarian.
- **Footer Kredit:** Menampilkan teks *"Made with love and coffee by ipadillah"* dengan tautan eksternal ke `https://ipadillah.com`.

### 7.2 Detail Nama (`/nama/:slug`)

- URL berbasis slug deterministik dari nama Latin (misal `Ar-Rahman` $\rightarrow$ `/nama/ar-rahman`, `Al-Mu'min` $\rightarrow$ `/nama/al-mumin`).
- Header navigasi dengan tautan kembali kontekstual ke **Daftar 99 Nama** (`/`) atau **Halaman Latihan** (`/hafalan/latihan`), informasi urutan ke-N dari 99, serta tautan asli (`<a href>`) ke **Nama Sebelumnya** dan **Nama Berikutnya** untuk *internal linking* yang kuat.
- Kartu utama menampilkan tulisan Arab berharakat, `<h1>` Latin, arti bahasa Indonesia, dan tombol **Salin lafaz & arti**.
- **Konteks hafalan (kondisional):** Poin hafalan `0–100`, penanda status warna, serta keterangan tahap hanya tampil apabila pengguna sudah memulai hafalan (`onboardingCompleted`), sehingga pengunjung publik tidak bingung melihat angka `0/100` atau status terkunci.
- **Penjelasan arti** berdasarkan referensi yang sahih dan **Daftar referensi** lengkap.
- **Funnel CTA mini** di bagian bawah halaman: ajakan melatih hafalan nama ini menuju `/hafalan/latihan`.

### 7.3 Onboarding (Pintu Masuk Fitur Hafalan)

- Tidak menghadang saat membuka `/` pertama kali. Tampil ketika pengguna pertama kali mengakses `/hafalan` atau `/hafalan/latihan` sebelum `onboardingCompleted === true`.
- Menyediakan tautan kembali ke `/` (*"Kembali ke Daftar 99 Nama"*) bagi pengunjung yang hanya ingin melihat-lihat.
- Bagian atas: **Bismillah** dalam tulisan Arab berharakat (`بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`), dengan terjemahan di bawahnya.
- **Langkah 1 — Nama:** *"Siapa nama Anda?"* (kolom teks wajib diisi).
- **Langkah 2 — Mode Hafalan:** *"Pilih metode hafalan Anda"* dengan dua pilihan jelas:
  - **Bertahap (Rekomendasi pemula):** Belajar per 15 nama, tahap baru terbuka setelah rata-rata poin mencapai 80.
  - **Acak (Semua nama terbuka):** Cocok jika sudah pernah hafal dan ingin langsung melatih seluruh 99 nama.
  - *(Catatan kecil: Pilihan ini dapat diubah kapan saja di halaman Pengaturan).*
- **Langkah 3 — Target Hafalan:** *"Berapa hari target Anda menyelesaikan 99 nama?"* (pilihan cepat: **30 hari**, **60 hari**, **90 hari**, atau input **jumlah hari kustom**).
- Tombol **Mulai** menyimpan jawaban dan meneruskan pengguna ke halaman tujuan awalnya (`/hafalan` atau `/hafalan/latihan`). Onboarding tidak tampil lagi setelah selesai.

### 7.4 Dashboard Progres & Streak (`/hafalan`)

- Sapaan: **Assalamu'alaikum, [nama]**.
- **Streak mingguan:** Hitungan hari berturut-turut dengan minimal satu sesi latihan selesai, ditambah deretan tanggal satu minggu (Senin–Minggu) dengan penanda status tiap hari: *sudah latihan*, *belum latihan*, *hari ini*, atau *belum tiba*, serta modal kalender riwayat streak.
- **Recap:** Latihan terakhir (tanggal, poin didapat, akurasi), info mode/tahap aktif, jumlah nama per status (Belum hafal, Belajar, Hampir hafal, Hafal), total nama hafal dari 99, dan progres target waktu (hari ke-X dari target Y hari).
- Klik kartu recap atau tombol aksi utama membuka halaman **Latihan** (`/hafalan/latihan`).
- Ikon roda gigi di pojok atas (mobile) membuka halaman **Pengaturan** (`/pengaturan`).
- Kondisi awal (belum pernah latihan): recap menampilkan ajakan memulai sesi latihan pertama.

### 7.5 Halaman Latihan (`/hafalan/latihan`)

- **Ringkasan progres (dinamis sesuai mode aktif):**
  - *Jika mode Bertahap:* Menampilkan **Tahap N dari 7**, rata-rata poin pada tahap terbaru, dan target buka tahap berikutnya (`>= 80`).
  - *Jika mode Acak:* Menampilkan **Mode Acak (99 Nama Terbuka)** dan rata-rata poin keseluruhan dari 99 nama.
- Tombol utama **Mulai Latihan** yang langsung memulai sesi 5 pertanyaan sesuai mode aktif, diakhiri layar Summary.
- **Grid 99 nama:** Tiap sel menampilkan nomor urut, tulisan Arab, arti singkat, poin (0–100), dan ikon status. Pada mode Bertahap, nama di tahap yang belum terbuka menampilkan indikator gembok.
- Klik sel mana pun (baik terbuka maupun terkunci) membuka halaman **Detail Nama** (`/nama/:slug`).

### 7.6 Halaman Pengaturan (`/pengaturan`)

- **Tema:** Terang, Gelap, atau Ikuti Sistem *(tersedia untuk seluruh pengunjung, termasuk sebelum onboarding)*.
- **Opsi Hafalan *(tampil setelah onboarding)*:**
  - **Ganti nama:** Mengubah nama pengguna yang tampil di sapaan Dashboard.
  - **Metode hafalan:** Pilihan **Bertahap** atau **Acak** (mengubah tampilan grid 99 nama di `/hafalan/latihan` dan aturan pengambilan soal secara langsung tanpa menghapus poin).
  - **Target hafalan:** Mengubah jumlah target hari penyelesaian 99 nama (30, 60, 90 hari, atau kustom).
  - **Reset progress:** Menghapus seluruh poin nama (`0`), mengembalikan `unlockedStage` ke `1`, menghapus streak, dan menghapus riwayat latihan—disertai dialog konfirmasi dua langkah. Nama, mode hafalan, target hari, dan tema tetap dipertahankan, dan onboarding tidak diulang.
- **Versi & Kredit:** Menampilkan nomor versi dengan label tahap rilis (mis. `Versi 0.1.0 Beta`) serta kredit *"Made with love and coffee by ipadillah"* (`https://ipadillah.com`).

## 8. Data dan Konten

| Entitas | Atribut utama |
| --- | --- |
| `Name` | `id` (1–99), `slug` (diturunkan deterministik dari `latin`), `stage` (1–7), `arabic`, `latin`, `meaning`, `explanation`, `citations` |
| `Reference` | `id`, `title`, `authorOrSource`, `location` (ayat, bab, halaman), `url` (opsional), `note` (opsional) |
| `UserState` | `userName`, `learningMode` (`'sequential' \| 'random'`), `targetDays`, `startDate`, `onboardingCompleted`, `unlockedStage` (1–7), `points` (`1..99`), `lastPracticedAt` (`1..99`), `completedDates`, `lastDrillingSummary`, `theme` (`'light' \| 'dark' \| 'system'`) |

Data `Name` dan `Reference` berupa berkas statis (JSON). `UserState` disimpan secara lokal di perangkat (`localStorage`) tanpa memerlukan akun atau backend. Streak dan status kalender mingguan diturunkan dari `completedDates`.

**Prinsip konten yang tetap berlaku:**

- **Akurasi:** Nama, arti, penjelasan, dan referensi direview narasumber keilmuan sebelum rilis. Penjelasan arti hanya boleh berasal dari referensi yang ditampilkan di halaman yang sama. Tulisan Arab dan terjemahan Bismillah di onboarding juga ikut direview. Sumber rujukan utama antara lain Al-Qur'an, kitab tafsir mu'tabar, dan karya Al-Ghazali, *Al-Maqsad al-Asna fi Syarh Ma'ani Asma' Allah al-Husna*.
- **Transparansi daftar:** Daftar 99 nama yang dipakai berasal dari riwayat at-Tirmidzi yang populer di masyarakat. Ulama hadis menilai perincian nama dalam riwayat tersebut memiliki kelemahan dari sisi sanad, sementara riwayat Bukhari dan Muslim hanya menyebutkan jumlahnya (99). Catatan edukatif ini ditampilkan secara transparan di dalam aplikasi.
- **Nama Allah tidak terbatas 99** menurut pendapat mayoritas ulama Ahlus Sunnah.
- **Tanpa klaim pahala atau khasiat** khusus pada teks aplikasi.
- **Adab tampilan:** Nama Allah tidak dipakai sebagai hiasan latar atau efek permainan berlebihan, tidak ada papan peringkat publik, dan ikon website memakai geometri klasik *Rub el Hizb* (bukan lafaz Allah berukuran kecil).

## 9. Rekomendasi Teknis, SEO & Tata Letak Responsif

### 9.1 Arsitektur Vite + Routing + Static Pre-rendering (SSG) + Cloudflare Workers

- **Tetap menggunakan Vite + React + TypeScript + Tailwind CSS** tanpa berpindah framework.
- **Routing Nyata (`react-router`):** Menggantikan navigasi berbasis state agar setiap halaman memiliki URL yang dapat diindeks, di-bookmark, dan dibagikan (`/`, `/nama/:slug`, `/hafalan`, `/hafalan/latihan`, `/pengaturan`, plus redirect `/latihan` $\rightarrow$ `/hafalan/latihan`).
- **Build-time Static Pre-rendering (SSG):** Proses `npm run build` menjalankan tahap build client, build SSR ringan (`src/entry-server.tsx`), dan skrip pre-render (`scripts/prerender.mjs`) berbasis `react-dom/server` (`renderToString`) yang menghasilkan **103 berkas HTML statis utuh**:
  - `dist/index.html` (seluruh 99 nama & FAQ sudah ter-render di HTML awal)
  - `dist/nama/<slug>/index.html` (99 berkas HTML statis)
  - `dist/hafalan/index.html`, `dist/hafalan/latihan/index.html`, `dist/pengaturan/index.html`
- **Deployment & Domain Aktif:** Di-deploy ke **Cloudflare Workers Static Assets** (`wrangler.jsonc` mengarah ke `./dist` dengan `not_found_handling: "single-page-application"`) pada domain aktif **`https://asmaulhusna.ipadillah.com`** melalui `VITE_SITE_URL` (dapat dipindahkan ke domain khusus kapan saja cukup dengan mengubah `VITE_SITE_URL` dan rebuild).
- **Artefak SEO & Ikon Web Otomatis:**
  - `dist/sitemap.xml` berisi 101 URL publik (`/` + `/hafalan/latihan` + 99 `/nama/:slug`).
  - `dist/robots.txt` mengizinkan perayapan halaman publik (`Allow: /`, `Disallow: /pengaturan`) dan menautkan `Sitemap`.
  - **Metadata unik per halaman:** `<title>`, `<meta name="description">`, `<meta name="robots">`, `<link rel="canonical">`, dan Open Graph / Twitter Card (`og:title`, `og:description`, `og:type`, `og:url`, `og:locale="id_ID"`).
  - **Structured Data (JSON-LD):** `ItemList` + `FAQPage` di `/`, `BreadcrumbList` + `DefinedTerm` di setiap `/nama/:slug`, dan `WebApplication` di `/hafalan/latihan`.
  - **Favicon & PWA Manifest:** Paket ikon geometri *Rub el Hizb* (`favicon.svg`, `favicon-48x48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) dan `site.webmanifest`.
- **Hydration Aman untuk Offline-First:** State dari `localStorage` (Zustand `persist` dengan `skipHydration: true`) dihidrasi di sisi klien setelah *mount* tanpa menyebabkan *hydration mismatch* dengan HTML statis hasil pre-render.

### 9.2 Tata Letak Responsif Mobile-First & Desktop (`>= 1024px`)

- **Mobile (`< 1024px`):**
  - Satu kolom ringkas berfokus pada sentuhan (target sentuh minimal `44×44px`).
  - **Floating Glass Bottom Navigation (`MobileBottomNav.tsx`):** Dock mengambang di bagian bawah bergaya *iOS glass* (`rounded-2xl`, `backdrop-blur-xl`, `backdrop-saturate-180`, *specular rim*) dengan 3 menu utama (**99 Nama**, **Hafalan**, **Pengaturan**); disembunyikan otomatis saat sesi latihan aktif atau layar onboarding.
  - Seluruh popup modal (`StreakCalendarModal`, `ConfirmModal`) dirender menggunakan `createPortal(..., document.body)` agar selalu berada di lapisan paling atas melampaui `MobileBottomNav`, dan notifikasi `Toast` diposisikan di atas dock (`bottom-24 lg:bottom-6`).
- **Desktop (`>= 1024px`):**
  - **Navigasi Sidebar Tetap (`DesktopSidebar.tsx`):** Menampilkan judul ringkas **99 Asmaul Husna**, 3 menu navigasi utama (**99 Asmaul Husna**, **Progres & Streak**, **Pengaturan** — rute `/hafalan/latihan` otomatis menyorot menu Progres & Streak), ringkasan cepat streak & jumlah nama hafal (atau kartu ajakan *Mulai Catat Hafalan* bagi pengunjung baru), info versi, serta kredit *"Made with love and coffee by ipadillah"*. Sidebar disembunyikan otomatis saat sesi latihan aktif agar pengguna tetap fokus.
  - **Direktori 99 Nama (`/`):** Grid responsif 3 kolom dengan kolom pencarian sejajar di atas, nyaman dibaca tanpa gulir berlebihan.
  - **Onboarding:** Tata letak dua kolom — panel kiri menampilkan Bismillah dan ringkasan alur latihan, panel kanan menampilkan formulir 3 langkah.
  - **Dashboard (`/hafalan`):** Tata letak dua kolom — kolom utama untuk recap progres & 4 status, kolom samping untuk streak mingguan & target hari.
  - **Latihan (`/hafalan/latihan`):** Ringkasan progres melebar dengan tombol *Mulai Latihan* sejajar, filter tahap opsional, dan grid 99 nama hingga 5 kolom. Saat sesi aktif, 3 kartu Arab dan 3 kartu arti ditampilkan berdampingan (kiri–kanan) pada layar fokus di tengah.
  - **Detail Nama (`/nama/:slug`):** Tata letak editorial dua kolom — kartu utama lafaz Arab tetap di kiri, penjelasan makna dan referensi di kanan dengan panjang baris yang nyaman dibaca.
  - **Pengaturan (`/pengaturan`):** Tata letak dua kolom terstruktur sehingga seluruh opsi terlihat ringkas.
- Logika inti (pemilihan 15 soal untuk mode Bertahap maupun Acak, kalkulasi poin `+20`/`-5` dengan batas `0..100`, pengecekan rata-rata tahap `>= 80`, kalkulasi streak, pembuatan slug 99 nama yang unik, serta generator metadata SEO) dipisahkan sebagai **modul murni (*pure functions*)** yang dilindungi dengan *unit test* komprehensif (`vitest`, 165 test).
- Tema mengikuti CSS media query `prefers-color-scheme` bila opsi *Ikuti Sistem* dipilih.

## 10. Metrik Keberhasilan

| Metrik | Target awal |
| --- | --- |
| Halaman terindeks di Google Search Console (`/` + `/hafalan/latihan` + 99 `/nama/:slug`) | 100% (101 halaman publik) |
| Skor Lighthouse (Performance, Accessibility, Best Practices, SEO) | `>= 95` di semua kategori |
| Pengunjung `/` yang mengklik funnel menuju `/hafalan` atau `/hafalan/latihan` | 15% |
| Pengguna yang memulai onboarding menyelesaikan onboarding | 90% |
| Pengguna baru menyelesaikan sesi latihan pertama | 80% |
| Retensi hari ke-7 (pengguna fitur hafalan) | 40% |
| Sesi latihan selesai per pengguna aktif per minggu | 3 |
| Pengguna mode Bertahap membuka Tahap 2 dalam 14 hari | 50% |

## 11. Di Luar Cakupan Versi Ini (Backlog)

- Kartu arti pengecoh (4 kartu arti untuk 3 kartu Arab) atau format tes lain untuk mencegah tebakan eliminasi pada kartu ke-3.
- Pembelajaran tiga lapis (lafaz, makna, amal) dan jurnal amal.
- Audio pelafalan dan mode irama.
- Fitur ekspor/cetak poster PDF 99 Asmaul Husna dan generator kartu share gambar untuk WhatsApp/media sosial.
- Jadwal ulangan berbasis waktu (*spaced repetition* / sistem kotak Leitner).
- Pengingat harian, akun, dan sinkronisasi lintas perangkat.
- Mode keluarga, uji penempatan (*placement test*), dan fitur lapor koreksi konten.

## 12. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Kesalahan arti, referensi, atau harakat tulisan Arab | Review wajib oleh narasumber keilmuan sebelum rilis |
| *Hydration mismatch* antara HTML statis SSG dan data `localStorage` | Render state default yang aman di server, lalu sinkronkan data lokal setelah *mount* di klien (`skipHydration: true`) |
| Persaingan ketat pada keyword generik `"Asmaul husna"` | Fokus pada 99 halaman detail *long-tail* (`/nama/:slug`), kecepatan muat tinggi, struktur HTML/JSON-LD bersih, dan diferensiasi alat latihan interaktif |
| Pasangan ke-3 pada satu pertanyaan mudah ditebak lewat eliminasi | Diterima sebagai penyederhanaan versi awal; kartu pengecoh masuk prioritas versi berikutnya |
| Pengguna bingung saat mengganti mode di Pengaturan | Beri keterangan jelas di Pengaturan bahwa perpindahan mode tidak menghapus poin hafalan |
| Pengguna terjebak lama di satu tahap pada mode Bertahap | Ambang `>= 80` (4 sesi sempurna) dan rata-rata saat ini ditampilkan transparan di header Latihan |
| Reset progress tidak sengaja tertekan | Dialog konfirmasi dua langkah dengan teks peringatan yang jelas |
| Streak menimbulkan rasa tertekan jika terlewat | Gunakan bahasa yang lembut dan suportif; hari yang terlewat hanya mereset hitungan streak tanpa mengurangi poin hafalan |

## 13. Tahapan Kerja

1. **Finalisasi Konten & Slug (Selesai):** Validasi 99 nama, arti, penjelasan, referensi, dan keunikan 99 slug URL dalam unit test.
2. **Arsitektur Routing & Halaman Publik (Selesai):** Pemasangan `react-router`, pembuatan halaman Direktori Publik (`/`), penyesuaian halaman Detail Nama (`/nama/:slug`), pemisahan funnel ke `/hafalan` dan `/hafalan/latihan`, serta penyederhanaan navigasi 3 menu (Desktop Sidebar & Mobile floating iOS glass dock).
3. **Pre-rendering SSG, Ikon & SEO Vite (Selesai):** Penyiapan entry SSR, skrip pre-render saat build untuk 103 rute, injeksi metadata & JSON-LD per halaman, generator `sitemap.xml` dan `robots.txt` berbasis `VITE_SITE_URL`, serta paket ikon *Rub el Hizb* & `site.webmanifest`.
4. **Verifikasi & Uji Kualitas (Selesai):** Pengujian unit test (`vitest` — 165 test lulus), verifikasi HTML statis hasil build, perbaikan layer modal (`createPortal`) dan posisi toast di mobile.
5. **Rilis & Indeksasi (Live):** Deploy ke Cloudflare Workers Static Assets (`wrangler.jsonc`) di `https://asmaulhusna.ipadillah.com`; langkah selanjutnya submit `sitemap.xml` ke Google Search Console dan pantau indeksasi.

## 14. Catatan Keputusan Produk (Terkunci untuk v0.5)

- **Halaman utama publik (`/`):** Langsung menampilkan pencarian instan dan daftar lengkap 99 Asmaul Husna (Arab, Latin, arti) tanpa menghadang dengan Onboarding atau banner panjang.
- **Struktur URL & 3 Menu Utama:** Menggunakan `/`, `/nama/:slug`, `/hafalan`, `/hafalan/latihan` (diakses dari dalam Hafalan, bukan menu terpisah di navigasi; `/latihan` diarahkan otomatis ke `/hafalan/latihan`), dan `/pengaturan`.
- **Navigasi & Modal Mobile:** Floating bottom navigation bergaya *iOS glass* dengan 3 menu, dan seluruh modal dirender melalui `createPortal` di atas navigasi bawah.
- **Teknologi & Hosting:** Mempertahankan Vite + React + Tailwind dengan `react-router`, *static pre-rendering* saat build, dan deploy ke Cloudflare Workers Static Assets (`wrangler.jsonc`).
- **Domain Aktif & Fleksibel:** Live di `https://asmaulhusna.ipadillah.com` melalui `VITE_SITE_URL` (mudah dipindahkan ke domain baru kapan saja).
- **Identitas & Kredit:** Ikon website menggunakan geometri *Rub el Hizb* hijau zamrud, dan kredit *"Made with love and coffee by ipadillah"* tertaut ke `https://ipadillah.com`.
- **Target hafalan:** Menggunakan satuan jumlah hari (30/60/90/kustom) di Onboarding dan dapat diubah di Pengaturan.
- **Kesempatan menjawab:** Satu kesempatan per pasangan (`+20` benar / `-5` salah), langsung menampilkan jawaban benar saat salah.
- **Jumlah kartu per pertanyaan:** 3 kartu Arab dan 3 kartu arti.
- **Ambang buka tahap:** Rata-rata poin tahap terbaru `>= 80` (minimal 4 sesi sempurna).
- **Cakupan soal mode Bertahap:** Diambil dari seluruh daftar nama yang sudah terbuka (*unlocked*) dengan prioritas poin terendah.
- **Mode hafalan global:** Dipilih saat Onboarding dan dapat diubah kapan saja di Pengaturan; state `unlockedStage` dan `points` disimpan terpisah.
- **Kalender streak mingguan:** Menampilkan rentang Senin hingga Minggu pada pekan berjalan.
- **Reset progress:** Hanya mereset poin, `unlockedStage`, streak, dan riwayat latihan; nama, mode hafalan, target hari, tema, dan status onboarding tetap tersimpan.

## 15. Sumber Riset

- Bukhari no. 2736 dan Muslim no. 2677 (hadis 99 nama)
- Ibnu Utsaimin, *Majmu' Fatawa wa Rasa'il*, 1/74 dan 1/122; An-Nawawi, *Syarah Shahih Muslim* (makna *ahsaha*)
- *Journal of Hadith Studies* USIM (2021): Penilaian semula Asmaul Husna menurut Ibn Hajar
- Jurnal dan skripsi metode hafalan: UMJ (Metode 2-2), UIN Banten, UMY (TAKKA), UIN SGD Bandung (Hanifida), IAIN Gorontalo (Al-Mihnah, 2024)
- *Nature Reviews Psychology* (2022): *The science of effective learning with spacing and retrieval practice*; Dunlosky dkk.: *Successive relearning*
