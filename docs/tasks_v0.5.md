# Task Breakdown: PRD v0.5 — Direktori Publik, Funnel Hafalan & SEO (Vite SSG)

Dokumen ini merupakan daftar tugas implementasi berdasarkan `@docs/prd_v0.5.md`, disusun berurutan berdasarkan **prioritas pengerjaan (P0 → P4)** agar setiap tahap memiliki fondasi yang teruji sebelum melangkah ke tahap berikutnya.

---

## P0 — Fondasi Slug, Routing Nyata & Hydration-Safe State *(Kritis / Blocker)*

Menyiapkan infrastruktur URL nyata dan fungsi slug deterministik tanpa merusak logika domain dan unit test yang sudah berjalan.

- [x] **P0.1 — Modul Pure Function Slug (`src/domain/slug.ts`) & Helper Data (`src/data/index.ts`)**
  - Buat fungsi `toNameSlug(latin: string): string` (contoh: `Ar-Rahman` → `ar-rahman`, `Al-Mu'min` → `al-mumin`, `Dzul-Jalali wal-Ikram` → `dzul-jalali-wal-ikram`).
  - Ekspos `getNameSlug(name)`, `getNameBySlug(slug)`, dan `ALL_NAME_SLUGS` di `src/data/index.ts`.
  - Pastikan seluruh 99 nama menghasilkan slug unik, huruf kecil, ASCII, dan ramah URL.
- [x] **P0.2 — Unit Test Integritas Slug (`src/__tests__/`)**
  - Tambah unit test untuk memastikan 99 slug seluruhnya unik, tidak kosong, cocok regex `/^[a-z0-9-]+$/`, dan `getNameBySlug(getNameSlug(n))` selalu mengembalikan nama yang tepat.
  - Jalankan `npm run test` hingga seluruh test lama & baru lulus hijau.
- [x] **P0.3 — Pemasangan & Setup Routing (`react-router`)**
  - Pasang `react-router` di `package.json`.
  - Siapkan struktur rute aplikasi yang mendukung *client rendering* (`BrowserRouter`) maupun *server pre-rendering* (`StaticRouter`):
    - `/` → Direktori 99 Asmaul Husna
    - `/nama/:slug` → Detail Nama
    - `/hafalan` → Dashboard Progres & Streak (atau Onboarding jika belum selesai)
    - `/latihan` → Halaman Latihan / Drilling (atau Onboarding jika belum selesai)
    - `/pengaturan` → Pengaturan
    - `*` → Fallback/redirect rapi ke `/`
- [x] **P0.4 — Hydration-Safe Client State (`useUserStore` & `useThemeEffect`)**
  - Pastikan pembacaan `localStorage` (Zustand `persist`) dan manipulasi `document` tidak menyebabkan *error* saat *build-time* SSR (`typeof window === 'undefined'`) maupun *hydration mismatch* antara HTML statis dan state klien.

**Kriteria Selesai P0:** `npm run typecheck` dan `npm run test` lulus; navigasi URL nyata bekerja mulus di mode `vite dev`.

---

## P1 — Halaman Publik: Direktori 99 Nama (`/`) & 99 Halaman Detail (`/nama/:slug`) *(Tinggi)*

Membangun permukaan utama yang langsung bermanfaat bagi pengunjung dari mesin pencari sekaligus menjadi *funnel* alami ke fitur hafalan.

- [x] **P1.1 — Halaman Direktori Publik 99 Asmaul Husna (`src/pages/Directory.tsx`)**
  - Tampilkan Bismillah ringkas, judul `<h1>` ramah SEO (*"99 Asmaul Husna: Arab, Latin, dan Artinya"*), dan pengantar singkat yang tenang & beradab.
  - Buat **Banner Funnel Adaptif**:
    - Belum onboarding: ajakan lembut latihan 2 menit (5 soal, 15 nama) dengan tautan ke `/latihan`.
    - Sudah onboarding: ringkasan singkat streak & jumlah hafal (`/99`) dengan tombol cepat ke `/latihan` dan `/hafalan`.
  - Tambah **Pencarian Instan** (filter berdasarkan Latin, arti, Arab, atau nomor urut `1–99`) beserta indikator jumlah hasil & tombol reset pencarian.
  - Render **seluruh 99 nama sekaligus** (tanpa gembok & tanpa pagination) dalam grid responsif (1 kolom mobile, 2–3/4 kolom desktop) lengkap dengan:
    - Nomor urut, Arab berharakat (`Amiri`), Latin, dan arti.
    - Tautan asli `<Link to="/nama/:slug">` ke halaman detail.
    - Tombol **Salin** cepat (`Arab — Latin: Arti`) + notifikasi toast.
  - Tambahkan bagian **Catatan Riwayat** (`SOURCE_NOTE`) dan **FAQ Singkat** (3–4 pertanyaan utama tentang Asmaul Husna & cara menghafalnya) di bawah daftar.
