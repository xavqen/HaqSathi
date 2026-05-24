import { z } from 'zod'

export const chatInputSchema = z.object({
  message: z.string().min(4, 'Message thoda detail me likho').max(1500),
  sessionId: z.string().optional().or(z.literal(''))
})

export type ChatInput = z.infer<typeof chatInputSchema>
