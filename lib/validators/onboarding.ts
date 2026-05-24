import { z } from 'zod'

export const onboardingSchema = z.object({
  completedSteps: z.array(z.enum(['PROFILE', 'FIRST_COMPLAINT', 'FIRST_REMINDER', 'DOCUMENTS', 'SCHEME_SEARCH'])).default([]),
  preferredState: z.string().max(80).optional().nullable(),
  mainGoal: z.enum(['COMPLAINT', 'REFUND', 'UPI_HELP', 'SCHEME', 'DOCUMENTS', 'OTHER']).default('COMPLAINT'),
  language: z.enum(['HINGLISH', 'HINDI', 'ENGLISH']).default('HINGLISH')
})
