import { z } from 'zod'
import { indianStates, schemePurposes } from '@/lib/constants'

export const schemeInputSchema = z.object({
  state: z.enum(indianStates),
  age: z.coerce.number().min(1).max(120),
  gender: z.string().min(1).max(40),
  profile: z.string().min(2).max(80),
  incomeRange: z.string().min(1).max(80),
  category: z.string().optional().or(z.literal('')),
  educationLevel: z.string().optional().or(z.literal('')),
  disability: z.string().optional().or(z.literal('')),
  purpose: z.enum(schemePurposes)
})

export type SchemeInput = z.infer<typeof schemeInputSchema>

export type SchemeOutput = {
  possibleSchemes: { name: string; whyMayFit: string; caution: string }[]
  eligibilityExplanation: string[]
  requiredDocuments: string[]
  applySteps: string[]
  officialLinkNote: string
  disclaimer: string
}
