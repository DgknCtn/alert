import { getWorkspaceUser } from '@/lib/auth';
import { getNotificationSettings } from '@/lib/db/queries/notifications';
import TelegramSettingsForm from '@/components/settings/TelegramSettingsForm';

export default async function SettingsPage() {
  const user = await getWorkspaceUser();
  const rawSettings = await getNotificationSettings(user.workspaceId);

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
