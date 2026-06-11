import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

const outputDir = env('COMMUNITY_SAFETY_EVIDENCE_DIR', './artifacts/community-safety-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('COMMUNITY_SAFETY_ALERTS_MODE', 'dry_run')
const controls = [
  ['owner-assigned', 'P0', 'Community safety owner assigned', configured('COMMUNITY_SAFETY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_OWNER=${env('COMMUNITY_SAFETY_OWNER', 'empty')}`],
  ['mode-safe', 'P0', 'Safety alerts mode is safe', ['dry_run', 'manual_review', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `COMMUNITY_SAFETY_ALERTS_MODE=${mode}`],
  ['report-dry-run', 'P0', 'Public report intake starts in dry-run/manual review', enabled('COMMUNITY_SAFETY_REPORT_DRY_RUN') || env('COMMUNITY_SAFETY_REPORT_DRY_RUN', 'true') === 'true' ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_REPORT_DRY_RUN=${env('COMMUNITY_SAFETY_REPORT_DRY_RUN', 'true')}`],
  ['intake-reviewed', 'P0', 'Report intake copy reviewed', enabled('COMMUNITY_SAFETY_INTAKE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_INTAKE_REVIEWED=${env('COMMUNITY_SAFETY_INTAKE_REVIEWED', 'false')}`],
  ['moderation-reviewed', 'P0', 'Moderation workflow reviewed', enabled('COMMUNITY_SAFETY_MODERATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_MODERATION_REVIEWED=${env('COMMUNITY_SAFETY_MODERATION_REVIEWED', 'false')}`],
  ['redaction-reviewed', 'P0', 'PII/secret redaction reviewed', enabled('COMMUNITY_SAFETY_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_REDACTION_REVIEWED=${env('COMMUNITY_SAFETY_REDACTION_REVIEWED', 'false')}`],
  ['official-source-reviewed', 'P1', 'Official reporting/source routes reviewed', enabled('COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED=${env('COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED', 'false')}`],
  ['escalation-reviewed', 'P1', 'High-risk escalation path reviewed', enabled('COMMUNITY_SAFETY_ESCALATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_ESCALATION_REVIEWED=${env('COMMUNITY_SAFETY_ESCALATION_REVIEWED', 'false')}`],
  ['public-alert-reviewed', 'P1', 'Public alert publishing reviewed', enabled('COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED=${env('COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED', 'false')}`]
]

const lanes = [
  ['upi-fraud-warning', 'P0', 'UPI_FRAUD', 'Fake QR, wrong transfer, refund call, screen-share or urgent payment fraud signal.', 'Remove UPI IDs, phone numbers, bank data, names and raw screenshots.', 'Aggregated pattern alert with official reporting reminder.'],
  ['loan-app-harassment', 'P0', 'LOAN_APP', 'Loan app harassment or fake recovery agent report.', 'High-risk review for blackmail, threats and contact abuse.', 'Education alert with proof checklist and support route.'],
  ['job-offer-scam', 'P1', 'JOB_SCAM', 'Task job, interview fee or earning group signal.', 'Moderate company/recruiter details before trend display.', 'Job scam checklist and fee warning.'],
  ['shopping-refund-scam', 'P1', 'SHOPPING_REFUND', 'Fake support number, refund OTP/PIN request or wrong-item pattern.', 'Remove order IDs, addresses and phone data.', 'Refund safety warning and official support reminder.'],
  ['govt-form-agent-fraud', 'P1', 'GOVT_FORM', 'Fake scholarship, form agent overcharge or document verification fraud.', 'Verify official source and avoid government endorsement confusion.', 'Official-source awareness alert.'],
  ['call-sms-link-alert', 'P2', 'CALL_SMS_LINK', 'Suspicious SMS link, KYC update link or parcel/courier call.', 'Block live malicious links and redact phone numbers.', 'Generic pattern alert and safe verification checklist.']
]

const readiness = {
  version: '3.0.59-community-safety-alerts',
  generatedAt: new Date().toISOString(),
  mode,
  summary: {
    totalControls: controls.length,
    ready: controls.filter((item) => item[3] === 'PASS' || item[3] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((item) => item[3] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((item) => item[3] === 'BLOCKED').length,
    lanes: lanes.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  lanes: lanes.map(([id, priority, category, signal, moderation, publicOutput]) => ({ id, priority, category, signal, moderation, publicOutput }))
}

const csv = [
  'id,priority,label,status,env_value',
  ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
].join('\n') + '\n'

const laneCsv = [
  'id,priority,category,signal,moderation,public_output',
  ...readiness.lanes.map((item) => [item.id, item.priority, item.category, item.signal, item.moderation, item.publicOutput].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
].join('\n') + '\n'

const moderationChecklist = `# Community safety moderation checklist\n\n- Confirm report has no OTP, passwords, UPI PIN, CVV, full card/bank numbers, private IDs, address or raw document data.\n- Redact phone numbers, emails, UPI IDs, payment IDs, live links and screenshots before any public use.\n- Classify as pattern education, private support ticket, abuse escalation or reject/spam.\n- Do not publish private names, unverified accusations or defamatory claims.\n- Add official reporting/source route where relevant.\n- Escalate blackmail, harassment, threats, minors, self-harm risk and large money loss.\n`;

const redactionSample = `# Redaction sample\n\nRaw style: User says phone 9876543210 sent link https://bad.example and asked OTP 123456.\nSafe style: User reports a fake support caller sent a payment link and asked for secret verification details.\n\nPublic alert wording: Fake refund/support scams may ask for secret codes or payment links. Use official app support only and never share OTP, passwords, UPI PIN or CVV.\n`;

writeFileSync(join(outputDir, 'community-safety-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'community-safety-controls.csv'), csv)
writeFileSync(join(outputDir, 'community-safety-lanes.csv'), laneCsv)
writeFileSync(join(outputDir, 'moderation-checklist.md'), moderationChecklist)
writeFileSync(join(outputDir, 'redaction-sample.md'), redactionSample)
writeFileSync(join(outputDir, 'public-alert-template.md'), '# Public safety alert template\n\n**Pattern:** [Aggregated pattern, no private names]\n\n**Warning signs:** [Short bullets]\n\n**What to do:** [Official route + safe proof checklist]\n\n**Never share:** OTP, password, UPI PIN, CVV, full card/bank data or private documents.\n')

console.log('\nCommunity safety readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
