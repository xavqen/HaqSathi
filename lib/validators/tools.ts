import { z } from 'zod'

export const deadlineCalculatorSchema = z.object({
  issueDate: z.string().min(1),
  category: z.string().min(2).max(80)
})

export const complaintScoreSchema = z.object({
  companyName: z.string().optional(),
  transactionId: z.string().optional(),
  amount: z.string().optional(),
  issueDate: z.string().optional(),
  description: z.string().optional(),
  desiredResolution: z.string().optional(),
  previousCommunication: z.string().optional()
})

export const evidenceChecklistSchema = z.object({
  category: z.string().min(2).max(80)
})

export const riskAssessmentSchema = z.object({
  issueType: z.string().min(2).max(100),
  amount: z.string().optional(),
  daysPassed: z.string().optional(),
  hasFraud: z.enum(['yes', 'no']).default('no'),
  bankResponded: z.enum(['yes', 'no', 'not-needed']).default('not-needed')
})

export const languagePreferenceSchema = z.object({
  primaryLanguage: z.enum(['HINGLISH', 'HINDI', 'ENGLISH', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'GUJARATI', 'URDU']),
  assistantTone: z.enum(['SIMPLE', 'FORMAL', 'FRIENDLY', 'STRICT']),
  readingLevel: z.enum(['EASY', 'NORMAL', 'DETAILED'])
})
