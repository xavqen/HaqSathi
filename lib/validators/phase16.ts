import { z } from 'zod'

export const partnerLeadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  role: z.string().min(2).max(60),
  expectedUse: z.string().max(500).optional()
})

export const verificationRequestSchema = z.object({
  title: z.string().min(3).max(160),
  category: z.string().min(2).max(80),
  sourceType: z.string().min(2).max(80),
  sourceId: z.string().optional(),
  userQuestion: z.string().min(10).max(1000),
  aiOutput: z.string().max(5000).optional()
})

export const printJobSchema = z.object({
  title: z.string().min(3).max(160),
  jobType: z.string().min(2).max(80),
  copies: z.coerce.number().int().min(1).max(20),
  payload: z.record(z.any()).default({})
})

export const knowledgeFeedbackSchema = z.object({
  articleId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(800).optional()
})
