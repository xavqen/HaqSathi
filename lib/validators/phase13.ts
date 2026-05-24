import { z } from 'zod'

export const callScriptSchema = z.object({
  issueType: z.string().min(2).max(80),
  authorityType: z.string().min(2).max(80),
  language: z.enum(['HINGLISH', 'HINDI', 'ENGLISH']).default('HINGLISH'),
  caseSummary: z.string().min(20).max(2500),
  desiredOutcome: z.string().min(5).max(500),
  previousAttempts: z.string().max(1000).optional().default('')
})

export const communicationLogSchema = z.object({
  complaintId: z.string().optional().or(z.literal('')),
  channel: z.string().min(2).max(40),
  recipientName: z.string().min(2).max(120),
  recipientContact: z.string().max(160).optional().or(z.literal('')),
  subject: z.string().min(3).max(180),
  message: z.string().min(10).max(5000),
  direction: z.enum(['OUTBOUND', 'INBOUND']).default('OUTBOUND'),
  status: z.enum(['PLANNED', 'SENT', 'REPLIED', 'FAILED', 'NO_RESPONSE']).default('PLANNED'),
  nextFollowUpAt: z.string().optional().or(z.literal(''))
})

export const caseOutcomeSchema = z.object({
  complaintId: z.string().optional().or(z.literal('')),
  outcomeType: z.string().min(2).max(80),
  amountRecovered: z.coerce.number().min(0).max(99999999).optional().or(z.literal('')),
  resolutionDate: z.string().optional().or(z.literal('')),
  summary: z.string().min(10).max(3000),
  learning: z.string().max(2000).optional().or(z.literal('')),
  publicStory: z.coerce.boolean().optional().default(false)
})

export const authorityBookmarkSchema = z.object({
  authorityId: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal(''))
})
