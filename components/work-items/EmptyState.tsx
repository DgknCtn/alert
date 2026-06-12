export type EmptyStateVariant = 'all-open' | 'filtered' | 'completed';

export default function EmptyState({ variant }: { variant: EmptyStateVariant }) {
  if (variant === 'all-open') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-white/60 font-medium mb-1">Açık iş yok</p>
        <p className="text-white/25 text-sm max-w-xs">
          Yeni bir karar veya yapılacak iş ekleyerek ortak hafızayı güncel tutabilirsiniz.
        </p>
      </div>
    );
  }

  if (variant === 'filtered') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-white/30 text-sm">Bu filtre için açık iş yok.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-white/30 text-sm">Henüz tamamlanan iş yok.</p>
    </div>
  );
}
