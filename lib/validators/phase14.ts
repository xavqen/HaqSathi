import { z } from 'zod'

export const slaTrackSchema = z.object({
  complaintId: z.string().optional().nullable(),
  title: z.string().min(3, 'Title required').max(120),
  stage: z.string().min(2).max(80),
  targetDate: z.string().min(8),
  nextAction: z.string().min(5).max(500),
  riskNote: z.string().max(500).optional().nullable()
})

export const agentInvoiceSchema = z.object({
  agentClientId: z.string().optional().nullable(),
  clientName: z.string().min(2).max(120),
  serviceName: z.string().min(2).max(160),
  amount: z.coerce.number().min(0).max(1000000),
  notes: z.string().max(800).optional().nullable()
})

export const promptTestRunSchema = z.object({
  name: z.string().min(3).max(120),
  tool: z.string().min(2).max(80),
  input: z.string().min(3).max(4000),
  output: z.string().min(3).max(8000),
  score: z.coerce.number().int().min(0).max(100),
  issueNotes: z.string().max(1000).optional().nullable()
})
