# PRD: Web App Hafalan Asmaul Husna

**Status:** Draft v0.4 (diperbarui: dukungan tata letak responsif Mobile & Desktop) | **Perubahan dari v0.3:** Memindahkan pilihan metode hafalan (`Bertahap` vs `Acak`) menjadi konfigurasi global di Onboarding dan Setting (memengaruhi status *lock/unlock* pada grid 99 nama); memperbarui cakupan soal mode Bertahap agar mengambil dari seluruh nama yang sudah terbuka (*unlocked*); mengubah ambang buka tahap menjadi `>= 80`; menambahkan opsi ubah target hari di halaman Setting; serta menetapkan tata letak responsif untuk perangkat mobile dan desktop.

## 1. Ringkasan

Web app sederhana untuk melatih hafalan 99 Asmaul Husna lewat drilling: pengguna mencocokkan tulisan Arab dengan artinya. Setiap nama punya **poin hafalan 0–100**. Pengguna memilih metode hafalan secara global saat Onboarding (dan dapat diubah kapan saja di Setting): **Bertahap** (nama dibuka per 15, tahap berikutnya terbuka setelah rata-rata poin tahap terbaru mencapai `>= 80`, dan soal diambil dari seluruh nama yang sudah terbuka) atau **Acak** (seluruh 99 nama langsung terbuka dan soal diacak dari seluruh 99 nama berdasarkan poin terendah). Aplikasi memiliki lima halaman: Onboarding, Dashboard, Drilling, Detail Nama, dan Setting.

## 2. Masalah

- Banyak orang menghafal 99 nama sebagai deretan bunyi tanpa memahami maknanya.
- Membaca berulang kurang efektif dibanding menguji diri, dan pengguna sulit tahu nama mana yang masih lemah.
- 99 nama sekaligus terasa berat bagi pemula; latihan perlu bertahap, singkat, dan jelas progresnya—namun tetap fleksibel bagi pengguna yang sudah pernah hafal dan ingin langsung mengulang secara acak.

## 3. Tujuan dan Bukan Tujuan

### Tujuan

1. Satu sesi drilling singkat: 5 pertanyaan, 15 nama.
2. Pengguna selalu tahu nama mana yang kuat dan lemah lewat poin 0–100 dan status warna.
3. Pengguna dapat belajar sesuai kesiapannya lewat mode **Bertahap** (15 nama dikuasai bertahap) atau **Acak** (langsung seluruh 99 nama).
4. Pengguna terdorong rutin lewat streak harian yang terlihat per hari dalam seminggu.
5. Pengguna dapat memahami makna setiap nama lewat penjelasan berreferensi di halaman detail.

### Bukan Tujuan (versi ini)

- Akun, sinkronisasi antar perangkat, dan pengingat.
- Audio, irama, jadwal ulangan otomatis berbasis waktu, dan format tes lain.
- Papan peringkat publik atau fitur kompetisi.
- Tafsir mendalam dan fatwa.

## 4. Target Pengguna

Pembelajar dewasa yang ingin menghafal 99 Asmaul Husna lewat latihan singkat harian, termasuk yang sudah pernah hafal dan ingin menyegarkan ingatan. Orang tua juga dapat memakainya bersama anak, tetapi mode khusus anak tidak termasuk versi ini.

## 5. Struktur Halaman dan Alur

| Halaman | Isi | Dicapai dari |
| --- | --- | --- |
| Onboarding | Bismillah (Arab & arti), input nama, pilih mode hafalan (`Bertahap`/`Acak`), dan target hari | Pembukaan pertama aplikasi |
| Dashboard (beranda) | Sapaan, streak mingguan, recap drilling dan status | Setelah onboarding; halaman awal berikutnya |
| Drilling | Ringkasan progres (sesuai mode aktif), tombol mulai drilling, 5 pertanyaan, summary, grid 99 nama | Klik recap atau status di Dashboard |
| Detail Nama | Arab, arti, poin dan status, penjelasan, referensi | Klik sel di grid Drilling |
| Setting | Ganti nama, ubah mode hafalan, ubah target hari, tema, reset progress, versi | Ikon di Dashboard |

