import { getLaunchEvidenceSummary } from '@/lib/qa/launch-evidence'

export type LaunchCommandStatus = 'GO' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type LaunchCommandControl = {
  id: string
  label: string
  status: LaunchCommandStatus
  owner: string
  envValue: string
  passCondition: string
  evidenceRequired: string
}

export type LaunchCommandAction = {
  id: string
  priority: 'P0' | 'P1' | 'P2'
  title: string
  owner: string
  nextStep: string
}

export type LaunchCommandCenterReport = {
  generatedAt: string
  version: string
  decision: LaunchCommandStatus
  summary: {
    totalControls: number
    go: number
    readyToTest: number
    manualRequired: number
    blocked: number
    evidenceGates: number
    evidenceBlocked: number
    evidenceManualRequired: number
  }
  controls: LaunchCommandControl[]
  evidenceSummary: ReturnType<typeof getLaunchEvidenceSummary>
  actions: LaunchCommandAction[]
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

function control(
  id: string,
  label: string,
  ok: boolean,
  owner: string,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  blocked = false
): LaunchCommandControl {
  return {
    id,
    label,
    status: ok ? 'GO' : blocked ? 'BLOCKED' : 'MANUAL_REQUIRED',
    owner,
    envValue,
    passCondition,
    evidenceRequired
  }
}

function readinessControl(
  id: string,
  label: string,
  ok: boolean,
  owner: string,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  blocked = false
): LaunchCommandControl {
  return {
    id,
    label,
    status: ok ? 'READY_TO_TEST' : blocked ? 'BLOCKED' : 'MANUAL_REQUIRED',
    owner,
    envValue,
    passCondition,
    evidenceRequired
  }
}

export function getLaunchCommandCenterReport(): LaunchCommandCenterReport {
  const evidenceSummary = getLaunchEvidenceSummary()
  const controls: LaunchCommandControl[] = [
    control(
      'founder-signoff',
      'Founder final approval',
      enabled('LAUNCH_FOUNDER_SIGNOFF'),
      'Founder',
      `LAUNCH_FOUNDER_SIGNOFF=${env('LAUNCH_FOUNDER_SIGNOFF', 'false')}`,
      'Founder has reviewed final domain, pricing, homepage, core flows, legal text and launch evidence.',
      'Founder approval note or screenshot saved in final launch folder.'
    ),
    control(
      'go-no-go-meeting',
      'Go/no-go meeting completed',
      enabled('LAUNCH_GO_NO_GO_COMPLETED'),
      'Founder/QA',
      `LAUNCH_GO_NO_GO_COMPLETED=${env('LAUNCH_GO_NO_GO_COMPLETED', 'false')}`,
      'Final launch decision is reviewed with owners for product, security, support, payment, email and content.',
      'Go/no-go checklist export and owner approvals saved.'
    ),
    readinessControl(
      'production-domain',
      'Production domain ready',
      /^https:\/\//i.test(env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL')) && !/localhost|127\.0\.0\.1|example|your-domain/i.test(env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL')),
      'Developer',
      `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}; NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`,
      'Live HTTPS domain resolves to the latest Vercel production deployment.',
      'Production URL screenshot, Vercel deployment ID and DNS proof.',
      !/^https:\/\//i.test(env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL'))
    ),
    readinessControl(
      'deployment-qa-proof',
      'Deployment QA proof saved',
      enabled('LAUNCH_DEPLOYMENT_QA_APPROVED') || (enabled('PLAYWRIGHT_PRODUCTION_PASSED') && enabled('LIGHTHOUSE_PRODUCTION_PASSED') && enabled('MOBILE_VIEWPORT_QA_PASSED') && enabled('DESKTOP_VIEWPORT_QA_PASSED')),
      'QA',
      `LAUNCH_DEPLOYMENT_QA_APPROVED=${env('LAUNCH_DEPLOYMENT_QA_APPROVED', 'false')}`,
      'Production Playwright, Lighthouse, mobile and desktop UI evidence is complete.',
      'Artifacts from npm run deployment:qa-readiness plus screenshots/reports.'
    ),
    readinessControl(
      'payment-proof',
      'Payment lifecycle proof saved',
      enabled('LAUNCH_PAYMENT_APPROVED') || (configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_WEBHOOK_SECRET') && env('PAYMENT_DRY_RUN') === 'false'),
      'Finance/Developer',
      `LAUNCH_PAYMENT_APPROVED=${env('LAUNCH_PAYMENT_APPROVED', 'false')}; PAYMENT_DRY_RUN=${env('PAYMENT_DRY_RUN', 'true')}`,
      'Razorpay checkout, success, failure, webhook and invoice/receipt lanes are verified.',
      'Sandbox/live event IDs, webhook proof, invalid-signature proof and DB screenshots.'
    ),
    readinessControl(
      'email-proof',
      'Email delivery proof saved',
      enabled('LAUNCH_EMAIL_APPROVED') || (configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL') && env('EMAIL_DELIVERY_DRY_RUN') === 'false'),
      'Developer',
      `LAUNCH_EMAIL_APPROVED=${env('LAUNCH_EMAIL_APPROVED', 'false')}; EMAIL_DELIVERY_DRY_RUN=${env('EMAIL_DELIVERY_DRY_RUN', 'true')}`,
      'Verification, reset, receipt/reminder and test email delivery work on deployed domain.',
      'Real inbox screenshots, Resend DNS dashboard, bounce/complaint readiness proof.'
    ),
    readinessControl(
      'storage-proof',
      'Supabase storage proof saved',
      enabled('LAUNCH_STORAGE_APPROVED') || (configured('NEXT_PUBLIC_SUPABASE_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') && configured('SUPABASE_STORAGE_BUCKET')),
      'Developer',
      `LAUNCH_STORAGE_APPROVED=${env('LAUNCH_STORAGE_APPROVED', 'false')}; SUPABASE_STORAGE_BUCKET=${env('SUPABASE_STORAGE_BUCKET') || 'empty'}`,
      'Private bucket upload/download/delete and unsafe-file blocking are verified.',
      'Safe upload proof, blocked unsafe file proof, private bucket screenshot.'
    ),
    readinessControl(
      'official-data-proof',
      'Official data proof saved',
      enabled('LAUNCH_OFFICIAL_DATA_APPROVED'),
      'Content/QA',
      `LAUNCH_OFFICIAL_DATA_APPROVED=${env('LAUNCH_OFFICIAL_DATA_APPROVED', 'false')}`,
      'Scheme, authority and official-link samples are manually checked before public launch.',
      'Source screenshots, reviewer/date proof and link-check evidence.'
    ),
    readinessControl(
      'ai-safety-proof',
      'AI safety proof saved',
      enabled('LAUNCH_AI_SAFETY_APPROVED') || env('AI_GUARDRAILS_MODE', 'review') !== 'off',
      'AI Safety/QA',
      `LAUNCH_AI_SAFETY_APPROVED=${env('LAUNCH_AI_SAFETY_APPROVED', 'false')}; AI_GUARDRAILS_MODE=${env('AI_GUARDRAILS_MODE', 'review')}`,
      'High-risk AI lanes have redaction, confidence, review and escalation evidence.',
      'AI safety readiness artifacts and flagged output review proof.',
      env('AI_GUARDRAILS_MODE', 'review') === 'off'
    ),
    readinessControl(
      'support-proof',
      'Support operations proof saved',
      enabled('LAUNCH_SUPPORT_APPROVED') || configured('SUPPORT_EMAIL') || configured('SUPPORT_ESCALATION_EMAIL'),
      'Support/Admin',
      `LAUNCH_SUPPORT_APPROVED=${env('LAUNCH_SUPPORT_APPROVED', 'false')}; SUPPORT_EMAIL=${env('SUPPORT_EMAIL') || 'empty'}`,
      'User support inbox/ticket/escalation path is ready before public traffic.',
      'Guest ticket, logged-in ticket and escalation proof.'
    ),
    control(
      'rollback-owner',
      'Rollback owner assigned',
      configured('LAUNCH_ROLLBACK_OWNER'),
      'Developer/Founder',
      `LAUNCH_ROLLBACK_OWNER=${env('LAUNCH_ROLLBACK_OWNER') || 'empty'}`,
      'A real owner is responsible for rollback, DNS pause, payment disable and incident notice if launch fails.',
      'Rollback owner name/contact and rollback steps saved.'
    ),
    control(
      'incident-owner',
      'Incident owner assigned',
      configured('LAUNCH_INCIDENT_OWNER'),
      'Ops/Support',
      `LAUNCH_INCIDENT_OWNER=${env('LAUNCH_INCIDENT_OWNER') || 'empty'}`,
      'A real owner monitors errors, support tickets, payments and emails after launch.',
      'Incident owner name/contact and monitoring window saved.'
    )
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const readyToTest = controls.filter((item) => item.status === 'READY_TO_TEST').length
  const go = controls.filter((item) => item.status === 'GO').length
  const evidenceBlocked = evidenceSummary.blocked
  const evidenceManualRequired = evidenceSummary.manualRequired

  const actions: LaunchCommandAction[] = []
  for (const item of controls.filter((entry) => entry.status === 'BLOCKED')) {
    actions.push({ id: `fix-${item.id}`, priority: 'P0', title: item.label, owner: item.owner, nextStep: item.passCondition })
  }
  for (const item of controls.filter((entry) => entry.status === 'MANUAL_REQUIRED').slice(0, 8)) {
    actions.push({ id: `review-${item.id}`, priority: 'P1', title: item.label, owner: item.owner, nextStep: item.evidenceRequired })
  }
  if (evidenceBlocked > 0) {
    actions.push({ id: 'resolve-evidence-blockers', priority: 'P0', title: 'Resolve blocked launch evidence gates', owner: 'Founder/QA', nextStep: 'Open /admin/production-qa and fix every BLOCKED launch gate before public traffic.' })
  }
  if (actions.length === 0) {
    actions.push({ id: 'launch-window', priority: 'P2', title: 'Schedule controlled launch window', owner: 'Founder', nextStep: 'Open public traffic gradually, watch errors/support/payment/email for the first 24 hours and keep rollback owner available.' })
  }

  const decision: LaunchCommandStatus = blocked > 0 || evidenceBlocked > 0 ? 'BLOCKED' : manualRequired > 0 || evidenceManualRequired > 0 ? 'MANUAL_REQUIRED' : readyToTest > 0 ? 'READY_TO_TEST' : 'GO'

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.34-launch-command-center',
    decision,
    summary: {
      totalControls: controls.length,
      go,
      readyToTest,
      manualRequired,
      blocked,
      evidenceGates: evidenceSummary.total,
      evidenceBlocked,
      evidenceManualRequired
    },
    controls,
    evidenceSummary,
    actions,
    runbook: [
      'Run npm run quality:release and fix any audit failure before deployment.',
      'Deploy preview, run smoke checks, then promote only if preview is clean.',
      'Set VERCEL_PRODUCTION_URL and run npm run deployment:qa-readiness on the production URL.',
      'Save payment, email, storage, official data, AI safety, support and mobile/desktop evidence.',
      'Open /admin/launch-command-center and resolve every P0/P1 action.',
      'Set founder, go/no-go, rollback owner and incident owner env controls only after evidence is saved.',
      'Launch gradually, monitor the first 24 hours, and pause ads/SEO pushes if incident signals appear.'
    ]
  }
}
