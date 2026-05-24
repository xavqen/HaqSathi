import { z } from 'zod'

export const feedbackSchema = z.object({
  entity: z.string().min(2).max(80),
  entityId: z.string().max(160).optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal(''))
})
