import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceUser } from '@/lib/auth';
import { updateWorkItem, archiveWorkItem } from '@/lib/db/queries/work-items';
import { updateWorkItemSchema } from '@/lib/validations';
import type { Priority } from '@/lib/db/schema';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateWorkItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const item = await updateWorkItem(user.workspaceId, id, {
    ...parsed.data,
    priority: parsed.data.priority as Priority | undefined,
  });

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const item = await archiveWorkItem(user.workspaceId, id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}
