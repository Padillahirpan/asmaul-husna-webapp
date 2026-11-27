interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 px-4 lg:bottom-6"
    >
      <div className="animate-page-enter rounded-full bg-stone-900 px-4 py-2.5 text-xs font-medium text-cream-50 shadow-lg dark:bg-stone-100 dark:text-stone-900">
        {message}
      </div>
    </div>
  );
}
