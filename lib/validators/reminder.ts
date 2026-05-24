import { z } from 'zod'

export const reminderSchema = z.object({
  title: z.string().min(3).max(160),
  dueDate: z.string().min(8),
  relatedComplaintId: z.string().optional().or(z.literal(''))
})

export type ReminderInput = z.infer<typeof reminderSchema>
