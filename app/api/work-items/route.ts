import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceUser } from '@/lib/auth';
import { getOpenWorkItems, getCompletedWorkItems, createWorkItem } from '@/lib/db/queries/work-items';
import { createWorkItemSchema } from '@/lib/validations';
import type { Priority } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? 'open';
  const assigneeId = searchParams.get('assignee') ?? undefined;

  if (status === 'completed') {
    const items = await getCompletedWorkItems(user.workspaceId);
    return NextResponse.json({ items });
  }

  const items = await getOpenWorkItems(user.workspaceId, assigneeId);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createWorkItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const item = await createWorkItem(user.workspaceId, {
    ...parsed.data,
    priority: parsed.data.priority as Priority,
    createdByUserId: user.id,
  });

  return NextResponse.json(item, { status: 201 });
}