**Alur pengguna:**
- **Pertama kali:** Onboarding $\rightarrow$ Dashboard.
- **Latihan:** Dashboard $\rightarrow$ klik recap atau status $\rightarrow$ halaman Drilling $\rightarrow$ tombol **Mulai Drilling** $\rightarrow$ 5 pertanyaan $\rightarrow$ Summary $\rightarrow$ tombol kembali ke halaman Drilling.

## 6. Metode Drilling (Inti Produk)

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

### 6.2 Satu pertanyaan dan satu drilling

- Satu pertanyaan menampilkan **6 kartu: 3 kartu Arab dan 3 kartu arti**, urutannya diacak.
- Pengguna **memasangkan tiap kartu Arab dengan arti yang sesuai**.
- Satu drilling = **5 pertanyaan = 15 pasangan = 15 nama berbeda**.
- **Satu kesempatan per pasangan:** Jika benar, poin nama tersebut bertambah **+20**. Jika salah, poin nama pada kartu Arab yang dipilih berkurang **-5**, lalu pasangan arti yang benar langsung ditunjukkan sebelum lanjut.
- Poin disimpan setiap pasangan dijawab. Hari dihitung untuk streak bila satu sesi drilling (15 pasangan) diselesaikan.

### 6.3 Dua mode hafalan global

Mode hafalan diatur secara global (dipilih saat Onboarding dan dapat diubah kapan saja di halaman Setting). Perubahan mode tidak menghapus poin nama maupun progres tahap yang sudah dicapai.

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

1. **Status Grid 99 Nama:** Hanya Tahap 1 yang terbuka (*unlocked*) di awal. Nama pada tahap yang masih terkunci (*locked*) menampilkan ikon gembok di grid, tetap dapat diklik untuk membaca halaman Detail Nama, tetapi tidak masuk ke sesi drilling.
2. **Pemilihan Soal:** Drilling mengambil **15 nama dari seluruh nama yang sudah terbuka (*unlocked*)** (Tahap 1 hingga tahap terbuka terbaru), diurutkan dari **poin terendah lebih dulu** (jika poin sama, dipilih acak). Nama dengan poin terlemah muncul di pertanyaan pertama.
   - *Saat masih Tahap 1:* 15 nama terbuka seluruhnya masuk ke sesi latihan.
   - *Saat Tahap 2+ terbuka:* 15 nama diambil dari gabungan tahap-tahap yang terbuka berdasarkan poin terendah, sehingga nama tahap lama yang poinnya belum 100 atau sempat turun ikut terlatih kembali.
3. **Syarat Buka Tahap Berikutnya:** Setelah tiap drilling selesai, sistem menghitung **rata-rata poin dari 15 nama pada tahap terbuka terbaru** (khusus Tahap 7 dihitung dari 9 nama di Tahap 7). Bila rata-rata **`>= 80`**, tahap berikutnya terbuka (*unlock*). Bila kurang dari 80, tahap terbuka tidak bertambah.
4. Karena poin naik per `+20` dan dibatasi `100`, rata-rata `>= 80` minimal membutuhkan **4 sesi drilling sempurna** pada tahap tersebut.
5. Setelah Tahap 7 mencapai rata-rata `>= 80`, seluruh 99 nama telah terbuka dan drilling berikutnya otomatis mengambil 15 nama berpoin terendah dari seluruh 99 nama.
6. Ketika tahap baru terbuka, layar summary drilling menampilkan pemberitahuan, misalnya: *"Tahap 2 terbuka (Nama 16–30)"*.

#### B. Mode Acak (`random`)

1. **Status Grid 99 Nama:** Seluruh 99 nama langsung tampil terbuka (*unlocked*) tanpa ikon gembok.
2. **Pemilihan Soal:** Setiap sesi drilling mengambil **15 nama dari seluruh 99 nama** dengan prioritas **poin terendah lebih dulu** (nama dengan poin sama diacak di antara mereka).
3. **Pemisahan State:** Sistem tetap menyimpan nilai `unlockedStage` terakhir secara terpisah di latar belakang. Jika pengguna berpindah dari mode Bertahap ke Acak lalu kembali lagi ke Bertahap, tampilan gembok kembali mengikuti `unlockedStage`, sementara poin yang sudah didapat pada nama mana pun tetap tersimpan utuh.

