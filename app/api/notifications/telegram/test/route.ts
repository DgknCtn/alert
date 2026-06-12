import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceUser } from '@/lib/auth';
import { getNotificationSettings } from '@/lib/db/queries/notifications';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const user = await getWorkspaceUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Allow passing token/chatId directly for first-time test before saving
  const body = await req.json().catch(() => ({}));
  let botToken: string | null = body.botToken ?? null;
  let chatId: string | null = body.chatId ?? null;

  if (!botToken || !chatId) {
    const settings = await getNotificationSettings(user.workspaceId);
    botToken = botToken ?? settings?.telegramBotToken ?? null;
    chatId = chatId ?? settings?.telegramChatId ?? null;
  }

  if (!botToken || !chatId) {
    return NextResponse.json(
      { success: false, error: 'Bot token ve Chat ID gereklidir.' },
      { status: 400 }
    );
  }

  const result = await sendTelegramMessage(
    botToken,
    chatId,
    'Ortak İş Takip günlük özet bildirimi başarıyla bağlandı. ✅'
  );

  return NextResponse.json(result);
}
