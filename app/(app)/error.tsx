'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-white/30 text-sm mb-4">Bir hata oluştu.</p>
      <button onClick={reset} className="text-xs text-white/40 hover:text-white/70 underline transition-colors">
        Tekrar dene
      </button>
    </div>
  );
}