### 6.4 Summary drilling

Setelah pertanyaan ke-5 selesai, tampil:
- **Poin bersih yang didapat** (total perubahan poin pada sesi tersebut, misal `+275` atau `+300`).
- **Akurasi** (persentase pasangan benar dari 15 pasangan).
- **Pemberitahuan tahap baru terbuka** (khusus mode Bertahap apabila ambang `>= 80` baru saja tercapai).
- Tombol **Kembali ke halaman Drilling**.

### 6.5 Keselarasan dengan riset

| Temuan riset | Penerapan | Catatan |
| --- | --- | --- |
| Menguji diri lebih efektif daripada membaca ulang (*retrieval practice*) | Drilling mencocokkan tanpa melihat jawaban terlebih dahulu | Mencocokkan 3 pasangan adalah pengenalan (*recognition*), pasangan terakhir berpotensi ditebak lewat eliminasi (disederhanakan untuk v0.1) |
| Ulangi sampai berhasil (*successive relearning*) | Mode Bertahap mengulang hingga rata-rata tahap terbaru `>= 80`; Acak memprioritaskan poin terendah | — |
| Bertahap dan tidak melupakan materi lama | Tahap per 15 nama dengan *unlock*, namun soal diambil dari seluruh daftar yang sudah *unlocked* | Menjaga retensi tahap sebelumnya tanpa algoritma *spaced repetition* yang kompleks |
| Hafal dan paham (*ahsaha*) | Arti tampil di kartu drilling, penjelasan berreferensi tersedia di Detail Nama | Makna tidak diuji sebagai soal terpisah di v0.1 |
| *Spacing* berbasis waktu | Belum diterapkan sebagai jadwal otomatis | Data `lastPracticedAt` tetap disimpan sejak v0.1 untuk kesiapan v0.2 |
| Amal (menerapkan makna) | Belum ada | Masuk backlog (Bagian 11) |

## 7. Spesifikasi Halaman

### 7.1 Onboarding

- Tampil hanya saat aplikasi pertama kali dibuka dan sebelum masuk Dashboard.
- Bagian atas: **Bismillah** dalam tulisan Arab berharakat (`بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`), dengan terjemahan di bawahnya.
- **Langkah 1 — Nama:** *"Siapa nama Anda?"* (kolom teks wajib diisi).
- **Langkah 2 — Mode Hafalan:** *"Pilih metode hafalan Anda"* dengan dua pilihan jelas:
  - **Bertahap (Rekomendasi pemula):** Belajar per 15 nama, tahap baru terbuka setelah rata-rata poin mencapai 80.
  - **Acak (Semua nama terbuka):** Cocok jika sudah pernah hafal dan ingin langsung melatih seluruh 99 nama.
  - *(Catatan kecil: Pilihan ini dapat diubah kapan saja di halaman Setting).*
- **Langkah 3 — Target Hafalan:** *"Berapa hari target Anda menyelesaikan 99 nama?"* (pilihan cepat: **30 hari**, **60 hari**, **90 hari**, atau input **jumlah hari kustom**).
- Tombol **Mulai** menyimpan jawaban dan membuka Dashboard. Onboarding tidak tampil lagi setelah selesai.

### 7.2 Dashboard (Beranda)

- Sapaan: **Assalamu'alaikum, [nama]**.
- **Streak mingguan:** Hitungan hari berturut-turut dengan minimal satu drilling selesai, ditambah deretan tanggal satu minggu (Senin–Minggu) dengan penanda status tiap hari: *sudah drilling*, *belum drilling*, *hari ini*, atau *belum tiba*.
- **Recap:** Drilling terakhir (tanggal, poin didapat, akurasi), info mode/tahap aktif, jumlah nama per status (Belum hafal, Belajar, Hampir hafal, Hafal), total nama hafal dari 99, dan progres target waktu (hari ke-X dari target Y hari).
- Klik kartu recap atau ringkasan status membuka halaman **Drilling**.
- Ikon roda gigi di pojok atas membuka halaman **Setting**.
- Kondisi awal (belum pernah drilling): recap menampilkan ajakan memulai sesi drilling pertama.

