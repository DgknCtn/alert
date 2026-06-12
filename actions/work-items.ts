'use server';

import { revalidatePath } from 'next/cache';
import { getWorkspaceUser } from '@/lib/auth';
import {
  createWorkItem,
  updateWorkItem,
  completeWorkItem,
  reopenWorkItem,
  archiveWorkItem,
} from '@/lib/db/queries/work-items';
import { createWorkItemSchema, updateWorkItemSchema } from '@/lib/validations';
import type { Priority } from '@/lib/db/schema';

export async function createWorkItemAction(data: {
  title: string;
  assigneeUserId: string;
  priority: string;
}) {
  const user = await getWorkspaceUser();
  const parsed = createWorkItemSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const item = await createWorkItem(user.workspaceId, {
    ...parsed.data,
    priority: parsed.data.priority as Priority,
    createdByUserId: user.id,
  });

  revalidatePath('/');
  return { success: true, item };
}

export async function updateWorkItemAction(
  id: string,
  data: { title?: string; priority?: string; assigneeUserId?: string }
) {
  const user = await getWorkspaceUser();
  const parsed = updateWorkItemSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const item = await updateWorkItem(user.workspaceId, id, {
    ...parsed.data,
    priority: parsed.data.priority as Priority | undefined,
  });

  revalidatePath('/');
  revalidatePath('/completed');
  return { success: true, item };
}

export async function completeWorkItemAction(id: string) {
  const user = await getWorkspaceUser();
  await completeWorkItem(user.workspaceId, id);
  revalidatePath('/');
  return { success: true };
}

export async function reopenWorkItemAction(id: string) {
  const user = await getWorkspaceUser();
  await reopenWorkItem(user.workspaceId, id);
  revalidatePath('/');
  revalidatePath('/completed');
  return { success: true };
}

export async function archiveWorkItemAction(id: string) {
  const user = await getWorkspaceUser();
  await archiveWorkItem(user.workspaceId, id);
  revalidatePath('/');
  revalidatePath('/completed');
  return { success: true };
}
