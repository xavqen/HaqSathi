import { z } from 'zod'

export const templateCreateSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(140).regex(/^[a-z0-9-]+$/),
  category: z.string().min(2).max(80),
  intent: z.string().min(8).max(400),
  language: z.string().min(2).max(40).default('ENGLISH'),
  body: z.string().min(20).max(5000),
  variables: z.array(z.string().min(1).max(50)).max(20),
  isPremium: z.boolean().default(false)
})

export const templateUseSchema = z.object({
  slug: z.string().min(3).max(140),
  inputs: z.record(z.string().max(500)).default({})
})
