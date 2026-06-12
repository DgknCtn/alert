import { z } from 'zod';

export const createWorkItemSchema = z.object({
  title: z.string().min(1, 'Başlık zorunludur').max(500, 'Başlık en fazla 500 karakter olabilir'),
  assigneeUserId: z.string().uuid('Geçerli bir kullanıcı seçin'),
  priority: z.enum(['urgent', 'important', 'later'], {
    message: 'Geçerli bir öncelik seçin',
  }),
});

export const updateWorkItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  assigneeUserId: z.string().uuid().optional(),
  priority: z.enum(['urgent', 'important', 'later']).optional(),
});

export const notificationSettingsSchema = z.object({
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  dailySummaryEnabled: z.boolean(),
  dailySummaryTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM formatında giriniz'),
  timezone: z.string().min(1),
});

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
