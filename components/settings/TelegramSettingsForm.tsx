'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveNotificationSettingsAction } from '@/actions/notifications';

interface Props {
  initial: {
    telegramBotToken: string | null;
    telegramChatId: string | null;
    dailySummaryEnabled: boolean;
    dailySummaryTime: string;
    timezone: string;
    hasBotToken?: boolean;
  } | null;
}

const TIMEZONES = [
  { value: 'Europe/Istanbul', label: 'İstanbul (UTC+3)' },
  { value: 'Europe/London', label: 'Londra (UTC+0/+1)' },
  { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
];

export default function TelegramSettingsForm({ initial }: Props) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState(initial?.telegramChatId ?? '');
  const [enabled, setEnabled] = useState(initial?.dailySummaryEnabled ?? false);
  const [summaryTime, setSummaryTime] = useState(initial?.dailySummaryTime ?? '18:00');
  const [timezone, setTimezone] = useState(initial?.timezone ?? 'Europe/Istanbul');
  const [, startTransition] = useTransition();
  const [testLoading, setTestLoading] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveNotificationSettingsAction({
        telegramBotToken: botToken || undefined,
        telegramChatId: chatId || undefined,
        dailySummaryEnabled: enabled,
        dailySummaryTime: summaryTime,
        timezone,
      });
      if (result.error) { toast.error(result.error); return; }
      toast.success('Ayarlar kaydedildi.');
      setBotToken('');
    });
  }

  async function handleTest() {
    setTestLoading(true);
    try {
      const res = await fetch('/api/notifications/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken || undefined, chatId: chatId || undefined }),
      });
      const data = await res.json();
      if (data.ok) toast.success('Test mesajı gönderildi!');
      else toast.error(`Hata: ${data.error ?? 'Bilinmeyen hata'}`);
    } catch {
      toast.error('Bağlantı hatası.');
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-md">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-white/80">Telegram Bildirimleri</h2>
        <p className="text-xs text-white/30">Günlük iş özetini Telegram üzerinden almak için bot bilgilerini girin.</p>
      </div>

      <div className="space-y-4 p-4 bg-white/3 border border-white/8 rounded-xl">
        <Field label="Bot Token" hint="@BotFather'dan alınan token">
          <input
            type="password"
            value={botToken}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBotToken(e.target.value)}
            placeholder={initial?.hasBotToken ? `****${initial.telegramBotToken?.slice(-4) ?? ''}` : 'Token girin...'}
            className={inputCls}
          />
        </Field>

        <Field label="Chat ID" hint="Grup veya kullanıcı Chat ID'si">
          <input
            value={chatId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatId(e.target.value)}
            placeholder="-100xxxxxxxxxx"
            className={inputCls}
          />
        </Field>

        <div className="flex gap-3">
          <Field label="Özet Saati" className="w-32">
            <input
              type="time"
              value={summaryTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSummaryTime(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Saat Dilimi" className="flex-1">
            <select
              value={timezone}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimezone(e.target.value)}
              className={inputCls + ' appearance-none cursor-pointer'}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-[#1a1a1a]">{tz.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnabled(e.target.checked)}
            className="w-3.5 h-3.5 accent-white"
          />
          <span className="text-xs text-white/50">Günlük özeti etkinleştir</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-all">
          Kaydet
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={testLoading}
          className="px-4 py-2 bg-white/6 border border-white/10 text-white/60 text-xs font-medium rounded-lg hover:bg-white/10 hover:text-white/80 disabled:opacity-50 transition-all"
        >
          {testLoading ? 'Gönderiliyor...' : 'Test Mesajı'}
        </button>
      </div>
    </form>
  );
}

const inputCls = 'w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-white/20 transition-all';

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label className="text-[11px] font-medium text-white/35 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/20">{hint}</p>}
    </div>
  );
}
