import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceUser } from '@/lib/auth';
import {
  getNotificationSettings,
  upsertNotificationSettings,
} from '@/lib/db/queries/notifications';
import { notificationSettingsSchema } from '@/lib/validations';

export async function GET() {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getNotificationSettings(user.workspaceId);

  // Mask bot token — only show last 4 chars
  if (settings?.telegramBotToken) {
    const token = settings.telegramBotToken;
    return NextResponse.json({
      ...settings,
      telegramBotToken: `****${token.slice(-4)}`,
      hasBotToken: true,
    });
  }

  return NextResponse.json({ ...settings, hasBotToken: false });
}

export async function PUT(req: NextRequest) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = notificationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const settings = await upsertNotificationSettings(user.workspaceId, parsed.data);
  return NextResponse.json(settings);
}
