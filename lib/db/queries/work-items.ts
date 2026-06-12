import { db } from '../index';
import { workItems, users } from '../schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import type { Priority } from '../schema';

const priorityOrder = sql<number>`CASE ${workItems.priority}
  WHEN 'urgent' THEN 1
  WHEN 'important' THEN 2
  WHEN 'later' THEN 3
  ELSE 4
END`;

export async function getOpenWorkItems(workspaceId: string, assigneeUserId?: string) {
  const conditions = [
    eq(workItems.workspaceId, workspaceId),
    eq(workItems.status, 'open'),
    isNull(workItems.archivedAt),
  ];

  if (assigneeUserId) {
    conditions.push(eq(workItems.assigneeUserId, assigneeUserId));
  }

  return db
    .select({
      id: workItems.id,
      workspaceId: workItems.workspaceId,
      title: workItems.title,
      priority: workItems.priority,
      status: workItems.status,
      createdByUserId: workItems.createdByUserId,
      description: workItems.description,
      completedAt: workItems.completedAt,
      archivedAt: workItems.archivedAt,
      createdAt: workItems.createdAt,
      updatedAt: workItems.updatedAt,
      assigneeUserId: workItems.assigneeUserId,
      assignee: {
        id: users.id,
        name: users.name,
        email: users.email,
        workspaceId: users.workspaceId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      },
    })
    .from(workItems)
    .innerJoin(users, eq(workItems.assigneeUserId, users.id))
    .where(and(...conditions))
    .orderBy(priorityOrder, sql`${workItems.createdAt} DESC`);
}

export async function getCompletedWorkItems(workspaceId: string) {
  return db
    .select({
      id: workItems.id,
      workspaceId: workItems.workspaceId,
      title: workItems.title,
      priority: workItems.priority,
      status: workItems.status,
      createdByUserId: workItems.createdByUserId,
      description: workItems.description,
      completedAt: workItems.completedAt,
      archivedAt: workItems.archivedAt,
      createdAt: workItems.createdAt,
      updatedAt: workItems.updatedAt,
      assigneeUserId: workItems.assigneeUserId,
      assignee: {
        id: users.id,
        name: users.name,
        email: users.email,
        workspaceId: users.workspaceId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      },
    })
    .from(workItems)
    .innerJoin(users, eq(workItems.assigneeUserId, users.id))
    .where(
      and(
        eq(workItems.workspaceId, workspaceId),
        eq(workItems.status, 'completed'),
        isNull(workItems.archivedAt)
      )
    )
    .orderBy(sql`${workItems.completedAt} DESC`);
}

export async function createWorkItem(
  workspaceId: string,
  data: {
    title: string;
    assigneeUserId: string;
    priority: Priority;
    createdByUserId: string;
  }
) {
  const [item] = await db
    .insert(workItems)
    .values({
      workspaceId,
      title: data.title,
      assigneeUserId: data.assigneeUserId,
      priority: data.priority,
      createdByUserId: data.createdByUserId,
      status: 'open',
    })
    .returning();
  return item;
}

export async function updateWorkItem(
  workspaceId: string,
  id: string,
  data: { title?: string; priority?: Priority; assigneeUserId?: string }
) {
  const [item] = await db
    .update(workItems)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId)))
    .returning();
  return item;
}

export async function completeWorkItem(workspaceId: string, id: string) {
  const [item] = await db
    .update(workItems)
    .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId)))
    .returning();
  return item;
}

export async function reopenWorkItem(workspaceId: string, id: string) {
  const [item] = await db
    .update(workItems)
    .set({ status: 'open', completedAt: null, updatedAt: new Date() })
    .where(and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId)))
    .returning();
  return item;
}

export async function archiveWorkItem(workspaceId: string, id: string) {
  const [item] = await db
    .update(workItems)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId)))
    .returning();
  return item;
}
