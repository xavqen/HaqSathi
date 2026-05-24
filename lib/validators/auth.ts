import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name required').max(80),
  email: z.string().email('Valid email required').max(120),
  password: z.string().min(8, 'Password minimum 8 characters').max(80)
})

export const loginSchema = z.object({
  email: z.string().email('Valid email required').max(120),
  password: z.string().min(1, 'Password required').max(80)
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
