import WorkItemRow from './WorkItemRow';
import EmptyState from './EmptyState';
import type { WorkItem, User } from '@/lib/db/schema';

type WorkItemWithAssignee = WorkItem & { assignee: User };

interface WorkItemListProps {
  items: WorkItemWithAssignee[];
  members: User[];
  isFiltered: boolean;
}

function PrioritySection({ label, items, members }: { label: string; items: WorkItemWithAssignee[]; members: User[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-1 px-0">
        {label}
      </h2>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <WorkItemRow key={item.id} item={item} members={members} />
        ))}
      </div>
    </div>
  );
}

export default function WorkItemList({ items, members, isFiltered }: WorkItemListProps) {
  const urgent = items.filter((i) => i.priority === 'urgent');
  const important = items.filter((i) => i.priority === 'important');
  const later = items.filter((i) => i.priority === 'later');

  if (items.length === 0) {
    return <EmptyState variant={isFiltered ? 'filtered' : 'all-open'} />;
  }

  return (
    <div>
      {urgent.length >= 5 && (
        <div className="mb-5 px-3 py-2.5 bg-red-500/8 border border-red-500/15 rounded-xl text-xs text-red-400/80">
          Çok fazla acil iş var — gerçekten bugün yapılması gerekenleri ayırmayı düşün.
        </div>
      )}
      <PrioritySection label="Acil" items={urgent} members={members} />
      <PrioritySection label="Önemli" items={important} members={members} />
      <PrioritySection label="Bekleyebilir" items={later} members={members} />
    </div>
  );
}
