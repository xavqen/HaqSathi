import { z } from 'zod'
import { LANGUAGE_CODES } from '@/lib/i18n/languages'

export const notificationPreferenceSchema = z.object({
  emailReminders: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
  productUpdates: z.boolean().default(false),
  whatsappPlaceholder: z.boolean().default(false),
  smsPlaceholder: z.boolean().default(false),
  language: z.enum(LANGUAGE_CODES).default('ENGLISH')
})
