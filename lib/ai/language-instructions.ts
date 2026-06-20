import 'server-only'
// server-only: import this module only from API routes and server-side tool builders.
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

export function buildLanguageInstruction(code?: string | null) {
  const match = LANGUAGE_OPTIONS.find((language) => language.code === code) || LANGUAGE_OPTIONS[0]
  return `Respond primarily in ${match.label}. Use simple words. If legal/government terms are needed, explain them in plain language. Keep names, IDs, amounts and official terms unchanged.`
}
