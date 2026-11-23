import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Lock } from 'lucide-react';
import { getNameById, getReferenceById } from '@/data';
import { TOTAL_NAMES, getPoints, getStatus, getStatusLabel, isNameUnlocked } from '@/domain';
import { useUserStore } from '@/store/useUserStore';
import { StatusCircle } from '@/components/StatusCircle';
import type { NameId } from '@/types';

interface NameDetailProps {
  nameId: NameId;
  onBack: () => void;
  onSelectName: (id: NameId) => void;
}

function statusPillClasses(points: number): string {
  const status = getStatus(points);
  if (status === 'memorized') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
  if (status === 'almost') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-300';
  }
  if (status === 'learning') {
    return 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800/70 dark:bg-primary-950/40 dark:text-primary-300';
  }
  return 'border-cream-200 bg-cream-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300';
}

export default function NameDetail({ nameId, onBack, onSelectName }: NameDetailProps) {
  const pointsMap = useUserStore((s) => s.points);
  const learningMode = useUserStore((s) => s.learningMode);
  const unlockedStage = useUserStore((s) => s.unlockedStage);

  const item = getNameById(nameId) ?? getNameById(1);
  if (!item) return null;

  const pts = getPoints(pointsMap, item.id);
  const label = getStatusLabel(pts);
  const unlocked = isNameUnlocked(item.id, learningMode, unlockedStage);

  return (
    <main className="animate-page-enter flex flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-8 lg:py-8">
      {/* Header Navigasi */}
      <header className="mb-5 flex items-center justify-between gap-2 lg:mb-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke Halaman Drilling"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cream-200 bg-white px-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-cream-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Daftar 99 Nama</span>
        </button>

        <span className="text-xs font-semibold text-stone-600 lg:text-sm dark:text-stone-400">
          Urutan ke-{item.id}
          {learningMode === 'sequential' ? `, Tahap ${item.stage}` : ''}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={item.id <= 1}
            onClick={() => onSelectName(Math.max(1, item.id - 1))}
            aria-label="Nama sebelumnya"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 disabled:opacity-40 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={item.id >= TOTAL_NAMES}
            onClick={() => onSelectName(Math.min(TOTAL_NAMES, item.id + 1))}
            aria-label="Nama berikutnya"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 disabled:opacity-40 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Editorial 2-Column Layout di Desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* Kiri: Kartu Utama Arab, Latin, Arti, Poin */}
        <section className="rounded-3xl border border-cream-200 bg-white px-5 py-7 text-center shadow-2xs lg:sticky lg:top-8 lg:col-span-5 lg:px-6 lg:py-10 dark:border-stone-800 dark:bg-stone-900/80">
          {!unlocked && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-cream-100 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Tahap {item.stage} belum terbuka di Mode Bertahap
            </div>
          )}

          <p className="arabic-text my-2 text-4xl font-bold text-stone-900 sm:text-5xl lg:text-6xl dark:text-stone-100">
            {item.arabic}
          </p>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-stone-900 lg:text-2xl dark:text-stone-100">
            {item.latin}
          </h1>
          <p className="mt-1.5 text-sm font-semibold text-primary-700 lg:text-base dark:text-primary-300">
            {item.meaning}
          </p>

          <div className="mt-6 flex justify-center">
            <div
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold ${statusPillClasses(pts)}`}
            >
              <StatusCircle points={pts} size={17} />
              <span>{label}</span>
              <span aria-hidden="true" className="opacity-45">
                |
              </span>
              <span>{pts} / 100 poin</span>
            </div>
          </div>
        </section>

        {/* Kanan: Penjelasan & Referensi */}
        <div className="space-y-4 lg:col-span-7">
          <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
            <h2 className="mb-2.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
              Penjelasan Makna
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-stone-800 lg:text-base lg:leading-7 dark:text-stone-200">
              {item.explanation}
            </p>
          </section>

          <section className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
            <h2 className="mb-3 text-xs font-semibold text-stone-500 dark:text-stone-400">Referensi</h2>
            <ul className="space-y-2.5">
              {item.citations.map((cit, idx) => {
                const ref = getReferenceById(cit.referenceId);
                return (
                  <li
                    key={`${cit.referenceId}-${idx}`}
                    className="rounded-2xl border border-cream-200/80 bg-cream-100/70 p-3.5 lg:p-4 dark:border-stone-800 dark:bg-stone-800/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-stone-900 lg:text-sm dark:text-stone-100">
                        {ref ? ref.title : cit.referenceId}
                      </p>
                      {ref?.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Buka sumber ${ref.title}`}
                          className="shrink-0 text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
                      {ref?.authorOrSource ? `${ref.authorOrSource} — ` : ''}
                      {cit.location}
                    </p>
                    {ref?.note && (
                      <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                        {ref.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
