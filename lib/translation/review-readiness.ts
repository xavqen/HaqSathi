import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

export type TranslationReviewStatus = 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type TranslationReviewLane = {
  id: string
  label: string
  priority: 'P0' | 'P1' | 'P2'
  pages: string[]
  languages: string[]
  reviewer: string
  risk: string
  evidenceRequired: string[]
}

export type TranslationReviewControl = {
  id: string
  label: string
  status: TranslationReviewStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
}

export type TranslationReviewReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    totalLanes: number
    p0Lanes: number
    priorityLanguages: number
    supportedLanguages: number
  }
  controls: TranslationReviewControl[]
  lanes: TranslationReviewLane[]
  glossary: { term: string; keepAs: string; note: string }[]
  runbook: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return env(name).toLowerCase() === 'true'
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function status(ok: boolean, missing: TranslationReviewStatus = 'MANUAL_REQUIRED'): TranslationReviewStatus {
  return ok ? 'READY_TO_TEST' : missing
}

const priorityLanguageCodes = ['ENGLISH', 'HINGLISH', 'HINDI', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'GUJARATI', 'URDU']
const supportedLanguageLabels = LANGUAGE_OPTIONS.map((language) => language.label)
const priorityLanguageLabels = LANGUAGE_OPTIONS.filter((language) => priorityLanguageCodes.includes(language.code)).map((language) => language.label)

const lanes: TranslationReviewLane[] = [
  {
    id: 'public-home-pricing-auth',
    label: 'Public landing, pricing and auth copy',
    priority: 'P0',
    pages: ['/', '/pricing', '/login', '/register', '/forgot-password'],
    languages: priorityLanguageLabels,
    reviewer: env('TRANSLATION_REVIEW_OWNER', 'Content reviewer'),
    risk: 'Wrong promises, confusing pricing or unclear account copy can reduce trust before signup.',
    evidenceRequired: ['Mobile screenshot per priority language', 'Desktop screenshot per priority language', 'Reviewer/date note']
  },
  {
    id: 'core-tools-complaint-upi-docs',
    label: 'Core tool instructions and safety warnings',
    priority: 'P0',
    pages: ['/complaint', '/upi-help', '/scheme-finder', '/documents', '/tools'],
    languages: priorityLanguageLabels,
    reviewer: env('TRANSLATION_REVIEW_OWNER', 'Content reviewer'),
    risk: 'Bad translation can cause users to share secrets, miss documents or follow unsafe complaint steps.',
    evidenceRequired: ['Filled form screenshot', 'Generated output screenshot', 'Safety warning screenshot', 'Reviewer/date note']
  },
  {
    id: 'dashboard-vault-reminders',
    label: 'Dashboard, document vault and reminders',
    priority: 'P0',
    pages: ['/dashboard', '/dashboard/document-vault', '/dashboard/reminders', '/dashboard/security'],
    languages: priorityLanguageLabels,
    reviewer: env('TRANSLATION_REVIEW_OWNER', 'Content reviewer'),
    risk: 'Users must clearly understand privacy, upload limits, reminders and account security controls.',
    evidenceRequired: ['Dashboard screenshot', 'Vault upload notice screenshot', 'Security page screenshot', 'Reviewer/date note']
  },
  {
    id: 'official-content-guides',
    label: 'Official resource, authority and filing guide pages',
    priority: 'P1',
    pages: ['/official-sources', '/authority-directory', '/filing-guides', '/state-guides', '/resources'],
    languages: priorityLanguageLabels,
    reviewer: env('TRANSLATION_REVIEW_OWNER', 'Content reviewer'),
    risk: 'Official-data copy must not imply affiliation or replace official portal verification.',
    evidenceRequired: ['Official disclaimer screenshot', 'Link verification screenshot', 'Reviewer/date note']
  },
  {
    id: 'legal-privacy-compliance',
    label: 'Legal, privacy, consent and deletion pages',
    priority: 'P1',
    pages: ['/privacy', '/terms', '/disclaimer', '/privacy-center', '/delete-account'],
    languages: priorityLanguageLabels,
    reviewer: env('TRANSLATION_REVIEW_OWNER', 'Content reviewer'),
    risk: 'Legal/privacy text needs human review before being shown as final in local languages.',
    evidenceRequired: ['Privacy page screenshot', 'Deletion flow screenshot', 'Consent copy screenshot', 'Reviewer/date note']
  },
  {
    id: 'growth-support-emails',
    label: 'Growth, newsletter, referral and support copy',
    priority: 'P2',
    pages: ['/newsletter', '/referrals', '/support', '/contact'],
    languages: priorityLanguageLabels,
    reviewer: env('TRANSLATION_REVIEW_OWNER', 'Content reviewer'),
    risk: 'Marketing copy should stay clear, non-spammy and consent-first across languages.',
    evidenceRequired: ['Subscribe form screenshot', 'Referral invite screenshot', 'Support message screenshot']
  }
]