- [x] **P1.2 — Penyesuaian Halaman Detail Nama (`src/pages/NameDetail.tsx`)**
  - Baca parameter `:slug` dari URL (bukan hanya `nameId` state) dan tangani slug tidak valid dengan pesan sopan + tombol kembali ke `/`.
  - Ganti navigasi kembali, sebelumnya, dan berikutnya menjadi tautan asli (`<Link to="/nama/:slug">`) untuk *internal linking* SEO yang kuat.
  - Buat indikator poin `0–100`, status warna, dan badge tahap terkunci tampil **kondisional** (hanya jika `onboardingCompleted === true`) agar tidak membingungkan pengunjung publik.
  - Tambah tombol **Salin** di kartu utama dan **CTA Funnel mini** di bagian bawah (*"Latih hafalan nama ini"* → `/latihan`).

**Kriteria Selesai P1:** Pengunjung baru yang membuka `/` atau `/nama/ar-rahman` langsung melihat konten lengkap tanpa terhadang Onboarding, bisa mencari & menyalin nama, dan bisa berpindah antar 99 halaman lewat URL asli.

---

## P2 — Pemisahan Funnel Hafalan (`/hafalan`, `/latihan`, `/pengaturan`) & Navigasi *(Tinggi)*

Memastikan fitur hafalan yang sudah dibangun tetap berjalan optimal sebagai tujuan *funnel* dengan navigasi yang jelas di mobile maupun desktop.

- [x] **P2.1 — Alur Onboarding Kontekstual (`src/pages/Onboarding.tsx` & Guard Route)**
  - Tampilkan `Onboarding` secara otomatis ketika pengguna belum onboarding dan membuka `/hafalan` atau `/latihan`.
  - Setelah klik **Mulai**, arahkan langsung ke halaman tujuan awalnya (`/hafalan` atau `/latihan`).
  - Tambahkan tautan sopan **"Kembali ke Daftar 99 Nama"** (`/`) di halaman Onboarding.
- [x] **P2.2 — Penyesuaian Label & Tautan di `/hafalan`, `/latihan`, dan `/pengaturan`**
  - Perbarui label UI yang relevan dari *"Drilling"* menjadi *"Latihan"* (atau tetap konsisten secara alami sesuai PRD v0.5) pada tombol dan navigasi menuju `/latihan`.
  - Di `src/pages/Drilling.tsx` (rute `/latihan`), arahkan klik sel grid 99 nama ke `/nama/:slug` (dengan state asal agar tombol kembali tetap intuitif).
  - Di `src/pages/Settings.tsx` (rute `/pengaturan`), izinkan pengunjung publik mengganti **Tema (Terang/Gelap/Sistem)** tanpa harus onboarding; tampilkan opsi profil, mode hafalan, target hari, dan reset progress khusus bila `onboardingCompleted === true`.
- [x] **P2.3 — Navigasi Desktop Sidebar & Mobile Navigation**
  - Perbarui `src/components/DesktopSidebar.tsx` dengan tautan `<Link>`/`<NavLink>` untuk 4 menu utama:
    1. **99 Asmaul Husna** (`/`)
    2. **Progres & Streak** (`/hafalan`)
    3. **Latihan** (`/latihan`)
    4. **Pengaturan** (`/pengaturan`)
  - Untuk pengunjung baru di sidebar desktop, ganti kartu ringkasan user/streak dengan ajakan ringkas **"Mulai Catat Hafalan"**.
  - Tambahkan navigasi ringkas di mobile (`< 1024px`) agar pengguna bisa berpindah antara **99 Nama**, **Progres**, **Latihan**, dan **Pengaturan** dalam 1 sentuhan (otomatis tersembunyi saat sesi latihan aktif).

**Kriteria Selesai P2:** Seluruh alur pengguna baru (baca `/` → klik mulai latihan → onboarding → latihan) dan pengguna lama (streak, recap, reset progress, ganti mode) berjalan mulus di mobile & desktop.

---

## P3 — SEO Metadata, JSON-LD & Static Pre-rendering (SSG) di Vite *(Tinggi — Inti Visibilitas Google)*

Membuat seluruh 100+ halaman ter-render menjadi HTML statis saat build agar langsung terbaca Googlebot dan rapi saat dibagikan ke WhatsApp/media sosial.