### 7.3 Halaman Drilling

- **Ringkasan progres (dinamis sesuai mode aktif):**
  - *Jika mode Bertahap:* Menampilkan **Tahap N dari 7**, rata-rata poin pada tahap terbaru, dan target buka tahap berikutnya (`>= 80`).
  - *Jika mode Acak:* Menampilkan **Mode Acak (99 Nama Terbuka)** dan rata-rata poin keseluruhan dari 99 nama.
- Tombol utama **Mulai Drilling** yang langsung memulai sesi 5 pertanyaan sesuai mode aktif, diakhiri layar Summary.
- **Grid 99 nama:** Tiap sel menampilkan nomor urut, tulisan Arab, arti singkat, poin (0–100), dan ikon status. Pada mode Bertahap, nama di tahap yang belum terbuka menampilkan indikator gembok.
- Klik sel mana pun (baik terbuka maupun terkunci) membuka halaman **Detail Nama**.

### 7.4 Halaman Detail Nama

- Tulisan Arab berharakat, transliterasi latin, dan arti.
- **Poin hafalan 0–100** beserta penanda status warna (dan keterangan tahap jika dalam mode Bertahap).
- **Penjelasan arti** nama berdasarkan referensi yang sahih.
- **Daftar referensi** lengkap yang menjadi rujukan penjelasan tersebut.

### 7.5 Halaman Setting

- **Ganti nama:** Mengubah nama pengguna yang tampil di sapaan Dashboard.
- **Metode hafalan:** Pilihan **Bertahap** atau **Acak** (mengubah tampilan grid 99 nama dan aturan pengambilan soal drilling secara langsung tanpa menghapus poin).
- **Target hafalan:** Mengubah jumlah target hari penyelesaian 99 nama (30, 60, 90 hari, atau kustom).
- **Tema:** Terang, Gelap, atau Ikuti Sistem.
- **Reset progress:** Menghapus seluruh poin nama (`0`), mengembalikan `unlockedStage` ke `1`, menghapus streak, dan menghapus riwayat drilling—disertai dialog konfirmasi. Nama, mode hafalan, target hari, dan tema tetap dipertahankan, dan onboarding tidak diulang.
- **Versi:** Menampilkan nomor versi dengan label tahap rilis, misalnya `Versi 0.1.0 Beta` (label mengikuti tahap Alpha, Beta, RC, dan tanpa label untuk rilis stabil).

## 8. Data dan Konten

| Entitas | Atribut utama |
| --- | --- |
| `Name` | `id` (1–99), `stage` (1–7), `arabic`, `latin`, `meaning`, `explanation`, `referenceIds` |
| `Reference` | `id`, `title`, `authorOrSource`, `location` (ayat, bab, halaman), `url` (opsional) |
| `UserState` | `userName`, `learningMode` (`'sequential' \| 'random'`), `targetDays`, `startDate`, `onboardingCompleted`, `unlockedStage` (1–7), `points` (`1..99`), `lastPracticedAt` (`1..99`), `completedDates`, `lastDrillingSummary`, `theme` (`'light' \| 'dark' \| 'system'`) |

Data `Name` dan `Reference` berupa berkas statis (JSON). `UserState` disimpan secara lokal di perangkat (`localStorage` / `IndexedDB`) tanpa memerlukan akun atau backend. Streak dan status kalender mingguan diturunkan dari `completedDates`.

**Prinsip konten yang tetap berlaku:**

