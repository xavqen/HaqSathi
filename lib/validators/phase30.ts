import { z } from 'zod'

export const privacyRedactorSchema = z.object({
  contentType: z.enum(['COMPLAINT_DRAFT', 'CHAT_MESSAGE', 'PUBLIC_POST', 'DOCUMENT_TEXT', 'EMAIL', 'OTHER']).default('COMPLAINT_DRAFT'),
  language: z.string().default('ENGLISH'),
  text: z.string().min(20).max(20000),
  keepReferenceIds: z.coerce.boolean().default(true),
  publicShareMode: z.coerce.boolean().default(false)
})
export type PrivacyRedactorInput = z.infer<typeof privacyRedactorSchema>

export const evidenceTimelineSchema = z.object({
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'CYBER_FRAUD', 'ECOMMERCE', 'DOCUMENT', 'SCHEME', 'EDUCATION', 'TRAVEL', 'INSURANCE', 'OTHER']).default('REFUND'),
  companyName: z.string().max(160).optional(),
  referenceId: z.string().max(160).optional(),
  eventsText: z.string().min(20).max(20000),
  evidenceText: z.string().max(12000).optional(),
  targetOutcome: z.string().max(1000).optional()
})
export type EvidenceTimelineInput = z.infer<typeof evidenceTimelineSchema>

export const publicPostSafetySchema = z.object({
  platform: z.enum(['X_TWITTER', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE_COMMENT', 'APP_REVIEW', 'OTHER']).default('X_TWITTER'),
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'CYBER_FRAUD', 'ECOMMERCE', 'EDUCATION', 'TRAVEL', 'INSURANCE', 'OTHER']).default('REFUND'),
  companyName: z.string().max(160).optional(),
  draftPost: z.string().min(20).max(8000),
  goal: z.enum(['GET_SUPPORT', 'WARN_OTHERS', 'ASK_STATUS', 'ESCALATE_POLITELY']).default('GET_SUPPORT')
})
export type PublicPostSafetyInput = z.infer<typeof publicPostSafetySchema>

export const agentRevenueSimulatorSchema = z.object({
  city: z.string().max(120).optional(),
  monthlyClients: z.coerce.number().int().min(0).max(100000).default(50),
  avgServiceFee: z.coerce.number().min(0).max(1000000).default(99),
  conversionRate: z.coerce.number().min(0).max(100).default(20),
  planCost: z.coerce.number().min(0).max(1000000).default(999),
  addOnRevenue: z.coerce.number().min(0).max(1000000).default(0)
})
export type AgentRevenueSimulatorInput = z.infer<typeof agentRevenueSimulatorSchema>
