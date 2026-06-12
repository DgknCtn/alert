import { NextRequest, NextResponse } from 'next/server';
import { getAllEnabledNotificationSettings } from '@/lib/db/queries/notifications';
import { getOpenWorkItems } from '@/lib/db/queries/work-items';
import { buildDailySummaryMessage, isTimeToSend } from '@/lib/daily-summary';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const enabledWorkspaces = await getAllEnabledNotificationSettings();
  const results: Array<{ workspaceId: string; sent: boolean; error?: string }> = [];

  for (const settings of enabledWorkspaces) {
    if (!isTimeToSend(settings.timezone, settings.dailySummaryTime)) {
      continue;
    }

    if (!settings.telegramBotToken || !settings.telegramChatId) {
      results.push({ workspaceId: settings.workspaceId, sent: false, error: 'Missing credentials' });
      continue;
    }

    const items = await getOpenWorkItems(settings.workspaceId);
    const message = buildDailySummaryMessage(items);

    const result = await sendTelegramMessage(
      settings.telegramBotToken,
      settings.telegramChatId,
      message
    );

    if (result.ok) {
      console.log(`[daily-summary] Sent to workspace ${settings.workspaceId}`);
      results.push({ workspaceId: settings.workspaceId, sent: true });
    } else {
      console.error(`[daily-summary] Failed for workspace ${settings.workspaceId}: ${result.error}`);
      results.push({ workspaceId: settings.workspaceId, sent: false, error: result.error });
    }
  }

  return NextResponse.json({ results });
}
