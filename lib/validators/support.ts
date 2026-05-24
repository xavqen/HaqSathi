import { z } from 'zod'

export const supportTicketSchema = z.object({
  subject: z.string().min(5).max(140),
  category: z.enum(['ACCOUNT', 'BILLING', 'BUG', 'AI_OUTPUT', 'OTHER']).default('OTHER'),
  message: z.string().min(10).max(2000)
})
