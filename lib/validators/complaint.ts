import { z } from 'zod'
import { complaintTypes } from '@/lib/constants'

export const complaintInputSchema = z.object({
  type: z.enum(complaintTypes, { required_error: 'Complaint type choose karo' }),
  companyName: z.string().min(2, 'Company name required').max(80),
  transactionId: z.string().max(80).optional().or(z.literal('')),
  issueDate: z.string().optional().or(z.literal('')),
  amount: z.string().optional().or(z.literal('')),
  description: z.string().min(20, 'Issue ko thoda detail me likho').max(1800),
  desiredResolution: z.string().min(3, 'Aap kya solution chahte ho?').max(500),
  previousCommunication: z.string().max(900).optional().or(z.literal(''))
})

export type ComplaintInput = z.infer<typeof complaintInputSchema>

export const complaintOutputSchema = z.object({
  shortComplaint: z.string(),
  formalEmail: z.string(),
  consumerHelplineFormat: z.string(),
  companySupportMessage: z.string(),
  followUpMessage: z.string(),
  legalNoticeStyleDraft: z.string(),
  checklist: z.array(z.string()),
  nextSteps: z.array(z.string()),
  disclaimer: z.string()
})

export type ComplaintOutput = z.infer<typeof complaintOutputSchema>
