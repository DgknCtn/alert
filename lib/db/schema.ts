import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['urgent', 'important', 'later']);
export const statusEnum = pgEnum('status', ['open', 'completed']);

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(), // same UUID as Supabase Auth user
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('users_workspace_idx').on(t.workspaceId)]
);

export const workItems = pgTable(
  'work_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    title: text('title').notNull(),
    assigneeUserId: uuid('assignee_user_id')
      .notNull()
      .references(() => users.id),
    priority: priorityEnum('priority').notNull(),
    status: statusEnum('status').notNull().default('open'),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id),
    description: text('description'), // null for MVP, reserved for v2
    completedAt: timestamp('completed_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('wi_workspace_status_idx').on(t.workspaceId, t.status),
    index('wi_assignee_idx').on(t.assigneeUserId),
  ]
);

export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .unique()
    .references(() => workspaces.id),
  telegramBotTokenEncrypted: text('telegram_bot_token_encrypted'),
  telegramChatId: text('telegram_chat_id'),
  dailySummaryEnabled: boolean('daily_summary_enabled').notNull().default(false),
  dailySummaryTime: text('daily_summary_time').notNull().default('18:00'),
  timezone: text('timezone').notNull().default('Europe/Istanbul'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type User = typeof users.$inferSelect;
export type WorkItem = typeof workItems.$inferSelect;
export type NotificationSettings = typeof notificationSettings.$inferSelect;

export type Priority = 'urgent' | 'important' | 'later';
export type Status = 'open' | 'completed';
