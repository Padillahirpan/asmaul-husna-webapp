import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, BookOpen, Check, Monitor, Moon, Sun } from 'lucide-react';
import { APP_VERSION } from '@/data';
import { TARGET_DAY_PRESETS, sanitizeUserName } from '@/domain';
import { useUserStore } from '@/store/useUserStore';
import { ConfirmModal } from '@/components/ConfirmModal';
import type { LearningMode, Theme } from '@/types';

interface SettingsProps {
  onBack: () => void;
  onToast: (message: string) => void;
}

const THEME_OPTIONS: readonly { key: Theme; label: string; Icon: typeof Sun }[] = [
  { key: 'light', label: 'Terang', Icon: Sun },
  { key: 'dark', label: 'Gelap', Icon: Moon },
  { key: 'system', label: 'Sistem', Icon: Monitor },
];

export default function Settings({ onBack, onToast }: SettingsProps) {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const userName = useUserStore((s) => s.userName);
  const learningMode = useUserStore((s) => s.learningMode);
  const targetDays = useUserStore((s) => s.targetDays);
  const theme = useUserStore((s) => s.theme);
  const setUserName = useUserStore((s) => s.setUserName);
  const setLearningMode = useUserStore((s) => s.setLearningMode);
  const setTargetDays = useUserStore((s) => s.setTargetDays);
  const setTheme = useUserStore((s) => s.setTheme);
  const resetProgress = useUserStore((s) => s.resetProgress);

  const [nameDraft, setNameDraft] = useState(userName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [customDaysDraft, setCustomDaysDraft] = useState(String(targetDays));
  /** Konfirmasi reset dua langkah (PRD §12). 0 = tutup, 1 = langkah 1, 2 = langkah 2. */
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setNameDraft(userName);
  }, [userName]);

  useEffect(() => {
    setCustomDaysDraft(String(targetDays));
  }, [targetDays]);

  const handleSaveName = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeUserName(nameDraft);
    if (!cleaned) {
      setNameError('Nama tidak boleh kosong.');
      return;
    }
    setUserName(cleaned);
    setNameDraft(cleaned);
    setNameError(null);
    onToast('Nama berhasil diperbarui.');
  };

  const handleModeChange = (mode: LearningMode) => {
    if (mode === learningMode) return;
    setLearningMode(mode);
    onToast(mode === 'sequential' ? 'Mode Bertahap diaktifkan.' : 'Mode Acak diaktifkan.');
  };

  const handleApplyTargetDays = (days: number) => {
    if (!Number.isFinite(days) || days < 1) {
      onToast('Masukkan jumlah hari minimal 1.');
      return;
    }
    const clamped = Math.min(3650, Math.round(days));
    setTargetDays(clamped);
    setCustomDaysDraft(String(clamped));
    onToast(`Target diubah menjadi ${clamped} hari.`);
  };

  const themeSection = (
    <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
      <h2 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-200">Tema Tampilan</h2>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map(({ key, label, Icon }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(key)}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${active
                  ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                  : 'border-cream-200 bg-cream-50 text-stone-700 hover:border-cream-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200'
                }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <main className="animate-page-enter flex flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-8 lg:py-8">
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={onboardingCompleted ? 'Kembali ke Progres' : 'Kembali ke Daftar 99 Nama'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 lg:hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-stone-900 lg:text-2xl dark:text-stone-100">
            Pengaturan
          </h1>
          <p className="hidden text-sm text-stone-500 lg:block dark:text-stone-400">
            {onboardingCompleted
              ? 'Sesuaikan profil, metode hafalan, target harian, dan tema tampilan.'
              : 'Atur tema tampilan atau mulai mencatat progres hafalan Anda.'}
          </p>
        </div>
      </header>

      {!onboardingCompleted ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
          {themeSection}
          <section className="rounded-3xl border border-primary-200/80 bg-primary-50/70 p-5 lg:p-6 dark:border-primary-900/60 dark:bg-primary-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-white text-primary-700 dark:border-primary-800/70 dark:bg-stone-900 dark:text-primary-300">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Belum memulai hafalan
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  Pengaturan profil, mode Bertahap/Acak, dan target hari akan tersedia setelah Anda memulai sesi hafalan pertama.
                </p>
              </div>
            </div>
            <Link
              to="/hafalan/latihan"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Mulai Latihan Hafalan
            </Link>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
          {/* Kolom Kiri: Nama & Metode Hafalan */}
          <div className="space-y-4">
            <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
              <form onSubmit={handleSaveName} noValidate>
                <label
                  htmlFor="settings-name"
                  className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200"
                >
                  Nama Pengguna
                </label>
                <div className="flex gap-2">
                  <input
                    id="settings-name"
                    type="text"
                    maxLength={40}
                    value={nameDraft}
                    aria-invalid={nameError !== null}
                    onChange={(e) => {
                      setNameDraft(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    className="min-h-11 flex-1 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                  />
                  <button
                    type="submit"
                    className="min-h-11 shrink-0 rounded-2xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    Simpan
                  </button>
                </div>
                {nameError && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-primary-600 dark:text-primary-400">
                    {nameError}
                  </p>
                )}
              </form>
            </section>

            <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Metode Hafalan</h2>
              <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                Perpindahan mode tidak menghapus poin hafalan maupun progres tahap yang sudah Anda capai.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  role="radio"
                  aria-checked={learningMode === 'sequential'}
                  onClick={() => handleModeChange('sequential')}
                  className={`min-h-11 rounded-2xl border p-3.5 text-left transition-colors ${learningMode === 'sequential'
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:border-primary-400 dark:bg-primary-950/35 dark:ring-primary-400'
                      : 'border-cream-200 bg-cream-50/70 hover:border-cream-300 dark:border-stone-800 dark:bg-stone-950/50'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Bertahap (per 15 nama)
                    </span>
                    {learningMode === 'sequential' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                    Tahap baru terbuka setelah rata-rata poin tahap terbaru mencapai ≥ 80.
                  </p>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={learningMode === 'random'}
                  onClick={() => handleModeChange('random')}
                  className={`min-h-11 rounded-2xl border p-3.5 text-left transition-colors ${learningMode === 'random'
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:border-primary-400 dark:bg-primary-950/35 dark:ring-primary-400'
                      : 'border-cream-200 bg-cream-50/70 hover:border-cream-300 dark:border-stone-800 dark:bg-stone-950/50'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Acak (semua 99 nama)
                    </span>
                    {learningMode === 'random' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                    Seluruh 99 nama langsung terbuka dan diacak berdasarkan poin terendah.
                  </p>
                </button>
              </div>
            </section>
          </div>

          {/* Kolom Kanan: Target Hari, Tema, Reset */}
          <div className="space-y-4">
            <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
              <h2 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-200">
                Target Hafalan (Hari)
              </h2>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {TARGET_DAY_PRESETS.map((days) => {
                  const active = targetDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleApplyTargetDays(days)}
                      className={`min-h-11 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${active
                          ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                          : 'border-cream-200 bg-cream-50 text-stone-700 hover:border-cream-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200'
                        }`}
                    >
                      {days} hari
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="settings-custom-days" className="sr-only">
                  Target hari kustom
                </label>
                <input
                  id="settings-custom-days"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={3650}
                  value={customDaysDraft}
                  onChange={(e) => setCustomDaysDraft(e.target.value)}
                  className="min-h-11 w-28 rounded-2xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => handleApplyTargetDays(Number.parseInt(customDaysDraft, 10))}
                  className="min-h-11 rounded-2xl border border-cream-300 bg-cream-100 px-4 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-cream-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                >
                  Terapkan Kustom
                </button>
              </div>
            </section>

            {themeSection}

            <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Reset Progress</h2>
              <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                Menghapus seluruh poin nama (kembali ke 0), tahap terbuka (kembali ke Tahap 1), streak, dan riwayat latihan. Nama, mode hafalan, target hari, dan tema tetap disimpan.
              </p>
              <button
                type="button"
                onClick={() => setResetStep(1)}
                className="mt-3.5 min-h-11 w-full rounded-2xl border border-primary-300 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-900 dark:bg-primary-950/40 dark:text-primary-300 dark:hover:bg-primary-950/70"
              >
                Reset Progress Hafalan
              </button>
            </section>
          </div>
        </div>
      )}

      {/* Versi & Kredit */}
      <footer className="mt-8 space-y-1 text-center text-xs text-stone-500 lg:text-left dark:text-stone-400">
        <p>
          Versi {APP_VERSION.number} {APP_VERSION.label}
        </p>
        <p>
          Made with love and coffee by{' '}
          <a
            href="https://ipadillah.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-stone-700 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-primary-700 dark:text-stone-200 dark:decoration-stone-700 dark:hover:text-primary-300"
          >
            ipadillah
          </a>
        </p>
      </footer>

      {onboardingCompleted && (
        <>
          <ConfirmModal
            open={resetStep === 1}
            title="Reset seluruh progres hafalan?"
            message="Semua poin hafalan (0–100), tahap yang sudah terbuka, streak harian, dan riwayat latihan akan dihapus. Nama, mode, target hari, dan tema tidak berubah."
            confirmLabel="Lanjutkan"
            destructive
            onCancel={() => setResetStep(0)}
            onConfirm={() => setResetStep(2)}
          />

          <ConfirmModal
            open={resetStep === 2}
            title="Konfirmasi terakhir"
            message="Tindakan ini tidak dapat dibatalkan. Yakin ingin mengembalikan semua progres hafalan ke awal?"
            confirmLabel="Ya, Reset Sekarang"
            destructive
            onCancel={() => setResetStep(0)}
            onConfirm={() => {
              resetProgress();
              setResetStep(0);
              onToast('Progres hafalan berhasil direset.');
            }}
          />
        </>
      )}
    </main>
  );
}
