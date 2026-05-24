import { z } from 'zod'

export const notificationPreferenceSchema = z.object({
  emailReminders: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
  productUpdates: z.boolean().default(false),
  whatsappPlaceholder: z.boolean().default(false),
  smsPlaceholder: z.boolean().default(false),
  language: z.enum(['HINGLISH', 'HINDI', 'ENGLISH']).default('HINGLISH')
})
