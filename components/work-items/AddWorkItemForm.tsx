'use client';

import { useState, useTransition, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { createWorkItemAction } from '@/actions/work-items';
import type { User } from '@/lib/db/schema';

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Acil', color: 'text-red-400' },
  { value: 'important', label: 'Önemli', color: 'text-amber-400' },
  { value: 'later', label: 'Bekleyebilir', color: 'text-white/40' },
];

export default function AddWorkItemForm({ members }: { members: User[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assigneeUserId, setAssigneeUserId] = useState(members[0]?.id ?? '');
  const [priority, setPriority] = useState('important');
  const [titleError, setTitleError] = useState('');
  const [, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle('');
    setPriority('important');
    setTitleError('');
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Başlık zorunludur.');
      titleRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const result = await createWorkItemAction({ title: title.trim(), assigneeUserId, priority });
      if (result.error) { toast.error(result.error); return; }
      toast.success('İş eklendi.');
      reset();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        Yeni İş
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setOpen(false); reset(); }} />
          <div className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white">Yeni İş Ekle</h2>
              <button
                onClick={() => { setOpen(false); reset(); }}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Başlık</label>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError('');
                  }}
                  placeholder="Yapılacak iş veya alınan karar..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/8 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
                {titleError && <p className="text-xs text-red-400">{titleError}</p>}
              </div>

              {/* Bottom row: assignee + priority + submit */}
              <div className="flex items-center gap-2">
                {/* Assignee */}
                <select
                  value={assigneeUserId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssigneeUserId(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#1a1a1a]">{m.name}</option>
                  ))}
                </select>

                {/* Priority */}
                <select
                  value={priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value} className="bg-[#1a1a1a]">{p.label}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-all whitespace-nowrap"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
