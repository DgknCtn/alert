import { getWorkspaceUser } from '@/lib/auth';
import { getNotificationSettings } from '@/lib/db/queries/notifications';
import TelegramSettingsForm from '@/components/settings/TelegramSettingsForm';

export default async function SettingsPage() {
  const user = await getWorkspaceUser();

  let rawSettings = null;
  let debugError: string | null = null;

  try {
    rawSettings = await getNotificationSettings(user.workspaceId);
  } catch (e) {
    debugError = e instanceof Error ? e.message + '\n' + e.stack : String(e);
  }

  if (debugError) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-xs font-mono whitespace-pre-wrap">{debugError}</p>
      </div>
    );
  }

  const settings = rawSettings
    ? {
        telegramBotToken: rawSettings.telegramBotToken,
        telegramChatId: rawSettings.telegramChatId,
        dailySummaryEnabled: rawSettings.dailySummaryEnabled,
        dailySummaryTime: rawSettings.dailySummaryTime,
        timezone: rawSettings.timezone,
        hasBotToken: !!rawSettings.telegramBotToken,
      }
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-semibold text-white/70">Ayarlar</h1>
      </div>
      <TelegramSettingsForm initial={settings} />
    </div>
  );
}