const glossary = [
  { term: 'HaqSathi AI', keepAs: 'HaqSathi AI', note: 'Brand name should not be translated.' },
  { term: 'UPI PIN / OTP / password', keepAs: 'UPI PIN / OTP / password', note: 'Keep secret terms explicit and warn users never to share them.' },
  { term: 'Guidance only', keepAs: 'Guidance only / Sirf guidance', note: 'Every language must clearly say the app is not an official government/legal authority.' },
  { term: 'Official portal', keepAs: 'Official portal', note: 'Keep meaning exact. Do not imply HaqSathi submits forms automatically unless the feature exists.' },
  { term: 'Evidence', keepAs: 'Evidence / Proof', note: 'Use simple local-language explanation when needed.' },
  { term: 'Refund / complaint / escalation', keepAs: 'Refund / complaint / escalation', note: 'Keep common mixed-language terms understandable for Indian users.' }
]

export function getTranslationReviewReadinessReport(): TranslationReviewReport {
  const controls: TranslationReviewControl[] = [
    {
      id: 'review-owner',
      label: 'Translation review owner assigned',
      status: status(configured('TRANSLATION_REVIEW_OWNER')),
      envValue: `TRANSLATION_REVIEW_OWNER=${env('TRANSLATION_REVIEW_OWNER') || 'empty'}`,
      passCondition: 'A named reviewer or team is responsible for approving translations before public launch.',
      evidenceRequired: 'Reviewer name/team, review date and signoff note.'
    },
    {
      id: 'priority-languages',
      label: 'Priority launch languages selected',
      status: status(Boolean(env('TRANSLATION_PRIORITY_LANGUAGES', priorityLanguageCodes.join(',')).trim())),
      envValue: `TRANSLATION_PRIORITY_LANGUAGES=${env('TRANSLATION_PRIORITY_LANGUAGES', priorityLanguageCodes.join(','))}`,
      passCondition: 'Priority launch languages are listed so review can focus before scaling to every supported language.',
      evidenceRequired: 'Final priority language list saved in env or launch notes.'
    },
    {
      id: 'human-review-required',
      label: 'Human review gate enabled',
      status: enabled('TRANSLATION_HUMAN_REVIEW_REQUIRED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `TRANSLATION_HUMAN_REVIEW_REQUIRED=${env('TRANSLATION_HUMAN_REVIEW_REQUIRED', 'true')}`,
      passCondition: 'Machine-generated translations remain draft until human review evidence exists.',
      evidenceRequired: 'Admin translation review screenshot and reviewer checklist.'
    },
    {
      id: 'rtl-review',
      label: 'RTL language review planned',
      status: enabled('TRANSLATION_RTL_REVIEW_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `TRANSLATION_RTL_REVIEW_PASSED=${env('TRANSLATION_RTL_REVIEW_PASSED', 'false')}`,
      passCondition: 'Urdu/Arabic/Hebrew/Farsi/Kashmiri/Sindhi layouts are checked for direction, dropdown and text wrapping issues.',
      evidenceRequired: 'RTL mobile and desktop screenshots.'
    },
    {
      id: 'legal-copy-review',
      label: 'Legal/privacy translation review',
      status: enabled('TRANSLATION_LEGAL_REVIEW_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `TRANSLATION_LEGAL_REVIEW_PASSED=${env('TRANSLATION_LEGAL_REVIEW_PASSED', 'false')}`,
      passCondition: 'Privacy, terms, disclaimer and deletion copy are human-reviewed before being treated as final.',
      evidenceRequired: 'Legal/privacy review note and screenshots.'
    },
    {
      id: 'evidence-dir',
      label: 'Translation evidence output directory configured',
      status: status(configured('TRANSLATION_REVIEW_EVIDENCE_DIR')),
      envValue: `TRANSLATION_REVIEW_EVIDENCE_DIR=${env('TRANSLATION_REVIEW_EVIDENCE_DIR', './artifacts/translation-review')}`,
      passCondition: 'Local readiness artifacts are saved in a stable evidence folder.',
      evidenceRequired: 'translation-review-readiness.json and CSV output.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.35-translation-review-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      totalLanes: lanes.length,
      p0Lanes: lanes.filter((lane) => lane.priority === 'P0').length,
      priorityLanguages: priorityLanguageLabels.length,
      supportedLanguages: supportedLanguageLabels.length
    },
    controls,
    lanes,
    glossary,
    runbook: [
      'Freeze launch copy for the top public and core tool pages.',
      'Review P0 pages first in English, Hinglish and Hindi, then other priority languages.',
      'Test RTL languages on mobile and desktop before approving dropdown/header changes.',
      'Keep brand names, IDs, amounts, official URLs and secret-warning terms unchanged.',
      'Save screenshots, reviewer name, date and notes in the translation evidence folder.',
      'Only after review evidence is saved, mark the relevant env flags true for launch command review.'
    ]
  }
}
