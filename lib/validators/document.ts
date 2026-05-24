import { z } from 'zod'
import { documentTypes } from '@/lib/constants'

export const documentInputSchema = z.object({
  type: z.enum(documentTypes),
  state: z.string().min(2).max(80),
  applicantType: z.string().min(2).max(80),
  extraInfo: z.string().max(800).optional().or(z.literal(''))
})

export type DocumentInput = z.infer<typeof documentInputSchema>

export type DocumentOutput = {
  requiredDocuments: string[]
  optionalDocuments: string[]
  stepByStepProcess: string[]
  commonMistakes: string[]
  timeEstimate: string
  mode: string
  disclaimer: string
}
