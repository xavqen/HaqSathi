import { z } from 'zod'

export const smartComplaintWizardSchema = z.object({
  issueType: z.enum(['REFUND', 'UPI_WRONG_TRANSFER', 'UPI_FRAUD', 'BANK_DEBIT', 'ECOMMERCE', 'SERVICE_COMPLAINT', 'SCHOLARSHIP', 'DOCUMENT', 'OTHER']).default('REFUND'),
  companyName: z.string().max(120).optional(),
  referenceId: z.string().max(140).optional(),
  amount: z.string().max(60).optional(),
  issueDate: z.string().max(60).optional(),
  userStory: z.string().min(20).max(12000),
  evidence: z.string().max(8000).optional(),
  previousResponse: z.string().max(8000).optional(),
  desiredResolution: z.string().max(500).optional(),
  urgency: z.enum(['NORMAL', 'HIGH', 'FRAUD_EMERGENCY']).default('NORMAL'),
  language: z.string().default('ENGLISH'),
  userType: z.enum(['INDIVIDUAL', 'FAMILY', 'AGENT']).default('INDIVIDUAL')
})

export type SmartComplaintWizardInput = z.infer<typeof smartComplaintWizardSchema>

export type SmartComplaintWizardResult = {
  readinessScore: number
  grade: string
  caseSummary: string
  missingFields: string[]
  evidenceChecklist: string[]
  actionPlan: { day: string; title: string; action: string; channel: string }[]
  complaintDraft: string
  followUpDraft: string
  whatsappMessage: string
  callScript: string
  riskWarnings: string[]
  dashboardSuggestion: string
  languageNote: string
  disclaimer: string
}