- [x] **P3.1 — Modul Metadata SEO & Structured Data (`src/seo/meta.ts`)**
  - Buat generator metadata per rute (`title`, `description`, `canonical`, `og:title`, `og:description`, `og:type`, `og:locale`) untuk `/`, ke-99 `/nama/:slug`, `/hafalan`, `/latihan`, dan `/pengaturan`.
  - Buat generator **JSON-LD**:
    - `/` → `ItemList` (99 Asmaul Husna) + `FAQPage`
    - `/nama/:slug` → `BreadcrumbList` + `DefinedTerm`
  - Sinkronkan `document.title` dan `<meta name="description">` saat navigasi klien di browser.
  - Baca base URL produksi dari environment variable `VITE_SITE_URL` (dengan fallback aman bila domain belum dibeli).
- [x] **P3.2 — Entry SSR & Skrip Pre-render Build (`src/entry-server.tsx` & `scripts/prerender.mjs`)**
  - Pisahkan `src/main.tsx` (client hydration dengan `hydrateRoot` / fallback `createRoot`) dan `src/entry-server.tsx` (`render(url)` menggunakan `react-dom/server` `renderToString`).
  - Buat skrip `scripts/prerender.mjs` yang berjalan otomatis pada `npm run build` untuk:
    1. Membangun bundle client (`vite build`) dan bundle SSR (`vite build --ssr`).
    2. Merender HTML statis dan menyuntikkan `<title>`, meta SEO, canonical, Open Graph, serta `<script type="application/ld+json">` ke:
       - `dist/index.html`
       - `dist/nama/<slug>/index.html` (99 file)
       - `dist/hafalan/index.html`, `dist/latihan/index.html`, `dist/pengaturan/index.html`
    3. Menghapus artefak sementara SSR setelah selesai agar folder `dist/` tetap bersih untuk static hosting.
- [x] **P3.3 — Generator `sitemap.xml` & `robots.txt`**
  - Generate `dist/sitemap.xml` otomatis berisi `/` + 99 `/nama/:slug` + `/latihan` (menggunakan `VITE_SITE_URL` jika tersedia, atau placeholder/path yang terdokumentasi jelas untuk diaktifkan saat domain siap).
  - Generate `dist/robots.txt` yang mengizinkan crawling halaman publik dan menautkan `Sitemap`.
  - Tambahkan contoh `.env.example` yang mendokumentasikan `VITE_SITE_URL`.

**Kriteria Selesai P3:** `npm run build` menghasilkan `dist/index.html` berisi teks 99 nama lengkap, 99 berkas `dist/nama/*/index.html`, `dist/sitemap.xml`, dan `dist/robots.txt` tanpa error.

---

## P4 — Verifikasi Kualitas, Audit SEO & Kesiapan Rilis *(Sedang — Wajib Sebelum Deploy)*

Memastikan tidak ada regresi pada fitur hafalan, tidak ada warning hydration, dan kualitas teknis siap bersaing di hasil pencarian.

- [x] **P4.1 — Verifikasi Build & Test Menyeluruh**
  - Jalankan `npm run typecheck`, `npm run test`, dan `npm run build`.
  - Cek manual sampel HTML hasil build (`dist/index.html`, `dist/nama/ar-rahman/index.html`, `dist/nama/ash-shabur/index.html`) untuk memastikan konten Arab/Latin/arti, tag `<title>`, meta description, dan JSON-LD ter-render utuh.
- [ ] **P4.2 — Uji Interaksi di Browser (`vite preview`)**
  - Pastikan tidak ada error/warning hydration di konsol browser.
  - Uji alur lengkap di viewport mobile (`390px`) dan desktop (`1280px`): pencarian di `/`, salin teks, klik detail nama, navigasi prev/next, onboarding via `/latihan`, 1 sesi latihan penuh, streak di `/hafalan`, dan ganti tema di `/pengaturan`.
- [ ] **P4.3 — Audit Lighthouse & Checklist Pasca-Beli Domain**
  - Cek skor Lighthouse (Performance, Accessibility, Best Practices, SEO) dengan target `>= 95`.
  - Siapkan panduan singkat untuk langkah setelah domain dibeli: set `VITE_SITE_URL=https://domainkamu.id`, redeploy, dan submit `sitemap.xml` ke Google Search Console.

---

## Ringkasan Urutan Eksekusi

| Prioritas | Fokus Utama | Dampak Langsung |
| --- | --- | --- |
| **P0** | Slug, `react-router`, hydration-safe store | Fondasi URL nyata & unit test tetap hijau |
| **P1** | Direktori publik `/` + 99 halaman `/nama/:slug` | Konten langsung bisa diakses tanpa onboarding |
| **P2** | Funnel `/hafalan`, `/latihan`, `/pengaturan` & navigasi | Alur baca → hafalan mulus di mobile & desktop |
| **P3** | Vite SSG pre-render, SEO meta, JSON-LD, `sitemap.xml` | 100+ halaman statis siap diindeks Google |
| **P4** | Verifikasi build, uji browser, audit Lighthouse | Bebas regresi & siap deploy produksi |
