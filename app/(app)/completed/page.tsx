import { getWorkspaceUser } from '@/lib/auth';
import { getCompletedWorkItems } from '@/lib/db/queries/work-items';
import EmptyState from '@/components/work-items/EmptyState';
import PriorityBadge from '@/components/work-items/PriorityBadge';
import ReopenButton from '@/components/work-items/ReopenButton';

export default async function CompletedPage() {
  const currentUser = await getWorkspaceUser();
  const items = await getCompletedWorkItems(currentUser.workspaceId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-semibold text-white/70">Tamamlananlar</h1>
        <span className="text-xs text-white/20">{items.length} iş</span>
      </div>

      {items.length === 0 ? (
        <EmptyState variant="completed" />
      ) : (
        <div className="divide-y divide-white/5">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-3 group">
              <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/30 line-through leading-snug break-words">{item.title}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[11px] text-white/20">{item.assignee.name}</span>
                  {item.completedAt && (
                    <span className="text-[11px] text-white/15">
                      {new Date(item.completedAt).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>
              <ReopenButton itemId={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
