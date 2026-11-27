import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="animate-page-enter w-full max-w-sm rounded-3xl border border-cream-200 bg-cream-50 p-6 shadow-xl dark:border-stone-800 dark:bg-stone-900">
        <h2 id="confirm-modal-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{message}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-2xl border border-cream-300 bg-cream-100 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-cream-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-11 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              destructive
                ? 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500'
                : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
