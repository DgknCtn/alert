export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="h-7 w-20 rounded-lg bg-white/5" />
      </div>
      <div className="space-y-0 divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 py-3">
            <div className="h-4 w-4 rounded-full bg-white/5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
