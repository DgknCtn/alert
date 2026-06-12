'use server';

import { revalidatePath } from 'next/cache';
import { getWorkspaceUser } from '@/lib/auth';
import { upsertNotificationSettings } from '@/lib/db/queries/notifications';
import { notificationSettingsSchema } from '@/lib/validations';

export async function saveNotificationSettingsAction(data: {
  telegramBotToken?: string;
  telegramChatId?: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
  timezone: string;
}) {
  const user = await getWorkspaceUser();
  const parsed = notificationSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await upsertNotificationSettings(user.workspaceId, parsed.data);
  revalidatePath('/settings');
  return { success: true };
}
