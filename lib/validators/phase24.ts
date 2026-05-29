import { z } from 'zod'

export const documentReaderSchema = z.object({
  documentType: z.string().min(2).max(80),
  sourceType: z.enum(['TEXT', 'SCREENSHOT_TEXT', 'INVOICE_TEXT', 'BANK_SMS', 'EMAIL_TEXT']).default('TEXT'),
  rawText: z.string().min(20).max(12000),
  language: z.string().optional()
})

export const caseCoachSchema = z.object({
  complaintId: z.string().optional(),
  caseType: z.string().min(2).max(100),
  companyName: z.string().optional(),
  amount: z.string().optional(),
  issueDate: z.string().optional(),
  transactionId: z.string().optional(),
  complaintDraft: z.string().min(20).max(12000),
  evidenceAvailable: z.string().optional(),
  previousReply: z.string().optional(),
  goal: z.string().optional(),
  language: z.string().optional()
})

export const followUpAutomationSchema = z.object({
  complaintId: z.string().optional(),
  caseTitle: z.string().min(2).max(140),
  caseType: z.string().min(2).max(100),
  companyName: z.string().optional(),
  referenceId: z.string().optional(),
  startDate: z.string().min(1),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'CALL', 'APP_REMINDER']).default('EMAIL'),
  urgency: z.enum(['NORMAL', 'HIGH', 'FRAUD']).default('NORMAL'),
  preferredLanguage: z.string().optional()
})

export type DocumentReaderInput = z.infer<typeof documentReaderSchema>
export type CaseCoachInput = z.infer<typeof caseCoachSchema>
export type FollowUpAutomationInput = z.infer<typeof followUpAutomationSchema>
