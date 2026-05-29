import { z } from 'zod'

export const scamRadarSchema = z.object({
  channel: z.enum(['WHATSAPP', 'SMS', 'CALL', 'EMAIL', 'UPI_APP', 'SOCIAL_MEDIA', 'WEBSITE']).default('WHATSAPP'),
  counterparty: z.string().max(140).optional(),
  amount: z.string().max(80).optional(),
  messageText: z.string().min(10).max(12000),
  userActionTaken: z.string().max(1000).optional()
})
export type ScamRadarInput = z.infer<typeof scamRadarSchema>

export const rightsExplainerSchema = z.object({
  issueType: z.enum(['REFUND', 'BANK', 'UPI', 'CYBER_FRAUD', 'ECOMMERCE', 'EDUCATION_FEE', 'TRAVEL', 'INSURANCE', 'GOVERNMENT_SERVICE', 'DOCUMENT', 'OTHER']).default('REFUND'),
  state: z.string().max(120).optional(),
  language: z.string().default('ENGLISH'),
  question: z.string().min(15).max(8000),
  userProfile: z.string().max(1200).optional()
})
export type RightsExplainerInput = z.infer<typeof rightsExplainerSchema>

export const refundNegotiationSchema = z.object({
  companyName: z.string().max(140).optional(),
  issueType: z.enum(['REFUND_DELAY', 'DEFECTIVE_PRODUCT', 'WRONG_ITEM', 'SERVICE_NOT_PROVIDED', 'CANCELLATION', 'EDUCATION_FEE', 'TRAVEL_REFUND', 'OTHER']).default('REFUND_DELAY'),
  amount: z.string().max(80).optional(),
  daysPending: z.coerce.number().int().min(0).max(3650).default(0),
  previousResponse: z.string().max(4000).optional(),
  evidence: z.string().max(4000).optional(),
  tone: z.enum(['POLITE', 'FIRM', 'URGENT', 'LAST_ESCALATION']).default('FIRM')
})
export type RefundNegotiationInput = z.infer<typeof refundNegotiationSchema>

export const issueTrendSchema = z.object({
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'CYBER_FRAUD', 'ECOMMERCE', 'DOCUMENT', 'SCHEME', 'EDUCATION', 'TRAVEL', 'OTHER']).default('REFUND'),
  companyName: z.string().max(140).optional(),
  state: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  summary: z.string().min(10).max(2500)
})
export type IssueTrendInput = z.infer<typeof issueTrendSchema>

export const authorityRouterSchema = z.object({
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'CYBER_FRAUD', 'ECOMMERCE', 'INSURANCE', 'TELECOM', 'EDUCATION', 'GOVERNMENT_SERVICE', 'DOCUMENT', 'OTHER']).default('REFUND'),
  companyType: z.enum(['PRIVATE_COMPANY', 'BANK', 'PAYMENT_APP', 'MARKETPLACE', 'GOVERNMENT_OFFICE', 'COLLEGE_SCHOOL', 'INSURANCE_COMPANY', 'TELECOM', 'TRAVEL_PORTAL', 'OTHER']).default('PRIVATE_COMPANY'),
  state: z.string().max(120).optional(),
  urgency: z.enum(['NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  problem: z.string().min(20).max(8000),
  alreadyTried: z.string().max(2000).optional()
})
export type AuthorityRouterInput = z.infer<typeof authorityRouterSchema>
