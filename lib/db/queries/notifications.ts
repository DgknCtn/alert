import { db } from '../index';
import { notificationSettings } from '../schema';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '../../crypto';

export async function getNotificationSettings(workspaceId: string) {
  const [settings] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.workspaceId, workspaceId))
    .limit(1);

  if (!settings) return null;

  return {
    ...settings,
    telegramBotToken: settings.telegramBotTokenEncrypted
      ? (() => { try { return decrypt(settings.telegramBotTokenEncrypted!); } catch { return null; } })()
      : null,
    telegramBotTokenEncrypted: undefined,
  };
}

export async function upsertNotificationSettings(
  workspaceId: string,
  data: {
    telegramBotToken?: string;
    telegramChatId?: string;
    dailySummaryEnabled: boolean;
    dailySummaryTime: string;
    timezone: string;
  }
) {
  const encryptedToken = data.telegramBotToken ? encrypt(data.telegramBotToken) : undefined;

  const existing = await db
    .select({ id: notificationSettings.id })
    .from(notificationSettings)
    .where(eq(notificationSettings.workspaceId, workspaceId))
    .limit(1);

  const values = {
    telegramChatId: data.telegramChatId,
    dailySummaryEnabled: data.dailySummaryEnabled,
    dailySummaryTime: data.dailySummaryTime,
    timezone: data.timezone,
    updatedAt: new Date(),
    ...(encryptedToken !== undefined && { telegramBotTokenEncrypted: encryptedToken }),
  };

  if (existing.length > 0) {
    const [updated] = await db
      .update(notificationSettings)
      .set(values)
      .where(eq(notificationSettings.workspaceId, workspaceId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(notificationSettings)
      .values({ workspaceId, ...values })
      .returning();
    return created;
  }
}

export async function getAllEnabledNotificationSettings() {
  const rows = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.dailySummaryEnabled, true));

  return rows.map((row) => ({
    ...row,
    telegramBotToken: row.telegramBotTokenEncrypted
      ? (() => { try { return decrypt(row.telegramBotTokenEncrypted!); } catch { return null; } })()
      : null,
  }));
}
