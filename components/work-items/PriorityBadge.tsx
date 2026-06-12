import type { Priority } from '@/lib/db/schema';

const CONFIG: Record<Priority, { label: string; dot: string; text: string; bg: string }> = {
  urgent: {
    label: 'Acil',
    dot: 'bg-red-500',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  important: {
    label: 'Önemli',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  later: {
    label: 'Bekleyebilir',
    dot: 'bg-white/20',
    text: 'text-white/35',
    bg: 'bg-white/5',
  },
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const c = CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