- **Akurasi:** Nama, arti, penjelasan, dan referensi direview narasumber keilmuan sebelum rilis. Penjelasan arti hanya boleh berasal dari referensi yang ditampilkan di halaman yang sama. Tulisan Arab dan terjemahan Bismillah di onboarding juga ikut direview. Sumber rujukan utama antara lain Al-Qur'an, kitab tafsir mu'tabar, dan karya Al-Ghazali, *Al-Maqsad al-Asna fi Syarh Ma'ani Asma' Allah al-Husna*.
- **Transparansi daftar:** Daftar 99 nama yang dipakai berasal dari riwayat at-Tirmidzi yang populer di masyarakat. Ulama hadis menilai perincian nama dalam riwayat tersebut memiliki kelemahan dari sisi sanad, sementara riwayat Bukhari dan Muslim hanya menyebutkan jumlahnya (99). Catatan edukatif ini ditampilkan secara transparan di dalam aplikasi.
- **Nama Allah tidak terbatas 99** menurut pendapat mayoritas ulama Ahlus Sunnah.
- **Tanpa klaim pahala atau khasiat** khusus pada teks aplikasi.
- **Adab tampilan:** Nama Allah tidak dipakai sebagai hiasan latar atau efek permainan berlebihan, serta tidak ada papan peringkat publik.

## 9. Rekomendasi Teknis & Tata Letak Responsif

- **Responsif Mobile-First & Desktop (`>= 1024px`):**
  - **Mobile (`< 1024px`):** Satu kolom ringkas berfokus pada sentuhan (target sentuh minimal `44×44px`), navigasi atas dengan tombol kembali, dan grid 99 nama 3 kolom.
  - **Desktop (`>= 1024px`):**
    - **Navigasi Sidebar Tetap:** Menampilkan identitas aplikasi, navigasi utama (*Beranda*, *Drilling & 99 Nama*, *Pengaturan*), ringkasan cepat streak & jumlah nama hafal, serta info versi. Sidebar disembunyikan otomatis saat sesi drilling aktif agar pengguna tetap fokus.
    - **Onboarding:** Tata letak dua kolom — panel kiri menampilkan Bismillah dan ringkasan alur latihan, panel kanan menampilkan formulir 3 langkah.
    - **Dashboard:** Tata letak dua kolom — kolom utama untuk recap progres & 4 status, kolom samping untuk streak mingguan & target hari.
    - **Drilling:** Ringkasan progres melebar dengan tombol *Mulai Drilling* sejajar, filter tahap opsional, dan grid 99 nama hingga 5 kolom. Saat sesi aktif, 3 kartu Arab dan 3 kartu arti ditampilkan berdampingan (kiri–kanan) pada layar fokus di tengah.
    - **Detail Nama:** Tata letak editorial dua kolom — kartu utama lafaz Arab & status tetap di kiri, penjelasan makna dan referensi di kanan dengan panjang baris yang nyaman dibaca.
    - **Setting:** Tata letak dua kolom terstruktur sehingga seluruh opsi terlihat ringkas tanpa gulir berlebihan.
- Penyimpanan lokal di browser tanpa backend untuk v0.1.
- Logika inti (pemilihan 15 soal untuk mode Bertahap maupun Acak, kalkulasi poin `+20`/`-5` dengan batas `0..100`, pengecekan rata-rata tahap `>= 80`, dan kalkulasi streak) dipisahkan sebagai **modul murni (*pure functions*)** yang dilindungi dengan *unit test* komprehensif.
- Tema mengikuti CSS media query `prefers-color-scheme` bila opsi *Ikuti Sistem* dipilih.

## 10. Metrik Keberhasilan

| Metrik | Target awal |
| --- | --- |
| Pengguna baru menyelesaikan onboarding | 90% |
| Pengguna baru menyelesaikan drilling pertama | 80% |
| Retensi hari ke-7 | 40% |
| Drilling selesai per pengguna aktif per minggu | 3 |
| Pengguna mode Bertahap membuka Tahap 2 dalam 14 hari | 50% |

## 11. Di Luar Cakupan Versi Ini (Backlog)

