'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import PriorityBadge from './PriorityBadge';
import {
  completeWorkItemAction,
  reopenWorkItemAction,
  archiveWorkItemAction,
  updateWorkItemAction,
} from '@/actions/work-items';
import type { WorkItem, User, Priority } from '@/lib/db/schema';

type WorkItemWithAssignee = WorkItem & { assignee: User };

export default function WorkItemRow({ item, members }: { item: WorkItemWithAssignee; members: User[] }) {
  const [hidden, setHidden] = useState(false);
  const [, startTransition] = useTransition();

  function handleComplete() {
    setHidden(true);
    const toastId = toast('İş tamamlandı.', {
      action: {
        label: 'Geri al',
        onClick: () => {
          setHidden(false);
          toast.dismiss(toastId);
          startTransition(async () => { await reopenWorkItemAction(item.id); });
        },
      },
      duration: 5000,
      onAutoClose: () => { startTransition(async () => { await completeWorkItemAction(item.id); }); },
      onDismiss: () => { startTransition(async () => { await completeWorkItemAction(item.id); }); },
    });
  }

  function handlePriorityChange(priority: Priority) {
    startTransition(async () => { await updateWorkItemAction(item.id, { priority }); });
  }

  function handleAssigneeChange(assigneeUserId: string) {
    startTransition(async () => { await updateWorkItemAction(item.id, { assigneeUserId }); });
  }

  function handleArchive() {
    startTransition(async () => {
      await archiveWorkItemAction(item.id);
      toast('Arşivlendi.');
    });
  }

  if (hidden) return null;

  return (
    <div className="flex items-start gap-3 py-3 group">
      {/* Complete button */}
      <button
        onClick={handleComplete}
        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/8 transition-all flex items-center justify-center"
        title="Tamamlandı"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white/30 transition-all" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 leading-snug break-words">{item.title}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <PriorityBadge priority={item.priority} />
          <span className="text-[11px] text-white/25">{item.assignee.name}</span>
        </div>
      </div>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity h-6 w-6 rounded-md flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/8 flex-shrink-0">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white/80 text-sm min-w-44">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-white/60 hover:text-white hover:bg-white/6 text-xs">Öncelik değiştir</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1a1a] border-white/10 text-white/80">
              {(['urgent', 'important', 'later'] as Priority[]).map((p) => (
                <DropdownMenuItem key={p} onClick={() => handlePriorityChange(p)} className="text-xs text-white/60 hover:text-white hover:bg-white/6 cursor-pointer">
                  {p === 'urgent' ? 'Acil' : p === 'important' ? 'Önemli' : 'Bekleyebilir'}
                  {item.priority === p && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-white/60 hover:text-white hover:bg-white/6 text-xs">Sorumlu değiştir</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1a1a] border-white/10 text-white/80">
              {members.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => handleAssigneeChange(m.id)} className="text-xs text-white/60 hover:text-white hover:bg-white/6 cursor-pointer">
                  {m.name}{m.id === item.assigneeUserId && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator className="bg-white/8" />
          <DropdownMenuItem onClick={handleArchive} className="text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/8 cursor-pointer">
            Arşivle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
