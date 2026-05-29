import { z } from 'zod'

export const ocrAutofillResultSchema = z.object({
  companyName: z.string().default('Not detected'),
  transactionId: z.string().default('Not detected'),
  amount: z.string().default('Not detected'),
  issueDate: z.string().default('Not detected'),
  complaintType: z.string().default('Refund not received'),
  description: z.string().default(''),
  desiredResolution: z.string().default('Refund/status update chahiye'),
  evidenceSummary: z.string().default(''),
  confidenceScore: z.number().min(0).max(100).default(0),
  warnings: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  disclaimer: z.string().default('Guidance only. Verify extracted details before submitting any complaint.')
})

export type OcrAutofillResult = z.infer<typeof ocrAutofillResultSchema>
