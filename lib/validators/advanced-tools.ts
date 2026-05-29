import { z } from 'zod'
import { LANGUAGE_CODES } from '@/lib/i18n/languages'

export const legalNoticeSchema = z.object({
  recipientName: z.string().min(2).max(120),
  recipientAddress: z.string().optional(),
  senderName: z.string().min(2).max(120),
  senderAddress: z.string().optional(),
  issueType: z.string().min(2).max(120),
  referenceId: z.string().optional(),
  amount: z.string().optional(),
  issueDate: z.string().optional(),
  facts: z.string().min(20).max(4000),
  demand: z.string().min(5).max(1000),
  responseDays: z.string().optional(),
  language: z.enum(LANGUAGE_CODES).default('ENGLISH')
})

export const rtiHelperSchema = z.object({
  department: z.string().min(2).max(160),
  state: z.string().optional(),
  applicantName: z.string().min(2).max(120),
  applicantAddress: z.string().optional(),
  topic: z.string().min(3).max(180),
  questions: z.string().min(10).max(3000),
  period: z.string().optional(),
  language: z.enum(LANGUAGE_CODES).default('ENGLISH')
})

export const consumerForumPackSchema = z.object({
  complainantName: z.string().min(2).max(120),
  oppositeParty: z.string().min(2).max(160),
  productOrService: z.string().min(2).max(160),
  amount: z.string().optional(),
  purchaseDate: z.string().optional(),
  issueSummary: z.string().min(20).max(4000),
  reliefRequested: z.string().min(5).max(1000),
  evidenceAvailable: z.string().optional(),
  language: z.enum(LANGUAGE_CODES).default('ENGLISH')
})

export const bankEscalationSchema = z.object({
  bankName: z.string().min(2).max(120),
  issueType: z.string().min(2).max(120),
  complaintId: z.string().optional(),
  accountHint: z.string().optional(),
  amount: z.string().optional(),
  daysPending: z.string().optional(),
  bankResponse: z.string().optional(),
  issueSummary: z.string().min(15).max(3000),
  language: z.enum(LANGUAGE_CODES).default('ENGLISH')
})


export const ombudsmanPlannerSchema = z.object({
  institutionName: z.string().min(2).max(160),
  issueType: z.string().min(2).max(140),
  complaintId: z.string().optional(),
  complaintDate: z.string().optional(),
  amount: z.string().optional(),
  currentStatus: z.string().min(10).max(3000),
  reliefRequested: z.string().min(5).max(1000),
  documentsAvailable: z.string().optional(),
  language: z.enum(LANGUAGE_CODES).default('ENGLISH')
})

export const evidencePackSchema = z.object({
  complaintId: z.string().optional(),
  caseTitle: z.string().min(2).max(160),
  category: z.string().min(2).max(120),
  referenceId: z.string().optional(),
  amount: z.string().optional(),
  timeline: z.string().optional(),
  evidenceList: z.string().optional(),
  notes: z.string().optional()
})

export type LegalNoticeInput = z.infer<typeof legalNoticeSchema>
export type RtiHelperInput = z.infer<typeof rtiHelperSchema>
export type ConsumerForumPackInput = z.infer<typeof consumerForumPackSchema>
export type BankEscalationInput = z.infer<typeof bankEscalationSchema>
export type OmbudsmanPlannerInput = z.infer<typeof ombudsmanPlannerSchema>
export type EvidencePackInput = z.infer<typeof evidencePackSchema>
