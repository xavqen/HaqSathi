import { z } from 'zod'

export const submissionPackSchema = z.object({
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'ECOMMERCE', 'CYBER_FRAUD', 'SCHEME', 'DOCUMENT', 'SERVICE', 'OTHER']).default('REFUND'),
  companyName: z.string().max(120).optional(),
  referenceId: z.string().max(160).optional(),
  amount: z.string().max(80).optional(),
  issueDate: z.string().max(80).optional(),
  problem: z.string().min(20).max(12000),
  desiredResolution: z.string().max(1000).optional(),
  evidence: z.string().max(8000).optional(),
  language: z.string().default('ENGLISH'),
  tone: z.enum(['POLITE', 'FIRM', 'URGENT', 'PROFESSIONAL']).default('PROFESSIONAL'),
  recipientType: z.enum(['COMPANY_SUPPORT', 'BANK', 'PAYMENT_APP', 'MARKETPLACE', 'AUTHORITY', 'COLLEGE', 'GOVERNMENT_OFFICE']).default('COMPANY_SUPPORT')
})

export type SubmissionPackInput = z.infer<typeof submissionPackSchema>

export type SubmissionPackResult = {
  title: string
  caseSnapshot: string
  recommendedChannel: string
  emailSubject: string
  emailBody: string
  whatsappMessage: string
  supportChatMessage: string
  callOpeningScript: string
  escalationMessage: string
  socialPostSafe: string
  attachmentOrder: string[]
  copySequence: { label: string; text: string; whenToUse: string }[]
  mobileActionPlan: { step: string; action: string; time: string }[]
  warnings: string[]
  languageNote: string
  disclaimer: string
}
