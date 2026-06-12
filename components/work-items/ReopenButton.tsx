'use client';

import { useTransition } from 'react';
import { reopenWorkItemAction } from '@/actions/work-items';
import { toast } from 'sonner';

export default function ReopenButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleReopen() {
    startTransition(async () => {
      await reopenWorkItemAction(itemId);
      toast.success('İş yeniden açıldı.');
    });
  }

  return (
    <button
      onClick={handleReopen}
      disabled={isPending}
      className="text-[11px] text-white/25 hover:text-white/50 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap px-2 py-1 rounded-md hover:bg-white/6"
    >
      Yeniden Aç
    </button>
  );
}
