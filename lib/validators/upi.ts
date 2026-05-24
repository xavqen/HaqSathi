import { z } from 'zod'
import { upiIssues } from '@/lib/constants'

export const upiInputSchema = z.object({
  issue: z.enum(upiIssues),
  appName: z.string().min(2).max(80),
  bankName: z.string().min(2).max(80),
  amount: z.string().optional().or(z.literal('')),
  transactionId: z.string().optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
  description: z.string().min(15).max(1200)
})

export type UpiInput = z.infer<typeof upiInputSchema>

export type UpiOutput = {
  urgentActions: string[]
  bankMessage: string
  npciDraft: string
  documentChecklist: string[]
  followUpPlan: string[]
  disclaimer: string
}
