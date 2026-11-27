import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { BISMILLAH, SOURCE_NOTE } from '@/data';
import { TARGET_DAY_PRESETS, sanitizeUserName } from '@/domain';
import { useUserStore } from '@/store/useUserStore';
import type { LearningMode } from '@/types';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>('sequential');
  const [targetDays, setTargetDays] = useState<number>(30);
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [customInput, setCustomInput] = useState('45');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeUserName(userName);
    if (!cleaned) {
      setNameError('Silakan masukkan nama Anda terlebih dahulu.');
      return;
    }
    const resolvedDays = isCustomDays ? Math.max(1, Number.parseInt(customInput, 10) || 30) : targetDays;
    completeOnboarding({ userName: cleaned, learningMode, targetDays: resolvedDays });
    onComplete();
  };

  return (
    <main className="animate-page-enter flex flex-1 flex-col justify-between px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] lg:flex-none lg:p-0">
      <div className="mb-4 lg:mb-5">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cream-200 bg-white px-3.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-cream-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Daftar 99 Nama</span>
        </Link>
      </div>
      <div className="lg:grid lg:grid-cols-12 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-cream-200 lg:bg-white lg:shadow-sm lg:dark:border-stone-800 lg:dark:bg-stone-900">
        {/* Panel Kiri (Desktop) / Header Bismillah (Mobile) */}
        <section
          aria-label="Pembuka"
          className="mb-6 lg:col-span-5 lg:mb-0 lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-cream-200 lg:bg-cream-100/75 lg:p-8 lg:dark:border-stone-800 lg:dark:bg-stone-950/60"
        >
          <div>
            <div className="rounded-3xl border border-cream-200 bg-cream-100/90 px-5 py-6 text-center lg:border-cream-300/70 lg:bg-cream-50 dark:border-stone-800 dark:bg-stone-800/60 lg:dark:bg-stone-900">
              <p className="arabic-text text-2xl font-bold text-stone-900 sm:text-3xl dark:text-stone-100">
                {BISMILLAH.arabic}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {BISMILLAH.translation}
              </p>
            </div>

            <header className="mt-6">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 lg:text-3xl dark:text-stone-100">
                Selamat Datang
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                Latih hafalan dan pahami makna 99 Asmaul Husna lewat sesi singkat harian tanpa gangguan.
              </p>
            </header>

            <ul className="mt-6 hidden space-y-2.5 text-xs leading-relaxed text-stone-600 lg:block dark:text-stone-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                <span>Satu sesi singkat: 5 pertanyaan mencocokkan 15 nama dengan artinya.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                <span>Poin 0–100 di tiap nama membantu memprioritaskan lafaz yang masih lemah.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                <span>Penjelasan makna dilengkapi rujukan Al-Qur&apos;an dan kitab ulama.</span>
              </li>
            </ul>
          </div>

          <p className="mt-8 hidden text-[11px] leading-relaxed text-stone-500 lg:block dark:text-stone-400">
            {SOURCE_NOTE}
          </p>
        </section>

        {/* Panel Kanan: Form 3 Langkah */}
        <div className="flex flex-1 flex-col justify-between lg:col-span-7 lg:p-8">
          <form id="onboarding-form" onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Langkah 1: Nama */}
            <div>
              <label
                htmlFor="onboarding-name"
                className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200"
              >
                1. Siapa nama Anda?
              </label>
              <input
                id="onboarding-name"
                type="text"
                autoComplete="given-name"
                maxLength={40}
                placeholder="Masukkan nama panggilan Anda"
                value={userName}
                aria-invalid={nameError !== null}
                aria-describedby={nameError ? 'onboarding-name-error' : undefined}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                className={`min-h-12 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 dark:bg-stone-950/60 dark:text-stone-100 dark:placeholder:text-stone-500 ${nameError
                    ? 'border-primary-500 dark:border-primary-400'
                    : 'border-cream-300 hover:border-stone-400 dark:border-stone-700'
                  }`}
              />
              {nameError && (
                <p
                  id="onboarding-name-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-primary-600 dark:text-primary-400"
                >
                  {nameError}
                </p>
              )}
            </div>

            {/* Langkah 2: Mode Hafalan */}
            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200">
                2. Pilih metode hafalan Anda
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={learningMode === 'sequential'}
                  onClick={() => setLearningMode('sequential')}
                  className={`min-h-11 rounded-2xl border p-4 text-left transition-colors ${learningMode === 'sequential'
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:border-primary-400 dark:bg-primary-950/35 dark:ring-primary-400'
                      : 'border-cream-200 bg-white hover:border-cream-300 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-stone-700'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Bertahap
                    </span>
                    {learningMode === 'sequential' && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-primary-700 dark:text-primary-300">
                    Rekomendasi pemula
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                    Belajar per 15 nama. Tahap baru terbuka setelah rata-rata poin mencapai 80.
                  </p>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={learningMode === 'random'}
                  onClick={() => setLearningMode('random')}
                  className={`min-h-11 rounded-2xl border p-4 text-left transition-colors ${learningMode === 'random'
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:border-primary-400 dark:bg-primary-950/35 dark:ring-primary-400'
                      : 'border-cream-200 bg-white hover:border-cream-300 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-stone-700'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Acak (99 nama)
                    </span>
                    {learningMode === 'random' && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                    Semua nama terbuka
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                    Cocok jika sudah pernah hafal dan ingin langsung melatih seluruh 99 nama.
                  </p>
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Pilihan ini dapat diubah kapan saja di halaman Pengaturan.
              </p>
            </fieldset>

            {/* Langkah 3: Target Hari */}
            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200">
                3. Berapa hari target Anda menyelesaikan 99 nama?
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {TARGET_DAY_PRESETS.map((days) => {
                  const active = !isCustomDays && targetDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setTargetDays(days);
                        setIsCustomDays(false);
                      }}
                      className={`min-h-11 rounded-2xl border px-2 py-2.5 text-xs font-semibold transition-colors ${active
                          ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                          : 'border-cream-200 bg-white text-stone-700 hover:border-cream-300 dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-200'
                        }`}
                    >
                      {days} hari
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={isCustomDays}
                  onClick={() => setIsCustomDays(true)}
                  className={`min-h-11 rounded-2xl border px-2 py-2.5 text-xs font-semibold transition-colors ${isCustomDays
                      ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                      : 'border-cream-200 bg-white text-stone-700 hover:border-cream-300 dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-200'
                    }`}
                >
                  Kustom
                </button>
              </div>

              {isCustomDays && (
                <div className="mt-3 flex items-center gap-2.5">
                  <label htmlFor="onboarding-custom-days" className="sr-only">
                    Jumlah hari kustom
                  </label>
                  <input
                    id="onboarding-custom-days"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={3650}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="min-h-11 w-28 rounded-2xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                  />
                  <span className="text-xs text-stone-600 dark:text-stone-300">hari target penyelesaian</span>
                </div>
              )}
            </fieldset>
          </form>

          <div className="mt-8 pt-2">
            <button
              type="submit"
              form="onboarding-form"
              className="min-h-12 w-full rounded-2xl bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Mulai
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
