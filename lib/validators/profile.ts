import { z } from 'zod'

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80)
})

export const familyProfileSchema = z.object({
  name: z.string().min(2).max(80),
  relation: z.string().min(2).max(50),
  age: z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().int().min(0).max(120).optional()),
  notes: z.string().max(500).optional().or(z.literal(''))
})

export const agentClientSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().or(z.literal('')),
  caseType: z.string().min(2).max(80),
  caseStatus: z.enum(['OPEN', 'FOLLOW_UP', 'RESOLVED', 'CLOSED']).default('OPEN'),
  notes: z.string().max(1000).optional().or(z.literal(''))
})

export const documentVaultSchema = z.object({
  title: z.string().min(2).max(120),
  docType: z.string().min(2).max(80),
  expiryDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal(''))
})
