'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const FILTERS = [
  { key: 'all', label: 'Tüm işler' },
  { key: 'mine', label: 'Benim' },
  { key: 'theirs', label: 'Diğer' },
] as const;

export default function FilterTabs() {
  const searchParams = useSearchParams();
  const active = searchParams.get('filter') ?? 'all';

  return (
    <div className="flex gap-1 overflow-x-auto">
      {FILTERS.map((f) => (
        <Link
          key={f.key}
          href={f.key === 'all' ? '/' : `/?filter=${f.key}`}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            active === f.key
              ? 'bg-white/12 text-white'
              : 'text-white/35 hover:text-white/60 hover:bg-white/6'
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
