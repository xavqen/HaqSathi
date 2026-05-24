import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().min(5).max(140),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(20).max(300),
  metaTitle: z.string().min(10).max(80),
  metaDescription: z.string().min(30).max(180),
  category: z.string().min(2).max(80),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  intro: z.string().min(30).max(3000),
  sections: z.array(z.object({ heading: z.string().min(3).max(120), body: z.string().min(10).max(3000), bullets: z.array(z.string().max(200)).optional() })).min(1).max(12),
  faqs: z.array(z.object({ question: z.string().min(5).max(160), answer: z.string().min(5).max(800) })).max(8).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED')
})
