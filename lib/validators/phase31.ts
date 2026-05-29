import { z } from 'zod'

export const chargebackHelperSchema = z.object({
  paymentMode: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NETBANKING', 'WALLET', 'EMI', 'OTHER']).default('DEBIT_CARD'),
  issueType: z.enum(['UNAUTHORIZED', 'PRODUCT_NOT_RECEIVED', 'REFUND_NOT_CREDITED', 'DUPLICATE_DEBIT', 'SERVICE_NOT_PROVIDED', 'WRONG_AMOUNT', 'MERCHANT_DENIED', 'OTHER']).default('REFUND_NOT_CREDITED'),
  bankName: z.string().max(160).optional(),
  merchantName: z.string().max(160).optional(),
  amount: z.coerce.number().min(0).max(100000000).optional(),
  transactionDate: z.string().max(80).optional(),
  transactionId: z.string().max(160).optional(),
  whatHappened: z.string().min(20).max(8000),
  evidenceAvailable: z.string().max(5000).optional(),
  language: z.string().default('ENGLISH')
})
export type ChargebackHelperInput = z.infer<typeof chargebackHelperSchema>

export const proofQualityScannerSchema = z.object({
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'CYBER_FRAUD', 'ECOMMERCE', 'EDUCATION', 'TRAVEL', 'INSURANCE', 'DOCUMENT', 'OTHER']).default('REFUND'),
  proofText: z.string().min(20).max(20000),
  expectedOutcome: z.string().max(1200).optional(),
  channel: z.enum(['COMPANY_SUPPORT', 'BANK', 'NPCI', 'CONSUMER_HELPLINE', 'CYBER_PORTAL', 'SOCIAL_MEDIA', 'OTHER']).default('COMPANY_SUPPORT')
})
export type ProofQualityScannerInput = z.infer<typeof proofQualityScannerSchema>

export const serviceCenterLocatorSchema = z.object({
  issueType: z.enum(['BANK', 'UPI', 'CYBER_FRAUD', 'ECOMMERCE', 'TELECOM', 'ELECTRICITY', 'EDUCATION', 'DOCUMENT', 'SCHEME', 'INSURANCE', 'TRAVEL', 'OTHER']).default('BANK'),
  state: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  urgency: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  userNeed: z.string().min(10).max(4000),
  onlinePreferred: z.coerce.boolean().default(true)
})
export type ServiceCenterLocatorInput = z.infer<typeof serviceCenterLocatorSchema>

export const familyCaseSwitchboardSchema = z.object({
  familyName: z.string().max(160).optional(),
  memberName: z.string().min(2).max(120),
  issueType: z.enum(['REFUND', 'UPI', 'BANK', 'CYBER_FRAUD', 'DOCUMENT', 'SCHEME', 'EDUCATION', 'HEALTH', 'TRAVEL', 'INSURANCE', 'OTHER']).default('REFUND'),
  caseSummary: z.string().min(20).max(8000),
  responsiblePerson: z.string().max(120).optional(),
  dueDate: z.string().max(80).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM')
})
export type FamilyCaseSwitchboardInput = z.infer<typeof familyCaseSwitchboardSchema>
