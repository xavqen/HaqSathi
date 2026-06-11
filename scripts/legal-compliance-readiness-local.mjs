import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.LEGAL_COMPLIANCE_EVIDENCE_DIR || './artifacts/legal-compliance'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

const routes = env('LEGAL_COMPLIANCE_ROUTE_TARGETS', '/privacy,/terms,/disclaimer,/contact,/pricing,/complaint,/upi-help,/documents,/dashboard/privacy-center,/newsletter')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const controls = [
  ['owner-assigned', 'P0', 'Legal/compliance review owner assigned', configured('LEGAL_COMPLIANCE_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `LEGAL_COMPLIANCE_OWNER=${env('LEGAL_COMPLIANCE_OWNER') || 'empty'}`],
  ['guidance-disclaimer-reviewed', 'P0', 'Guidance-only disclaimer reviewed', enabled('LEGAL_GUIDANCE_DISCLAIMER_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `LEGAL_GUIDANCE_DISCLAIMER_REVIEWED=${env('LEGAL_GUIDANCE_DISCLAIMER_REVIEWED', 'false')}`],
  ['privacy-policy-reviewed', 'P0', 'Privacy policy behavior reviewed', enabled('LEGAL_PRIVACY_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `LEGAL_PRIVACY_POLICY_REVIEWED=${env('LEGAL_PRIVACY_POLICY_REVIEWED', 'false')}`],
  ['terms-reviewed', 'P0', 'Terms, refund and billing copy reviewed', enabled('LEGAL_TERMS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `LEGAL_TERMS_REVIEWED=${env('LEGAL_TERMS_REVIEWED', 'false')}`],
  ['dpdp-reviewed', 'P1', 'India DPDP/privacy operations reviewed', enabled('LEGAL_DPDP_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `LEGAL_DPDP_REVIEWED=${env('LEGAL_DPDP_REVIEWED', 'false')}`],
  ['ads-affiliate-reviewed', 'P1', 'Ads, affiliate and sponsored-content disclosure reviewed', enabled('LEGAL_ADS_AFFILIATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `LEGAL_ADS_AFFILIATE_REVIEWED=${env('LEGAL_ADS_AFFILIATE_REVIEWED', 'false')}`],
  ['age-safety-reviewed', 'P1', 'Minor/age safety review completed', enabled('LEGAL_MINOR_SAFETY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `LEGAL_MINOR_SAFETY_REVIEWED=${env('LEGAL_MINOR_SAFETY_REVIEWED', 'false')}`],
  ['evidence-dir', 'P2', 'Legal compliance evidence directory configured', 'READY_TO_TEST', `LEGAL_COMPLIANCE_EVIDENCE_DIR=${outputDir}`]
]

const routeRows = routes.map((route, index) => [
  route,
  index < 5 ? 'P0' : index < 8 ? 'P1' : 'P2',
  'Disclaimer; privacy behavior; no guaranteed outcome claims; contact/support path; billing/refund clarity',
  'Mobile screenshot; desktop screenshot; reviewer/date note; copy approval diff or note'
])

const copyRisks = [
  ['official-authority-claim', 'P0', 'Do not claim the app is official government/court/bank/legal authority'],
  ['guaranteed-outcome-claim', 'P0', 'Do not guarantee refunds, complaint success, scheme approval or legal outcomes'],
  ['secret-data-request', 'P0', 'Do not ask for OTP, passwords, UPI PIN, full card number or secret banking data'],
  ['sponsored-disclosure', 'P1', 'Disclose ads, affiliate/referral rewards and sponsored placement where applicable'],
  ['privacy-behavior-mismatch', 'P1', 'Privacy policy must match analytics, storage, payment, email and support behavior']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.42-legal-compliance-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    routes: routes.length,
    p0Routes: routeRows.filter((row) => row[1] === 'P0').length,
    copyRiskRules: copyRisks.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  pageReviews: routeRows.map(([route, priority, checks, evidence]) => ({ route, priority, checks, evidence })),
  copyRisks: copyRisks.map(([id, priority, rule]) => ({ id, priority, rule })),
  nextAction: manualRequired ? 'Complete legal copy, privacy, terms and disclaimer review before public launch.' : 'Legal compliance readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'legal-compliance-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'legal-compliance-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'legal-compliance-pages.csv'), csv([['route', 'priority', 'checks', 'evidence_required'], ...routeRows]))
writeFileSync(join(outputDir, 'legal-compliance-copy-risks.csv'), csv([['id', 'priority', 'rule'], ...copyRisks]))

console.log(`✅ Legal compliance readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Routes: ${routes.length} · Copy rules: ${copyRisks.length}`)
