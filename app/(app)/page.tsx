import { Suspense } from 'react';
import { getWorkspaceUser } from '@/lib/auth';
import { getOpenWorkItems } from '@/lib/db/queries/work-items';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import WorkItemList from '@/components/work-items/WorkItemList';
import FilterTabs from '@/components/work-items/FilterTabs';
import AddWorkItemForm from '@/components/work-items/AddWorkItemForm';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { filter } = await searchParams;
  const currentUser = await getWorkspaceUser();

  const workspaceMembers = await db
    .select()
    .from(users)
    .where(eq(users.workspaceId, currentUser.workspaceId));

  let assigneeFilter: string | undefined;
  if (filter === 'mine') assigneeFilter = currentUser.id;
  else if (filter === 'theirs') {
    const other = workspaceMembers.find((m) => m.id !== currentUser.id);
    assigneeFilter = other?.id;
  }

  const items = await getOpenWorkItems(currentUser.workspaceId, assigneeFilter);

  const isFiltered = filter === 'mine' || filter === 'theirs';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Suspense fallback={<div className="h-8" />}>
          <FilterTabs />
        </Suspense>
        <AddWorkItemForm members={workspaceMembers} />
      </div>
      <WorkItemList items={items} members={workspaceMembers} isFiltered={isFiltered} />
    </div>
  );
}
