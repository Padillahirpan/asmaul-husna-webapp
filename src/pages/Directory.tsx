import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Check, ChevronDown, Copy, Search, X } from 'lucide-react';
import { NAMES, SOURCE_NOTE, getNameSlug } from '@/data';
import { ASMAUL_HUSNA_FAQ } from '@/data/faq';
import { getPoints } from '@/domain';
import { useUserStore } from '@/store/useUserStore';
import type { AsmaName } from '@/types';

interface DirectoryProps {
  onToast: (message: string) => void;
}

function normalizeQuery(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘`\-]/g, '')
    .toLowerCase()
    .trim();
}

function matchesQuery(item: AsmaName, rawQuery: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  if (String(item.id) === rawQuery.trim()) return true;
  if (item.arabic.includes(rawQuery.trim())) return true;
  if (normalizeQuery(item.latin).includes(normalizedQuery)) return true;
  if (normalizeQuery(item.meaning).includes(normalizedQuery)) return true;
  return false;
}

export default function Directory({ onToast }: DirectoryProps) {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const points = useUserStore((s) => s.points);

  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);

  const filteredNames = useMemo(
    () => NAMES.filter((item) => matchesQuery(item, query, normalizedQuery)),
    [query, normalizedQuery],
  );

  const handleCopy = async (item: AsmaName) => {
    const text = `${item.id}. ${item.arabic} — ${item.latin}: ${item.meaning}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedId(item.id);
        onToast(`${item.latin} berhasil disalin.`);
        window.setTimeout(() => {
          setCopiedId((current) => (current === item.id ? null : current));
        }, 1800);
      } else {
        onToast('Browser tidak mendukung salin otomatis.');
      }
    } catch {
      onToast('Gagal menyalin teks. Silakan coba lagi.');
    }
  };

  return (
    <main className="animate-page-enter flex flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] lg:px-8 lg:py-8">
      <h1 className="sr-only">99 Asmaul Husna: Arab, Latin, dan Artinya</h1>

      {/* Pencarian Instan */}
      <section aria-label="Pencarian Asmaul Husna" className="mb-5">
        <div className="relative">
          <label htmlFor="directory-search" className="sr-only">
            Cari Asmaul Husna berdasarkan nama Latin, arti, tulisan Arab, atau nomor urut
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
            aria-hidden="true"
          />
          <input
            id="directory-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, arti, Arab, atau nomor (mis. Pengasih, Razzaq, 17)..."
            className="min-h-12 w-full rounded-2xl border border-cream-300 bg-white py-3 pl-11 pr-12 text-sm text-stone-900 shadow-2xs transition-colors placeholder:text-stone-400 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:hover:border-stone-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Hapus pencarian"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-cream-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p aria-live="polite" className="mt-2 px-1 text-xs text-stone-500 dark:text-stone-400">
          {query.trim()
            ? `Menampilkan ${filteredNames.length} dari 99 nama untuk “${query.trim()}”.`
            : 'Menampilkan seluruh 99 nama. Ketuk kartu untuk membaca penjelasan dan referensinya.'}
        </p>
      </section>

      {/* Daftar Lengkap 99 Asmaul Husna */}
      <section aria-label="Daftar 99 Asmaul Husna">
        {filteredNames.length === 0 ? (
          <div className="rounded-3xl border border-cream-200 bg-white px-6 py-10 text-center dark:border-stone-800 dark:bg-stone-900/80">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Tidak ada nama yang cocok dengan &ldquo;{query.trim()}&rdquo;.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Coba kata kunci lain seperti &ldquo;Pengasih&rdquo;, &ldquo;Al-Malik&rdquo;, atau nomor urut 1–99.
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-4 inline-flex min-h-11 items-center rounded-2xl border border-cream-300 bg-cream-100 px-4 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-cream-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              Tampilkan Semua 99 Nama
            </button>
          </div>
        ) : (
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNames.map((item) => {
              const slug = getNameSlug(item);
              const isCopied = copiedId === item.id;
              const isMemorized = onboardingCompleted && getPoints(points, item.id) >= 100;

              return (
                <li
                  key={item.id}
                  className="group relative flex flex-col rounded-3xl border border-cream-200 bg-white shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-primary-800"
                >
                  {/* Baris Atas: Nomor Urut & Tombol Salin */}
                  <div className="flex items-center justify-between gap-2 px-4 pt-3.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-xl bg-cream-100 px-2 text-xs font-semibold tabular-nums text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        {item.id}
                      </span>
                      {isMemorized && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          title="Sudah hafal"
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                          Hafal
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleCopy(item)}
                      aria-label={`Salin ${item.latin}`}
                      className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-cream-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Area Utama Tautan ke Detail Nama */}
                  <Link
                    to={`/nama/${slug}`}
                    state={{ from: '/' }}
                    className="flex flex-1 flex-col justify-between rounded-b-3xl px-4 pb-4 pt-1 focus-visible:rounded-3xl"
                  >
                    <p className="arabic-text my-1 text-right text-3xl font-bold text-stone-900 dark:text-stone-100">
                      {item.arabic}
                    </p>
                    <div className="mt-2">
                      <h2 className="text-base font-bold tracking-tight text-stone-900 transition-colors group-hover:text-primary-700 dark:text-stone-100 dark:group-hover:text-primary-300">
                        {item.latin}
                      </h2>
                      <p className="mt-0.5 text-sm leading-snug text-stone-600 dark:text-stone-400">
                        {item.meaning}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Catatan Riwayat & FAQ Singkat */}
      <section
        aria-label="Catatan riwayat dan pertanyaan umum"
        className="mt-12 space-y-6 border-t border-cream-200 pt-8 dark:border-stone-800"
      >
        <aside className="rounded-3xl border border-cream-200 bg-cream-100/80 p-5 dark:border-stone-800 dark:bg-stone-900/60">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Catatan Riwayat Daftar</h2>
          <p className="mt-2 max-w-prose text-xs leading-relaxed text-stone-600 sm:text-sm sm:leading-6 dark:text-stone-300">
            {SOURCE_NOTE}
          </p>
        </aside>

        <div>
          <h2 className="mb-3 text-base font-bold tracking-tight text-stone-900 sm:text-lg dark:text-stone-100">
            Pertanyaan Umum tentang Asmaul Husna
          </h2>
          <div className="divide-y divide-cream-200 overflow-hidden rounded-3xl border border-cream-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900/80">
            {ASMAUL_HUSNA_FAQ.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-stone-900 transition-colors hover:bg-cream-50 dark:text-stone-100 dark:hover:bg-stone-800/50 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-stone-500 transition-transform duration-150 group-open:rotate-180 dark:text-stone-400"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  <p className="max-w-prose">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-cream-200 pt-6 text-center text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
        Made with love and coffee by{' '}
        <a
          href="https://ipadillah.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-stone-700 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-primary-700 dark:text-stone-200 dark:decoration-stone-700 dark:hover:text-primary-300"
        >
          ipadillah
        </a>
      </footer>
    </main>
  );
}
