/**
 * Tipe inti aplikasi Hafalan Asmaul Husna (PRD v0.4, bagian 8).
 * File ini hanya berisi definisi tipe — tanpa logika.
 */

/** Nomor urut nama 1..99 (riwayat at-Tirmidzi). */
export type NameId = number;

/** Tahap 1..7 (tahap 1–6 berisi 15 nama, tahap 7 berisi 9 nama). */
export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type LearningMode = 'sequential' | 'random';

export type Theme = 'light' | 'dark' | 'system';

/** Tanggal lokal berformat `YYYY-MM-DD`. */
export type DateKey = string;

// ---------------------------------------------------------------------------
// Data statis (JSON)
// ---------------------------------------------------------------------------

/** Satu entri master referensi (`src/data/references.json`). */
export interface Reference {
  id: string;
  title: string;
  authorOrSource: string;
  /** Keterangan umum (edisi, penerbit, dsb.). Lokasi spesifik ada di `Citation`. */
  note?: string;
  url?: string;
}

/** Rujukan spesifik dari sebuah nama ke referensi master. */
export interface Citation {
  referenceId: string;
  /** Lokasi rujukan: ayat, bab, atau halaman. */
  location: string;
}

export interface AsmaName {
  id: NameId;
  stage: StageNumber;
  /** Tulisan Arab berharakat. */
  arabic: string;
  latin: string;
  meaning: string;
  explanation: string;
  citations: Citation[];
}

export interface Bismillah {
  arabic: string;
  translation: string;
}

/** Bentuk berkas `src/data/names.json`. */
export interface NamesDataset {
  /** Catatan transparansi sumber daftar (riwayat at-Tirmidzi). */
  sourceNote: string;
  bismillah: Bismillah;
  names: AsmaName[];
}

// ---------------------------------------------------------------------------
// Status hafalan
// ---------------------------------------------------------------------------

export type MemorizationStatus = 'unlearned' | 'learning' | 'almost' | 'memorized';

/** Poin per nama, kunci = `NameId`. Nama yang tidak ada dianggap 0. */
export type PointsMap = Record<NameId, number>;

// ---------------------------------------------------------------------------
// State pengguna (persist ke localStorage)
// ---------------------------------------------------------------------------

export interface DrillingSummary {
  /** ISO timestamp saat sesi selesai. */
  completedAt: string;
  mode: LearningMode;
  netPoints: number;
  correctCount: number;
  totalPairs: number;
  accuracyPercent: number;
  /** Tahap yang baru terbuka di sesi ini (mode Bertahap), atau `null`. */
  unlockedNewStage: StageNumber | null;
}

export interface UserState {
  userName: string;
  learningMode: LearningMode;
  targetDays: number;
  startDate: DateKey;
  onboardingCompleted: boolean;
  /** Disimpan terpisah dari mode — tidak berubah saat pindah mode. */
  unlockedStage: StageNumber;
  points: PointsMap;
  /** ISO timestamp terakhir tiap nama dilatih (persiapan spacing v0.2). */
  lastPracticedAt: Record<NameId, string>;
  /** Tanggal unik sesi drilling selesai. */
  completedDates: DateKey[];
  lastDrillingSummary: DrillingSummary | null;
  theme: Theme;
}

// ---------------------------------------------------------------------------
// Sesi drilling (transien, tidak dipersist)
// ---------------------------------------------------------------------------

export interface DrillingQuestion {
  /** 3 nama pada pertanyaan ini (urutan prioritas poin terendah). */
  nameIds: NameId[];
  /** Urutan tampil kartu Arab (teracak). */
  arabicOrder: NameId[];
  /** Urutan tampil kartu arti (teracak). */
  meaningOrder: NameId[];
}

export interface PairResult {
  questionIndex: number;
  /** Nama pada kartu Arab yang dipilih. */
  arabicId: NameId;
  /** Nama pemilik kartu arti yang dipilih. */
  chosenMeaningId: NameId;
  correct: boolean;
  pointsBefore: number;
  pointsAfter: number;
  /** Perubahan aktual setelah dibatasi 0..100. */
  delta: number;
}

export interface DrillingSession {
  mode: LearningMode;
  questions: DrillingQuestion[];
  currentQuestionIndex: number;
  results: PairResult[];
}
