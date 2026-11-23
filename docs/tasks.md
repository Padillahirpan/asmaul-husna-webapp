Saya ingin membangun Web App Hafalan Asmaul Husna (offline-first, tanpa backend) berdasarkan dokumen spesifikasi terlampir `@docs/PRD-v0.4.md` (dan `@docs/asmaul-husna-app.html` sebagai referensi visual & interaksi UI).

Gunakan tech stack berikut:
- React + Vite + TypeScript
- Tailwind CSS (dengan palet pastel hangat: cream/beige, rose-400, rounded typography Plus Jakarta Sans + font Arab Amiri, serta dukungan tema Light / Dark / System)
- Zustand (dengan `persist` middleware ke `localStorage`)
- Lucide React untuk ikon
- Vitest untuk unit testing

Kerjakan proyek ini secara bertahap dan terstruktur mengikuti urutan berikut:

### Tahap 1: Setup Proyek & Arsitektur Folder
Inisialisasi struktur folder yang memisahkan data, pure domain logic, state, dan UI:
- `src/types/` (definisi TypeScript untuk `AsmaName`, `Reference`, `Citation`, `UserState`, `DrillingSession`)
- `src/data/` (`references.json` dan `names.json`)
- `src/domain/` (pure functions tanpa ketergantungan pada React/DOM: `scoring.ts`, `drilling.ts`, `stage.ts`, `streak.ts`)
- `src/store/` (`useUserStore.ts`)
- `src/components/` & `src/pages/` (`Onboarding`, `Dashboard`, `Drilling`, `NameDetail`, `Settings`)
- `src/__tests__/` (unit tests untuk domain logic dan validasi integritas data JSON)

### Tahap 2: Pure Domain Logic & Unit Tests (Wajib Lulus Test Dulu)
Implementasikan aturan bisnis dari PRD v0.4 ke dalam `src/domain/`:
1. **Scoring (`scoring.ts`):**
   - Poin awal `0`, batas minimum `0` dan maksimum `100`.
   - Pasangan benar `+20`, salah `-5`.
   - Mapping status: `0-19` (Belum hafal), `20-59` (Belajar), `60-99` (Hampir hafal), `100` (Hafal).
2. **Pemilihan Soal Drilling (`drilling.ts`):**
   - 1 sesi = 5 pertanyaan = 15 pasangan = 15 nama unik (3 kartu Arab vs 3 kartu arti per pertanyaan, urutan kartu diacak).
   - Mode `random`: ambil 15 nama dari seluruh 99 nama dengan prioritas poin terendah (poin sama diacak).
   - Mode `sequential` (Bertahap): ambil 15 nama dari **seluruh nama pada tahap yang sudah unlock** (`1` s.d. `unlockedStage`) dengan prioritas poin terendah. Jika baru tahap 1 (15 nama), semua 15 nama dipakai.
3. **Progres Tahap (`stage.ts`):**
   - 99 nama dibagi 7 tahap (Tahap 1–6 masing-masing 15 nama, Tahap 7 berisi 9 nama).
   - Di mode `sequential`, setelah sesi selesai, hitung rata-rata poin **15 nama di tahap terbaru (`unlockedStage`)**. Jika rata-rata `>= 80` dan `unlockedStage < 7`, naikkan `unlockedStage + 1`.
   - Pastikan `unlockedStage` dan `points[1..99]` disimpan terpisah sehingga pergantian mode di Setting tidak menghapus poin maupun merusak progres tahap.
4. **Streak & Kalender Mingguan (`streak.ts`):**
   - Hitung streak harian berturut-turut dan status hari Senin–Minggu dari array tanggal unik `completedDates` (`YYYY-MM-DD`).
5. **Unit Tests (`src/__tests__/`):**
   - Tulis unit test lengkap untuk seluruh skenario di atas (termasuk batas 0-100, ambang tepat `80` membuka tahap sedangkan `79` belum, pergantian mode `sequential` <-> `random`, dan validasi skema JSON). Jalankan `vitest` hingga semua test hijau sebelum lanjut ke Tahap 3.

### Tahap 3: Dataset Statis (`references.json` & `names.json`)
- Buat `src/data/references.json` berisi daftar master referensi (Al-Qur'an, *Al-Maqsad al-Asna* karya Al-Ghazali, dll.).
- Buat `src/data/names.json` berisi lengkap **99 Asmaul Husna** (urutan 1–99 riwayat at-Tirmidzi) dengan tulisan Arab berharakat, transliterasi Latin, arti bahasa Indonesia, penjelasan ringkas, `citations` yang merujuk ke `referenceId`, serta metadata `sourceNote` dan `bismillah` sesuai bagian 8 PRD.

### Tahap 4: Implementasi UI 5 Halaman & State Management
Bangun ke-5 halaman (`Onboarding`, `Dashboard`, `Drilling`, `NameDetail`, `Settings`) yang terhubung ke `useUserStore` dengan desain mobile-first yang bersih, tenang, dan beradab sesuai prototipe & PRD v0.4.

Mulai dengan **Tahap 1 dan Tahap 2 terlebih dahulu**, tampilkan rencana struktur file, lalu jalankan unit test-nya sebelum kita lanjut ke Tahap 3 & 4.

Gunakan skill `@.agents/skills/design-taste-frontend/SKILL.md`, `@.agents/skills/frontend-design/SKILL.md` dan `@.agents/skills/ui-ux-pro-max/SKILL.md` untuk mengerjakan Tahap 4 (Implementasi UI semua halaman)