import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.ENTITLEMENT_EVIDENCE_DIR || './artifacts/entitlement-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const allowedModes = ['dry_run', 'manual_review', 'enforce', 'disabled']
const mode = env('ENTITLEMENT_ENFORCEMENT_MODE', 'dry_run')

const controls = [
  ['owner-assigned', 'P0', 'Entitlement owner assigned', configured('ENTITLEMENT_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ENTITLEMENT_OWNER=${env('ENTITLEMENT_OWNER') || 'empty'}`],
  ['mode-safe', 'P0', 'Entitlement mode is safe', allowedModes.includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `ENTITLEMENT_ENFORCEMENT_MODE=${mode}`],
  ['quota-rules-reviewed', 'P0', 'Plan quota rules reviewed', enabled('ENTITLEMENT_QUOTA_RULES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ENTITLEMENT_QUOTA_RULES_REVIEWED=${env('ENTITLEMENT_QUOTA_RULES_REVIEWED', 'false')}`],
  ['downgrade-flow-reviewed', 'P0', 'Downgrade/cancel/failure flow reviewed', enabled('ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED=${env('ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED', 'false')}`],
  ['webhook-sync-reviewed', 'P0', 'Payment webhook/subscription sync reviewed', enabled('ENTITLEMENT_WEBHOOK_SYNC_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ENTITLEMENT_WEBHOOK_SYNC_REVIEWED=${env('ENTITLEMENT_WEBHOOK_SYNC_REVIEWED', 'false')}`],
  ['paywall-copy-reviewed', 'P1', 'Paywall and limit copy reviewed', enabled('ENTITLEMENT_PAYWALL_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ENTITLEMENT_PAYWALL_COPY_REVIEWED=${env('ENTITLEMENT_PAYWALL_COPY_REVIEWED', 'false')}`],
  ['admin-bypass-reviewed', 'P1', 'Admin/test bypass reviewed', enabled('ENTITLEMENT_ADMIN_BYPASS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ENTITLEMENT_ADMIN_BYPASS_REVIEWED=${env('ENTITLEMENT_ADMIN_BYPASS_REVIEWED', 'false')}`],
  ['evidence-reviewed', 'P2', 'Entitlement evidence pack reviewed', enabled('ENTITLEMENT_EVIDENCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ENTITLEMENT_EVIDENCE_REVIEWED=${env('ENTITLEMENT_EVIDENCE_REVIEWED', 'false')}`]
]

const lanes = [
  ['free-ai-draft-limit', 'P0', 'FREE', 'Limited monthly AI complaint/tool drafts', 'Show remaining count and helpful upgrade CTA', 'Keep free access and read-only saved history', 'Do not gate emergency, privacy, official source or disclaimer pages'],
  ['premium-unlimited-tools', 'P0', 'PRO', 'Premium/Paid AI tool usage', 'Allow premium lanes using verified server-side plan state', 'Stop premium generation after cancellation/failure grace rules', 'Never trust client-only plan flags'],
  ['family-shared-access', 'P1', 'FAMILY', 'Family/shared account limits', 'Support shared usage without exposing private cases by default', 'Members fall back to personal safe free access', 'No private data sharing without explicit sharing'],
  ['agent-business-access', 'P1', 'AGENT', 'Agent/business workflow limits', 'Higher-volume workflows with audit and abuse controls', 'Agent workflows become read-only/unavailable on downgrade', 'Agent actions need auditability and user consent'],
  ['admin-bypass-policy', 'P0', 'ADMIN', 'Admin/test account bypass rules', 'Bypass only in staging or approved dry-run contexts', 'Disable quickly through feature flags during incidents', 'Never skip payment, privacy, vault safety, abuse or audit gates for real traffic']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.55-entitlement-readiness',
  mode,
  summary: { totalControls: controls.length, ready, manualRequired, blocked, entitlementLanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  entitlementLanes: lanes.map(([id, priority, plan, capability, expectedBehavior, downgradeBehavior, safetyRule]) => ({ id, priority, plan, capability, expectedBehavior, downgradeBehavior, safetyRule })),
  outputDir,
  nextAction: blocked ? 'Fix blocked entitlement mode.' : manualRequired ? 'Complete P0 quota, downgrade and webhook review.' : 'Entitlement gates are ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'entitlement-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'entitlement-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'entitlement-lanes.csv'), csv([['id', 'priority', 'plan', 'capability', 'expected_behavior', 'downgrade_behavior', 'safety_rule'], ...lanes]))
writeFileSync(join(outputDir, 'paywall-copy-review.md'), `# Paywall copy review\n\n- Free limit message is clear and non-manipulative.\n- Paid plan CTA shows plan name, price and billing basics.\n- Cancellation/refund/support links are visible.\n- Guidance-only disclaimers remain visible.\n`)
writeFileSync(join(outputDir, 'downgrade-test-matrix.md'), `# Downgrade test matrix\n\n- Active free user reaches monthly limit.\n- Active paid user can use premium tool.\n- Failed renewal moves user to grace/read-only rules.\n- Cancelled subscription stops premium generation after policy window.\n- Billing receipts and privacy export/delete remain available.\n`)
writeFileSync(join(outputDir, 'never-gate-routes.md'), `# Never gate these routes\n\n- Emergency/cyber fraud guidance.\n- Privacy, terms, disclaimer, data export/delete.\n- Official source links and safety warnings.\n- Billing receipts, cancellation, support and account security pages.\n`)

console.log(`✅ Entitlement evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
