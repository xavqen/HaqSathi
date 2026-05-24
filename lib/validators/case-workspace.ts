import { z } from 'zod'

export const caseTaskSchema = z.object({
  complaintId: z.string().optional().transform((v) => v || undefined),
  title: z.string().min(3).max(180),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional().transform((v) => v || undefined),
  notes: z.string().max(1000).optional()
})

export const caseNoteSchema = z.object({
  complaintId: z.string().optional().transform((v) => v || undefined),
  title: z.string().min(3).max(180),
  body: z.string().min(5).max(5000),
  visibility: z.enum(['PRIVATE', 'TEAM']).default('PRIVATE')
})

export const aiOutputReviewSchema = z.object({
  tool: z.string().min(2).max(120),
  sourceId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  issueType: z.enum(['GOOD', 'WRONG_FACT', 'UNSAFE', 'CONFUSING', 'MISSING_STEPS', 'OTHER']),
  comment: z.string().max(2000).optional()
})
