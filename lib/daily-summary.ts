import type { WorkItem, User } from './db/schema';

export type WorkItemWithAssignee = WorkItem & { assignee: User };

export function buildDailySummaryMessage(items: WorkItemWithAssignee[]): string {
  if (items.length === 0) {
    return 'Bugün açık iş kalmadı. Güzel iş. ✅';
  }

  const groups = {
    urgent: items.filter((i) => i.priority === 'urgent'),
    important: items.filter((i) => i.priority === 'important'),
    later: items.filter((i) => i.priority === 'later'),
  };

  const fmt = (item: WorkItemWithAssignee) => `• ${item.title} — ${item.assignee.name}`;

  const lines: string[] = ['<b>Günlük İş Özeti</b>', ''];

  if (groups.urgent.length) {
    lines.push('<b>Acil:</b>', ...groups.urgent.map(fmt), '');
  }
  if (groups.important.length) {
    lines.push('<b>Önemli:</b>', ...groups.important.map(fmt), '');
  }
  if (groups.later.length) {
    lines.push('<b>Bekleyebilir:</b>', ...groups.later.map(fmt), '');
  }

  lines.push(`Toplam açık iş: ${items.length}`);
  lines.push('');
  lines.push('Detaylar için uygulamayı aç.');

  return lines.join('\n');
}

export function isTimeToSend(timezone: string, scheduledTime: string): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const currentTime = `${hour}:${minute}`;
  return currentTime === scheduledTime;
}
