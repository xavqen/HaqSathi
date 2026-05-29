import { z } from 'zod'
const booleanFromForm = (value: unknown) => {
  if (value === 'false' || value === false || value === '0' || value === 0) return false
  if (value === 'true' || value === true || value === '1' || value === 1) return true
  return value
}

export const languageDraftTranslatorSchema = z.object({
  sourceText: z.string().min(20, 'Draft text required').max(12000),
  targetLanguage: z.string().min(2).default('ENGLISH'),
  tone: z.enum(['SIMPLE', 'FORMAL', 'FIRM', 'WHATSAPP', 'CALL_SCRIPT']).default('SIMPLE'),
  audience: z.enum(['COMPANY_SUPPORT', 'BANK', 'GOVERNMENT_OFFICE', 'CYBER_HELP', 'FAMILY_EXPLANATION']).default('COMPANY_SUPPORT')
})

export const mobileReadinessSchema = z.object({
  pageName: z.string().min(2).max(80),
  hasStickyHeader: z.preprocess(booleanFromForm, z.boolean()).default(true),
  hasHorizontalNav: z.preprocess(booleanFromForm, z.boolean()).default(true),
  buttonSize: z.enum(['SMALL', 'MEDIUM', 'LARGE']).default('LARGE'),
  formFields: z.coerce.number().int().min(0).max(80).default(8),
  usesLongText: z.preprocess(booleanFromForm, z.boolean()).default(false),
  supportsLowBandwidth: z.preprocess(booleanFromForm, z.boolean()).default(true),
  languageSelectorVisible: z.preprocess(booleanFromForm, z.boolean()).default(true)
})

export type LanguageDraftTranslatorInput = z.infer<typeof languageDraftTranslatorSchema>
export type MobileReadinessInput = z.infer<typeof mobileReadinessSchema>
