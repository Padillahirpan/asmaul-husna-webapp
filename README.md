# Web App Hafalan Asmaul Husna

Aplikasi web **offline-first** (tanpa backend dan tanpa akun) untuk melatih hafalan serta memahami makna **99 Asmaul Husna** melalui sesi *drilling* singkat harian. Dirancang dengan antarmuka yang tenang, hangat, responsif untuk **mobile** maupun **desktop**, serta mendukung mode **Terang**, **Gelap**, dan **Ikuti Sistem**.

**Versi saat ini:** `0.1.0 Beta`

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Cara Kerja Metode Drilling](#cara-kerja-metode-drilling)
- [Tech Stack](#tech-stack)
- [Memulai (Instalasi & Menjalankan)](#memulai-instalasi--menjalankan)
- [Perintah NPM yang Tersedia](#perintah-npm-yang-tersedia)
- [Struktur Folder & Arsitektur](#struktur-folder--arsitektur)
- [Kustomisasi Warna Utama](#kustomisasi-warna-utama)
- [Sumber Data & Prinsip Konten](#sumber-data--prinsip-konten)
- [Dokumen Terkait](#dokumen-terkait)

---

## Fitur Utama

1. **Onboarding Ringkas (3 Langkah)**
   - Menampilkan bacaan *Bismillah* beserta terjemahannya.
   - Input nama panggilan pengguna, pilihan metode hafalan (*Bertahap* atau *Acak*), dan target hari penyelesaian (`30`, `60`, `90` hari, atau jumlah kustom).
2. **Dashboard (Beranda)**
   - Sapaan personal dan ringkasan progres hafalan (jumlah nama yang sudah hafal dari 99, rata-rata poin, serta rincian 4 tingkat status).
   - **Streak Mingguan & Kalender Bulanan:** Menghitung hari latihan berturut-turut, menampilkan status hari Senin–Minggu pekan berjalan, serta tombol **Lihat detail** untuk membuka popup kalender bulanan lengkap dengan navigasi bulan sebelumnya/berikutnya (*Previous/Next*).
   - Ringkasan sesi drilling terakhir (tanggal, poin bersih, dan akurasi).
3. **Drilling & Grid 99 Nama**
   - Satu sesi terdiri dari **5 pertanyaan** (total **15 pasangan** nama unik).
   - Setiap pertanyaan menampilkan **3 kartu lafaz Arab** dan **3 kartu arti** yang diacak.
   - Umpan balik langsung: jawaban benar menambah `+20` poin; jawaban salah mengurangi `-5` poin dan langsung menampilkan arti yang benar sebelum lanjut.
   - Layar **Summary** di akhir sesi menampilkan poin bersih, akurasi, dan notifikasi apabila tahap baru terbuka.
   - Grid 99 nama dilengkapi filter per tahap (`Semua`, `1`–`7`), indikator poin, ikon status, dan indikator gembok (pada mode Bertahap).
4. **Detail Nama & Referensi**
   - Menampilkan lafaz Arab berharakat jelas, transliterasi Latin, arti bahasa Indonesia, poin & status hafalan, penjelasan makna, daftar rujukan keilmuan, serta tombol navigasi cepat ke nama sebelum/sesudahnya.
5. **Pengaturan (Settings)**
   - Ubah nama pengguna, ganti metode hafalan (*Bertahap* ↔ *Acak*) tanpa menghapus poin maupun progres tahap, ubah target hari, pilih tema (**Terang**, **Gelap**, atau **Sistem**), serta fitur **Reset Progress** dengan dialog konfirmasi dua langkah.
6. **Responsif Mobile & Desktop + Offline-Ready Fonts**
   - Tampilan mobile satu kolom dengan target sentuh minimal `44×44px`.
   - Tampilan desktop (`>= 1024px`) dilengkapi sidebar navigasi tetap (otomatis tersembunyi saat sesi drilling aktif agar fokus tetap terjaga) dan tata letak dua kolom di setiap halaman.
   - Font Latin (*Plus Jakarta Sans*) dan Arab (*Amiri*) dibundel secara lokal menggunakan `@fontsource` sehingga tetap tampil optimal tanpa koneksi internet.

---

## Cara Kerja Metode Drilling

### 1. Poin & Status Hafalan
Setiap nama memiliki poin hafalan dari **0** hingga **100** (nilai awal `0`):
- **Pasangan benar:** `+20` poin (maksimal `100`).
- **Pasangan salah:** `-5` poin (minimal `0`).
- Poin langsung disimpan setiap kali satu pasangan dijawab.

| Rentang Poin | Status | Penanda Visual |
| --- | --- | --- |
| `0–19` | **Belum hafal** | Lingkaran kosong |
| `20–59` | **Belajar** | Lingkaran terisi 1/3 |
| `60–99` | **Hampir hafal** | Lingkaran terisi 2/3 |
| `100` | **Hafal** | Lingkaran penuh dengan centang |

### 2. Dua Mode Hafalan Global
- **Mode Bertahap (`sequential`):**
  - 99 nama dibagi menjadi **7 tahap** (Tahap 1–6 masing-masing 15 nama, Tahap 7 berisi 9 nama).
  - Awalnya hanya Tahap 1 yang terbuka.
  - Sesi drilling mengambil **15 nama** dari seluruh tahap yang sudah terbuka (*unlocked*), diprioritaskan dari **poin terendah lebih dulu** (nama dengan poin sama diacak).
  - Setelah satu sesi selesai, jika rata-rata poin pada tahap terbaru (`unlockedStage`) mencapai **`>= 80`**, maka tahap berikutnya otomatis terbuka.
- **Mode Acak (`random`):**
  - Seluruh 99 nama langsung terbuka tanpa gembok.
  - Setiap sesi mengambil **15 nama** dari seluruh 99 nama dengan prioritas **poin terendah lebih dulu**.
- **Pemisahan State:** Nilai `unlockedStage` dan `points` disimpan terpisah sehingga berpindah mode di halaman Pengaturan tidak akan menghapus poin maupun merusak progres tahap.

---

## Tech Stack

- **Framework & Build Tool:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **State Management & Persistensi:** Zustand (`persist` middleware ke `localStorage`)
- **Ikon:** Lucide React
- **Tipografi Lokal:** `@fontsource/plus-jakarta-sans` & `@fontsource/amiri`
- **Unit Testing:** Vitest

---

## Memulai (Instalasi & Menjalankan)

### Prasyarat
- **Node.js** versi `20+` atau `22+` (disarankan LTS)
- **npm** (bawaan Node.js)

### Langkah Menjalankan Secara Lokal

1. **Masuk ke direktori proyek dan pasang dependensi:**
   ```bash
   npm install
   ```
2. **Jalankan server pengembangan (development):**
   ```bash
   npm run dev
   ```
   Buka URL lokal yang muncul di terminal (biasanya `http://localhost:5173`).
3. **Jalankan seluruh unit test untuk memastikan logika berjalan normal:**
   ```bash
   npm test
   ```

---

## Perintah NPM yang Tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Vite dengan HMR |
| `npm run build` | Melakukan typecheck TypeScript (`tsc -b`) lalu membuild aplikasi ke folder `dist/` |
| `npm run preview` | Menjalankan preview lokal dari hasil build produksi (`dist/`) |
| `npm run typecheck` | Memeriksa tipe TypeScript tanpa menghasilkan berkas keluaran |
| `npm test` | Menjalankan seluruh unit test satu kali menggunakan Vitest |
| `npm run test:watch` | Menjalankan Vitest dalam mode *watch* saat pengembangan |

---

## Struktur Folder & Arsitektur

Arsitektur proyek memisahkan **data statis**, **logika domain murni** (tanpa ketergantungan React/DOM), **state management**, dan **lapisan UI**:

```text
├── docs/
│   ├── PRD_v0.4.md                 # Spesifikasi produk lengkap (v0.4)
│   ├── tasks.md                    # Panduan tahapan pengerjaan proyek
│   └── asmaul-husna-app.html       # Prototipe referensi awal
├── src/
│   ├── types/
│   │   └── index.ts                # Definisi TypeScript (AsmaName, Reference, UserState, DrillingSession, dll.)
│   ├── data/
│   │   ├── references.json         # Daftar master referensi keilmuan (Al-Qur'an, Al-Ghazali, dll.)
│   │   ├── names.json              # Dataset lengkap 99 Asmaul Husna, arti, penjelasan, citations, sourceNote
│   │   └── index.ts                # Helper akses data bertipe & konstanta APP_VERSION
│   ├── domain/                     # Pure functions (bebas React/DOM, diuji penuh oleh Vitest)
│   │   ├── scoring.ts              # Aturan poin 0–100 (+20/-5) dan pemetaan 4 status
│   │   ├── stage.ts                # Pembagian 7 tahap, rata-rata tahap, syarat buka tahap >= 80
│   │   ├── streak.ts               # Kalkulasi streak harian, kalender Senin–Minggu, & kalender bulanan
│   │   ├── drilling.ts             # Pemilihan 15 nama prioritas poin terendah, sesi 5 soal, finalisasi
│   │   ├── userState.ts            # Reducer state murni (onboarding, ganti mode, reset, normalisasi)
│   │   ├── validation.ts           # Validasi integritas & keunikan skema dataset JSON
│   │   └── index.ts                # Barrel export modul domain
│   ├── store/
│   │   └── useUserStore.ts         # Zustand store + persist ke localStorage (key: asmaul-husna:user-state)
│   ├── hooks/
│   │   └── useThemeEffect.ts       # Sinkronisasi kelas `.dark` pada <html> dan <meta name="theme-color">
│   ├── components/
│   │   ├── ConfirmModal.tsx        # Dialog konfirmasi aksesibel (Esc, backdrop, auto-focus)
│   │   ├── DesktopSidebar.tsx      # Sidebar navigasi tetap untuk layar desktop (>= 1024px)
│   │   ├── StatusCircle.tsx        # Ikon SVG lingkaran progres 4 tingkat
│   │   ├── StreakCalendarModal.tsx # Popup kalender streak bulanan (navigasi bulan & legenda)
│   │   └── Toast.tsx               # Notifikasi ringan di bagian bawah layar
│   ├── pages/
│   │   ├── Onboarding.tsx          # Halaman 1: Bismillah, nama, metode hafalan, target hari
│   │   ├── Dashboard.tsx           # Halaman 2: Sapaan, streak mingguan, recap progres & 4 status
│   │   ├── Drilling.tsx            # Halaman 3: Progres mode aktif, sesi 5 pertanyaan, summary, grid 99 nama
│   │   ├── NameDetail.tsx          # Halaman 4: Detail Arab, Latin, arti, penjelasan, dan referensi
│   │   └── Settings.tsx            # Halaman 5: Ubah nama, mode, target hari, tema, reset, info versi
│   ├── __tests__/                  # Unit tests (Vitest)
│   │   ├── calendar.test.ts        # Uji kalender bulanan & perpindahan bulan
│   │   ├── data-integrity.test.ts  # Uji integritas berkas names.json & references.json asli
│   │   ├── drilling.test.ts        # Uji pemilihan soal, sesi, dan pergantian mode
│   │   ├── helpers.ts              # RNG deterministik & helper test
│   │   ├── scoring.test.ts         # Uji skor +20/-5, batas 0..100, dan status
│   │   ├── stage.test.ts           # Uji 7 tahap dan ambang buka tahap (>= 80 vs 79)
│   │   ├── streak.test.ts          # Uji streak harian & kalender Senin–Minggu
│   │   ├── userState.test.ts       # Uji normalisasi state rusak & reset progress
│   │   └── validation.test.ts      # Uji skema validasi JSON
│   ├── App.tsx                     # Root shell, routing halaman, & pengelola sidebar/toast
│   ├── index.css                   # Konfigurasi Tailwind v4, font, & variabel warna global
│   └── main.tsx                    # Entry point React
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── vite.config.ts
```

---

## Kustomisasi Warna Utama

Seluruh warna aksen aplikasi (tombol utama, progress bar, cincin fokus, kalender streak, badge aktif, dan indikator *Belajar*) dikendalikan dari **satu variabel CSS** di `src/index.css`:

```css
@theme {
  --color-primary: #e11d48;
}
```

Cukup ubah nilai hex `--color-primary` pada file `src/index.css` (misalnya ke `#0d9488` untuk teal atau `#059669` untuk zamrud), maka seluruh variasi `primary-50` sampai `primary-950` akan otomatis menyesuaikan menggunakan fungsi `color-mix()`.

---

## Sumber Data & Prinsip Konten

- **Transparansi Riwayat:** Daftar 99 nama mengikuti urutan riwayat **at-Tirmidzi (no. 3507)** yang populer di masyarakat. Aplikasi secara terbuka menampilkan catatan edukatif bahwa para ulama hadis menilai perincian nama pada riwayat tersebut memiliki kelemahan dari sisi sanad, sementara riwayat **al-Bukhari (no. 2736)** dan **Muslim (no. 2677)** menyebutkan jumlah 99 tanpa merincinya. Menurut mayoritas ulama Ahlus Sunnah, nama-nama Allah tidak terbatas pada 99.
- **Referensi Utama (`src/data/references.json`):**
  - *Al-Qur'an al-Karim* (rujukan terjemahan Kementerian Agama RI)
  - *Al-Maqsad al-Asna fi Syarh Ma'ani Asma' Allah al-Husna* — Imam Al-Ghazali
  - *Taisir al-Karim ar-Rahman fi Tafsir Kalam al-Mannan* — Syaikh 'Abdurrahman bin Nashir as-Sa'di
  - *Shahih al-Bukhari*, *Shahih Muslim*, *Sunan at-Tirmidzi*, *Al-Minhaj* (An-Nawawi), dan *Majmu' Fatawa wa Rasa'il* (Al-'Utsaimin).
- Aplikasi tidak mencantumkan klaim pahala/khasiat khusus dan menjaga adab tampilan (tanpa papan peringkat publik maupun efek permainan berlebihan).

---

## Dokumen Terkait

- [docs/PRD_v0.4.md](docs/PRD_v0.4.md) — Dokumen spesifikasi kebutuhan produk (*Product Requirements Document*)
- [docs/tasks.md](docs/tasks.md) — Rencana pengerjaan bertahap proyek
