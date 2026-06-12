import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceUser } from '@/lib/auth';
import { reopenWorkItem } from '@/lib/db/queries/work-items';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const item = await reopenWorkItem(user.workspaceId, id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}
