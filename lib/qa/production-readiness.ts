export type ProductionQaStatus = 'NOT_STARTED' | 'READY_TO_RUN' | 'NEEDS_EVIDENCE' | 'PASS' | 'BLOCKED'

export type ProductionQaItem = {
  id: string
  area: string
  priority: 'P0' | 'P1' | 'P2'
  owner: 'Developer' | 'Founder/Admin' | 'QA' | 'Content/Admin'
  status: ProductionQaStatus
  commandOrAction: string
  passCondition: string
  evidence: string
  failureAction: string
}

function envReady(...names: string[]) {
  return names.every((name) => {
    const value = process.env[name]
    return Boolean(value && !/change-this|PROJECT_REF|YOUR-PASSWORD|haqsathi\.local|example|YOUR-VERCEL-DOMAIN/i.test(value))
  })
}

export const productionQaChecklist: ProductionQaItem[] = [
  {
    id: 'clean-install-build',
    area: 'Clean install, Prisma, TypeScript and Next build',
    priority: 'P0',
    owner: 'Developer',
    status: 'READY_TO_RUN',
    commandOrAction: 'npm ci && npm run db:generate && npm run release:typecheck && npm run build',
    passCondition: 'Fresh folder build completes without relying on old generated files or cached .next output.',
    evidence: 'Terminal log or CI build URL showing install, Prisma generate, typecheck and build success.',
    failureAction: 'Do not deploy. Fix TypeScript/build/Prisma errors first.'
  },
  {
    id: 'vercel-runtime-qa',
    area: 'Vercel runtime and public URL QA',
    priority: 'P0',
    owner: 'Founder/Admin',
    status: envReady('VERCEL_PRODUCTION_URL') ? 'READY_TO_RUN' : 'NEEDS_EVIDENCE',
    commandOrAction: 'Open production URL, /api/health, /api/ready, /sitemap.xml, /robots.txt and core tool pages.',
    passCondition: 'No 500 errors, no broken assets, no deployment secret leakage, and core pages load on mobile + desktop.',
    evidence: 'Vercel deployment URL, deployment ID, screenshots and logs for first production build.',
    failureAction: 'Rollback to previous deployment and fix env/build/runtime errors.'
  },
  {
    id: 'payment-webhook-lifecycle',
    area: 'Razorpay test payment and webhook lifecycle',
    priority: 'P0',
    owner: 'Founder/Admin',
    status: envReady('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_WEBHOOK_URL') ? 'READY_TO_RUN' : 'BLOCKED',
    commandOrAction: 'Run one successful and one failed test payment, then verify webhook event handling and DB payment rows.',
    passCondition: 'Plan upgrade happens only after valid webhook/server verification; failed payment never upgrades the user.',
    evidence: 'Razorpay event IDs, webhook response, DB PaymentOrder row, before/after user plan screenshot.',
    failureAction: 'Disable paid plans/checkout buttons until webhook verification is proven.'
  },
  {
    id: 'resend-inbox-delivery',
    area: 'Resend verification/reset inbox delivery',
    priority: 'P0',
    owner: 'Founder/Admin',
    status: envReady('RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'RESEND_TEST_TO_EMAIL') ? 'READY_TO_RUN' : 'BLOCKED',
    commandOrAction: 'Register new account, verify email, request password reset and send test email to RESEND_TEST_TO_EMAIL.',
    passCondition: 'Inbox receives emails, links work once, expired/used links fail safely, EmailLog captures delivery attempt.',
    evidence: 'Inbox screenshot, EmailLog row, request/response screenshots without exposing tokens.',
    failureAction: 'Keep email verification in test/dev mode and do not force verification for real users.'
  },
  {
    id: 'supabase-storage-vault',
    area: 'Supabase private document vault upload/download',
    priority: 'P0',
    owner: 'Developer',
    status: envReady('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET') ? 'READY_TO_RUN' : 'BLOCKED',
    commandOrAction: 'Upload a small PDF/image, download signed URL, try another account access, then delete test file.',
    passCondition: 'Owner can upload/download; other user cannot access; bucket remains private; service role key is server-only.',
    evidence: 'Self-test JSON, DB metadata row, signed URL proof, denied cross-user access proof.',
    failureAction: 'Disable document vault upload UI until private access control is confirmed.'
  },
  {
    id: 'official-link-review',
    area: 'Official links and scheme/source verification',
    priority: 'P1',
    owner: 'Content/Admin',
    status: envReady('OFFICIAL_LINK_REVIEWER') ? 'READY_TO_RUN' : 'NEEDS_EVIDENCE',
    commandOrAction: 'Open Admin → Source Verification and Link Checks. Verify official source URL, department, notes and review date.',
    passCondition: 'Every public official source is VERIFIED or NEEDS_REVIEW with reason; no deadline claims are published without current source check.',
    evidence: 'Reviewer name, review date, source screenshot, changed-link notes and exported CSV.',
    failureAction: 'Hide/soften exact deadline/eligibility claims and show official verification warning.'
  },
  {
    id: 'translation-review',
    area: 'Human translation review for priority languages/pages',
    priority: 'P1',
    owner: 'Content/Admin',
    status: envReady('TRANSLATION_REVIEWER') ? 'READY_TO_RUN' : 'NEEDS_EVIDENCE',
    commandOrAction: 'Review English, Hinglish, Hindi and top traffic page copy first; then expand to state/global languages.',
    passCondition: 'Top pages have natural, safe, human-reviewed copy; official terms, IDs, amounts and legal words are not mistranslated.',
    evidence: 'Reviewer name, locale, page, before/after copy, screenshot and approval note.',
    failureAction: 'Keep machine translation labelled as draft and default back to English for sensitive workflows.'
  },
  {
    id: 'playwright-production',
    area: 'Playwright mobile/desktop production smoke',
    priority: 'P1',
    owner: 'QA',
    status: envReady('E2E_BASE_URL') ? 'READY_TO_RUN' : 'NEEDS_EVIDENCE',
    commandOrAction: 'E2E_BASE_URL=https://your-domain.com npm run test:e2e',
    passCondition: 'Homepage, tools, complaint flow, dashboard route and responsive navigation pass on mobile + desktop viewport.',
    evidence: 'Playwright HTML report, screenshots/video on failure, production URL and commit/version.',
    failureAction: 'Fix broken flow/layout before marketing traffic.'
  },
  {
    id: 'lighthouse-production',
    area: 'Lighthouse production performance/accessibility/SEO',
    priority: 'P1',
    owner: 'QA',
    status: envReady('LIGHTHOUSE_BASE_URL') ? 'READY_TO_RUN' : 'NEEDS_EVIDENCE',
    commandOrAction: 'LIGHTHOUSE_BASE_URL=https://your-domain.com npm run lighthouse:local',
    passCondition: 'No critical SEO/accessibility regression and mobile performance issues are documented with fix plan.',
    evidence: 'Lighthouse report under artifacts/lighthouse and top failed audits summary.',
    failureAction: 'Fix images, scripts, fonts, layout shift and metadata before SEO launch.'
  },
  {
    id: 'security-abuse-check',
    area: 'Security, CSRF, rate limit and sensitive data check',
    priority: 'P0',
    owner: 'Developer',
    status: envReady('AUTH_SECRET') ? 'READY_TO_RUN' : 'BLOCKED',
    commandOrAction: 'Check /admin/security-hardening, test unsafe cross-origin POST, rate limits and public env exposure.',
    passCondition: 'Unsafe cross-origin writes blocked, abuse bursts throttled, secrets are never NEXT_PUBLIC, headers present.',
    evidence: 'Header screenshot, blocked request proof, rate-limit proof and env review screenshot.',
    failureAction: 'Block launch until unsafe write/security exposure is fixed.'
  }
]

export const priorityTranslationPages = [
  { page: '/', priority: 'P0', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Homepage trust, hero copy and safety disclaimer are first impression.' },
  { page: '/complaint', priority: 'P0', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Most important conversion and AI output workflow.' },
  { page: '/upi-help', priority: 'P0', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Fraud/urgent guidance needs precise wording and safety language.' },
  { page: '/scheme-finder', priority: 'P1', locales: ['ENGLISH', 'HINGLISH', 'HINDI', 'BENGALI', 'MARATHI'], reason: 'Eligibility/document language affects user decisions.' },
  { page: '/documents', priority: 'P1', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Document requirements must not be confusing.' },
  { page: '/pricing', priority: 'P1', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Payment/plan copy must be clear before paid launch.' },
  { page: '/privacy', priority: 'P1', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Trust, storage and privacy claims must be understood.' },
  { page: '/tools/scam-radar', priority: 'P1', locales: ['ENGLISH', 'HINGLISH', 'HINDI'], reason: 'Scam risk language should be calm, useful and not overpromising.' }
] as const

export function getProductionQaSummary() {
  const total = productionQaChecklist.length
  return {
    total,
    p0: productionQaChecklist.filter((item) => item.priority === 'P0').length,
    blocked: productionQaChecklist.filter((item) => item.status === 'BLOCKED').length,
    needsEvidence: productionQaChecklist.filter((item) => item.status === 'NEEDS_EVIDENCE').length,
    readyToRun: productionQaChecklist.filter((item) => item.status === 'READY_TO_RUN').length,
    canLaunch: productionQaChecklist.filter((item) => item.priority === 'P0').every((item) => item.status !== 'BLOCKED'),
    items: productionQaChecklist,
    priorityTranslationPages
  }
}
