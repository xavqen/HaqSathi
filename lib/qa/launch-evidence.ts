export type LaunchGateStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type LaunchEvidenceGate = {
  area: string
  status: LaunchGateStatus
  owner: string
  commandOrCheck: string
  passCondition: string
  evidenceToSave: string
  productionNotes: string
}

function hasEnv(name: string) {
  const value = process.env[name]
  return Boolean(value && !/change-this|PROJECT_REF|YOUR-PASSWORD|haqsathi\.local|example/i.test(value))
}

export function getLaunchEvidenceGates(): LaunchEvidenceGate[] {
  return [
    {
      area: 'Build + TypeScript',
      status: 'READY_TO_TEST',
      owner: 'Developer',
      commandOrCheck: 'npm run db:generate && npm run typecheck && npm run build',
      passCondition: 'No Prisma client, TypeScript, route, or Next build error.',
      evidenceToSave: 'Terminal screenshot or CI logs from a clean install.',
      productionNotes: 'Run from a fresh folder, not only from a previously generated local cache.'
    },
    {
      area: 'Mobile/Desktop Playwright',
      status: 'READY_TO_TEST',
      owner: 'QA',
      commandOrCheck: 'npm run test:e2e:install && npm run test:e2e',
      passCondition: 'Home, tools, complaint and dashboard smoke flows pass at mobile and desktop viewport.',
      evidenceToSave: 'Playwright HTML report or terminal output.',
      productionNotes: 'Set E2E_BASE_URL to deployed Vercel URL for final launch QA.'
    },
    {
      area: 'Lighthouse Speed',
      status: 'READY_TO_TEST',
      owner: 'QA',
      commandOrCheck: 'LIGHTHOUSE_BASE_URL=https://your-domain.com npm run lighthouse:local',
      passCondition: 'No critical performance/accessibility/SEO regression on homepage and key tool pages.',
      evidenceToSave: 'Generated Lighthouse JSON/HTML output under artifacts/lighthouse.',
      productionNotes: 'Run only after Vercel deployment because local scores can hide CDN/cache issues.'
    },
    {
      area: 'Razorpay Subscription Lifecycle',
      status: hasEnv('RAZORPAY_KEY_ID') && hasEnv('RAZORPAY_KEY_SECRET') && hasEnv('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Founder/Admin',
      commandOrCheck: 'Create test checkout → pay → verify webhook → confirm plan upgrade and payment status.',
      passCondition: 'PaymentOrder becomes PAID/FAILED correctly and user plan changes only after valid signature.',
      evidenceToSave: 'Razorpay event ID, user email, DB payment row, webhook response log.',
      productionNotes: 'Use test mode first. Never mark paid from frontend-only callback without server verification.'
    },
    {
      area: 'Resend Email Delivery',
      status: hasEnv('RESEND_API_KEY') && hasEnv('RESEND_FROM_EMAIL') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Founder/Admin',
      commandOrCheck: 'Register, verify email, forgot password, reminder/test email.',
      passCondition: 'Inbox receives links, links expire/use once, EmailLog records status.',
      evidenceToSave: 'Inbox screenshot, EmailLog row, API response without dev links.',
      productionNotes: 'Use a verified sending domain before production launch.'
    },
    {
      area: 'Supabase Storage Vault',
      status: hasEnv('NEXT_PUBLIC_SUPABASE_URL') && hasEnv('SUPABASE_SERVICE_ROLE_KEY') && hasEnv('SUPABASE_STORAGE_BUCKET') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Developer',
      commandOrCheck: 'Open /api/document-vault/self-test after login/admin test or run upload/download from dashboard.',
      passCondition: 'Upload, list metadata, signed download and owner-only access work.',
      evidenceToSave: 'Self-test JSON, uploaded file row, signed URL access proof.',
      productionNotes: 'Bucket must stay private. Service role key must never be NEXT_PUBLIC.'
    },
    {
      area: 'Official Link Verification',
      status: 'MANUAL_REQUIRED',
      owner: 'Content/Admin',
      commandOrCheck: 'Admin → Source Verification / Link Checks. Open every official URL and verify deep paths.',
      passCondition: 'Every public official link is marked VERIFIED or NEEDS_REVIEW with a note.',
      evidenceToSave: 'Verification date, reviewer name, source screenshot, notes for changed links.',
      productionNotes: 'Do not publish date/deadline-specific scheme claims without same-day official verification.'
    },
    {
      area: 'Translation Coverage',
      status: 'MANUAL_REQUIRED',
      owner: 'Content/Admin',
      commandOrCheck: 'Admin → Language Coverage and Localization. Review top 20 traffic pages first.',
      passCondition: 'Core shell + top tool pages are human-reviewed in priority languages.',
      evidenceToSave: 'Language coverage export, reviewer notes, before/after screenshots.',
      productionNotes: 'Machine translated text should be treated as draft until reviewed.'
    },
    {
      area: 'Security Headers + CSRF',
      status: 'READY_TO_TEST',
      owner: 'Developer',
      commandOrCheck: 'Open /admin/security-hardening and test POST requests with/without same-origin headers.',
      passCondition: 'Security hardening page passes and cross-origin unsafe writes are blocked.',
      evidenceToSave: 'Header screenshot, failed cross-origin request, successful same-origin request.',
      productionNotes: 'Recheck after domain/proxy changes.'
    },
    {
      area: 'Final Vercel Deployment QA',
      status: 'MANUAL_REQUIRED',
      owner: 'Founder/Admin',
      commandOrCheck: 'Deploy to Vercel → run quality:release locally → run e2e/lighthouse against production URL.',
      passCondition: 'No critical error in Vercel logs, API routes, auth, storage, payment, email, mobile UI and SEO pages.',
      evidenceToSave: 'Vercel deployment URL, build log, e2e report, Lighthouse report, manual QA checklist.',
      productionNotes: 'Only after this gate should ads/SEO/marketing traffic be sent.'
    }
  ]
}

export function getLaunchEvidenceSummary() {
  const gates = getLaunchEvidenceGates()
  return {
    total: gates.length,
    pass: gates.filter((gate) => gate.status === 'PASS').length,
    readyToTest: gates.filter((gate) => gate.status === 'READY_TO_TEST').length,
    manualRequired: gates.filter((gate) => gate.status === 'MANUAL_REQUIRED').length,
    blocked: gates.filter((gate) => gate.status === 'BLOCKED').length,
    gates
  }
}