- Kartu arti pengecoh (4 kartu arti untuk 3 kartu Arab) atau format tes lain untuk mencegah tebakan eliminasi pada kartu ke-3.
- Pembelajaran tiga lapis (lafaz, makna, amal) dan jurnal amal.
- Audio pelafalan dan mode irama.
- Jadwal ulangan berbasis waktu (*spaced repetition* / sistem kotak Leitner).
- Pengingat harian, akun, dan sinkronisasi lintas perangkat.
- Mode keluarga, uji penempatan (*placement test*), dan fitur lapor koreksi konten.

## 12. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Kesalahan arti, referensi, atau harakat tulisan Arab | Review wajib oleh narasumber keilmuan sebelum rilis |
| Pasangan ke-3 pada satu pertanyaan mudah ditebak lewat eliminasi | Diterima sebagai penyederhanaan v0.1; kartu pengecoh masuk prioritas v0.2 |
| Pengguna bingung saat mengganti mode di Setting | Beri keterangan jelas di Setting bahwa perpindahan mode tidak menghapus poin hafalan |
| Pengguna terjebak lama di satu tahap pada mode Bertahap | Ambang `>= 80` (4 sesi sempurna) dan rata-rata saat ini ditampilkan transparan di header Drilling |
| Reset progress tidak sengaja tertekan | Dialog konfirmasi dua langkah dengan teks peringatan yang jelas |
| Streak menimbulkan rasa tertekan jika terlewat | Gunakan bahasa yang lembut dan suportif; hari yang terlewat hanya mereset hitungan streak tanpa mengurangi poin hafalan |

## 13. Tahapan Kerja

1. **Finalisasi Konten:** Penyusunan 99 nama, arti, penjelasan, dan referensi dalam struktur JSON, lalu review narasumber.
2. **Arsitektur & Modul Inti:** Pembuatan skema data JSON dan pengembangan modul logika drilling beserta *unit test*.
3. **Implementasi UI (5 Halaman):** Onboarding, Dashboard, Drilling, Detail Nama, dan Setting dengan tema terang/gelap.
4. **Uji Coba Tertutup:** Pengujian dengan 5–10 pengguna awal untuk memvalidasi alur mode Bertahap/Acak dan metrik keterlibatan.
5. **Rilis Beta & Iterasi.**

## 14. Catatan Keputusan Produk (Terkunci untuk v0.1)

- **Target hafalan:** Menggunakan satuan jumlah hari (30/60/90/kustom) di Onboarding dan dapat diubah di Setting.
- **Kesempatan menjawab:** Satu kesempatan per pasangan (`+20` benar / `-5` salah), langsung menampilkan jawaban benar saat salah.
- **Jumlah kartu per pertanyaan:** 3 kartu Arab dan 3 kartu arti.
- **Ambang buka tahap:** Rata-rata poin tahap terbaru `>= 80` (minimal 4 sesi sempurna).
- **Cakupan soal mode Bertahap:** Diambil dari seluruh daftar nama yang sudah terbuka (*unlocked*) dengan prioritas poin terendah.
- **Mode hafalan global:** Dipilih saat Onboarding dan dapat diubah kapan saja di Setting; state `unlockedStage` dan `points` disimpan terpisah.
- **Kalender streak mingguan:** Menampilkan rentang Senin hingga Minggu pada pekan berjalan.
- **Reset progress:** Hanya mereset poin, `unlockedStage`, streak, dan riwayat drilling; nama, mode hafalan, target hari, tema, dan status onboarding tetap tersimpan.

## 15. Sumber Riset

- Bukhari no. 2736 dan Muslim no. 2677 (hadis 99 nama)
- Ibnu Utsaimin, *Majmu' Fatawa wa Rasa'il*, 1/74 dan 1/122; An-Nawawi, *Syarah Shahih Muslim* (makna *ahsaha*)
- *Journal of Hadith Studies* USIM (2021): Penilaian semula Asmaul Husna menurut Ibn Hajar
- Jurnal dan skripsi metode hafalan: UMJ (Metode 2-2), UIN Banten, UMY (TAKKA), UIN SGD Bandung (Hanifida), IAIN Gorontalo (Al-Mihnah, 2024)
- *Nature Reviews Psychology* (2022): *The science of effective learning with spacing and retrieval practice*; Dunlosky dkk.: *Successive relearning*