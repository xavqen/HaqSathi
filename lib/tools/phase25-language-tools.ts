import { getLanguageLabel, LANGUAGE_OPTIONS } from '@/lib/i18n/languages'
import type { LanguageDraftTranslatorInput, MobileReadinessInput } from '@/lib/validators/phase25'

const audienceMap: Record<string, string> = {
  COMPANY_SUPPORT: 'company support team',
  BANK: 'bank grievance/customer support team',
  GOVERNMENT_OFFICE: 'government office or scheme portal support',
  CYBER_HELP: 'cyber fraud / UPI support channel',
  FAMILY_EXPLANATION: 'family member or local helper'
}

const toneMap: Record<string, string> = {
  SIMPLE: 'simple and easy to understand',
  FORMAL: 'formal and official',
  FIRM: 'firm, polite and action-oriented',
  WHATSAPP: 'short WhatsApp message style',
  CALL_SCRIPT: 'customer-care call script style'
}

const knownLanguageOpeners: Record<string, string> = {
  ENGLISH: 'Hello, I need help with this issue.',
  HINGLISH: 'Hello, mujhe is issue me help chahiye.',
  HINDI: 'नमस्ते, मुझे इस समस्या में सहायता चाहिए।',
  BENGALI: 'নমস্কার, এই সমস্যায় আমার সাহায্য দরকার।',
  MARATHI: 'नमस्कार, मला या समस्येबाबत मदत हवी आहे.',
  TAMIL: 'வணக்கம், இந்த பிரச்சினைக்கு உதவி தேவை.',
  TELUGU: 'నమస్తే, ఈ సమస్యలో నాకు సహాయం కావాలి.',
  GUJARATI: 'નમસ્તે, મને આ સમસ્યામાં મદદ જોઈએ છે.',
  URDU: 'السلام علیکم، مجھے اس مسئلے میں مدد چاہیے۔',
  KANNADA: 'ನಮಸ್ಕಾರ, ಈ ಸಮಸ್ಯೆಗೆ ನನಗೆ ಸಹಾಯ ಬೇಕಾಗಿದೆ.',
  MALAYALAM: 'നമസ്കാരം, ഈ പ്രശ്നത്തിൽ എനിക്ക് സഹായം വേണം.',
  PUNJABI: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਨੂੰ ਇਸ ਸਮੱਸਿਆ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ।',
  SPANISH: 'Hola, necesito ayuda con este problema.',
  FRENCH: 'Bonjour, j’ai besoin d’aide pour ce problème.',
  ARABIC: 'مرحباً، أحتاج إلى مساعدة في هذه المشكلة.',
  GERMAN: 'Hallo, ich brauche Hilfe bei diesem Problem.'
}

export function buildLanguageDraftPack(input: LanguageDraftTranslatorInput) {
  const language = getLanguageLabel(input.targetLanguage)
  const opener = knownLanguageOpeners[input.targetLanguage] || `Hello, I need help with this issue. Preferred language: ${language}.`
  const clean = input.sourceText.trim().replace(/\s+/g, ' ').slice(0, 4000)
  const audience = audienceMap[input.audience]
  const tone = toneMap[input.tone]
  const isCall = input.tone === 'CALL_SCRIPT'
  const isWhatsApp = input.tone === 'WHATSAPP'

  const localizedDraft = isCall
    ? `${opener}\n\nMain point: ${clean}\n\nPlease check my complaint, share ticket/status ID, and tell me the exact next step and resolution timeline in writing. I will save this conversation for follow-up.`
    : isWhatsApp
      ? `${opener}\n\nIssue: ${clean}\n\nPlease check and update me with ticket/status details and expected resolution time. I request a written reply.`
      : `${opener}\n\nI am contacting the ${audience} regarding the following issue.\n\n${clean}\n\nPlease review this matter, register my complaint if not already registered, and share a written update with the ticket/status ID and expected resolution timeline. I request a clear response and proper resolution as per applicable process.`

  return {
    targetLanguage: language,
    tone,
    audience,
    localizedDraft,
    copyPack: {
      subject: `Request for help/resolution - ${input.audience.replaceAll('_', ' ').toLowerCase()}`,
      shortMessage: `${opener} Please check my issue and share written status/resolution timeline.`,
      followUp: `This is a follow-up. Please share the current status, ticket ID and expected resolution date in writing.`,
      callOpening: `${opener} I want to register/follow up on a complaint. Please help me with ticket status and next action.`
    },
    safetyNotes: [
      'Keep company name, order ID, UTR, date, amount and ticket ID unchanged while translating.',
      'Do not share OTP, PIN, password, full card number or unnecessary Aadhaar details.',
      'For fraud/cyber cases, contact bank and official emergency channels immediately.'
    ],
    disclaimer: 'This is a language-assist draft, not legal advice and not an official translation certificate.'
  }
}

export function buildMobileReadinessReport(input: MobileReadinessInput) {
  let score = 100
  const fixes: string[] = []
  if (!input.hasStickyHeader) { score -= 18; fixes.push('Header ko sticky rakho taaki mobile user tools/search/profile easily access kar sake.') }
  if (!input.hasHorizontalNav) { score -= 14; fixes.push('Mobile header me horizontal scroll nav add karo for high number of tools.') }
  if (input.buttonSize !== 'LARGE') { score -= 12; fixes.push('Primary buttons min 44px height rakho for thumb-friendly tapping.') }
  if (input.formFields > 10) { score -= 12; fixes.push('Long forms ko step-by-step wizard me split karo.') }
  if (input.usesLongText) { score -= 8; fixes.push('Long paragraphs ko cards, bullets aur copy buttons me tod do.') }
  if (!input.supportsLowBandwidth) { score -= 10; fixes.push('Heavy images/video avoid karo; forms server-side lightweight rakho.') }
  if (!input.languageSelectorVisible) { score -= 14; fixes.push('Profile + tool forms me language selector visible rakho.') }
  score = Math.max(0, Math.min(100, score))
  return {
    pageName: input.pageName,
    score,
    grade: score >= 90 ? 'Excellent mobile UX' : score >= 75 ? 'Good, minor fixes needed' : score >= 55 ? 'Needs mobile polish' : 'High friction on mobile',
    fixes: fixes.length ? fixes : ['Mobile UX strong hai. Final real-device QA Chrome Android + iPhone Safari par karo.'],
    checklist: [
      'Sticky header visible after scroll',
      'Horizontal nav scroll works without layout shift',
      'Bottom quick actions do not overlap forms',
      'Inputs are 16px+ to avoid iOS zoom',
      'Language selector visible inside profile and major AI forms',
      'Copy/download/share buttons usable with one hand'
    ]
  }
}

export function getLanguageCoverageGroups() {
  const india = LANGUAGE_OPTIONS.filter((item) => ['India', 'Bihar', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh', 'Gujarat', 'Karnataka', 'Kerala', 'Odisha', 'Punjab', 'Assam', 'Jammu', 'Goa', 'Manipur', 'West Bengal'].some((region) => item.region.includes(region)))
  const global = LANGUAGE_OPTIONS.filter((item) => !india.some((lang) => lang.code === item.code))
  return { india, global, total: LANGUAGE_OPTIONS.length }
}
