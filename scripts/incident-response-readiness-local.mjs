import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if ((value.startsWith('\"') && value.endsWith('\"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const outputDir = process.env.INCIDENT_EVIDENCE_DIR || './artifacts/incident-response'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_/i.test(value))
}

function validMode(name, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'active', 'enforced'].includes(env(name, fallback))
}

const severityLanes = [
  ['sev0-security-privacy', 'P0', 'SEV0 security/privacy incident', '15m ack / 60m contain', 'vault exposure|payment compromise|admin takeover|data leak'],
  ['sev1-money-auth', 'P0', 'SEV1 payment/auth outage', '30m ack / 2h workaround', 'login broken|payment failing|subscription wrong|email recovery failing'],
  ['sev2-critical-flow', 'P1', 'SEV2 critical user flow issue', 'same-day triage / 24h fix', 'complaint broken|UPI unsafe|upload fails|mobile CTA blocked'],
  ['sev3-content-data', 'P1', 'SEV3 content/data freshness issue', '2 business days', 'official link changed|scheme stale|translation wrong|article outdated'],
  ['sev4-polish-observability', 'P2', 'SEV4 polish/observability issue', 'weekly quality review', 'minor layout|copy issue|analytics warning|admin UI clarity']
]

const controls = [
  ['incident-owner-assigned', 'P0', 'Incident commander owner assigned', configured('INCIDENT_COMMANDER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `INCIDENT_COMMANDER=${env('INCIDENT_COMMANDER') || 'empty'}`],
  ['incident-mode-safe', 'P0', 'Incident mode is safe for launch', validMode('INCIDENT_RESPONSE_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `INCIDENT_RESPONSE_MODE=${env('INCIDENT_RESPONSE_MODE', 'manual_review')}`],
  ['alert-channel-configured', 'P0', 'Primary alert channel configured', configured('INCIDENT_ALERT_WEBHOOK_URL') || configured('INCIDENT_ALERT_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `INCIDENT_ALERT_WEBHOOK_URL=${configured('INCIDENT_ALERT_WEBHOOK_URL') ? 'configured' : 'empty'}; INCIDENT_ALERT_EMAIL=${configured('INCIDENT_ALERT_EMAIL') ? 'configured' : 'empty'}`],
  ['status-page-reviewed', 'P1', 'User-facing status update path reviewed', enabled('INCIDENT_STATUS_PAGE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INCIDENT_STATUS_PAGE_REVIEWED=${env('INCIDENT_STATUS_PAGE_REVIEWED', 'false')}`],
  ['rollback-drill-reviewed', 'P0', 'Rollback drill reviewed', enabled('INCIDENT_ROLLBACK_DRILL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INCIDENT_ROLLBACK_DRILL_REVIEWED=${env('INCIDENT_ROLLBACK_DRILL_REVIEWED', 'false')}`],
  ['postmortem-template-ready', 'P1', 'Postmortem template ready', enabled('INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED=${env('INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED', 'false')}`],
  ['support-escalation-ready', 'P1', 'Support escalation path ready', enabled('INCIDENT_SUPPORT_ESCALATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INCIDENT_SUPPORT_ESCALATION_REVIEWED=${env('INCIDENT_SUPPORT_ESCALATION_REVIEWED', 'false')}`],
  ['evidence-preservation-ready', 'P0', 'Incident evidence preservation reviewed', enabled('INCIDENT_EVIDENCE_PRESERVATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INCIDENT_EVIDENCE_PRESERVATION_REVIEWED=${env('INCIDENT_EVIDENCE_PRESERVATION_REVIEWED', 'false')}`]
]

const runbook = [
  ['Declare severity and assign incident commander', 'Incident commander', 'incident ticket with severity and timestamp'],
  ['Contain user harm with rollback, feature disable or marketing pause', 'Founder/Ops', 'Vercel/env/traffic evidence'],
  ['Collect masked evidence from errors, audits, webhooks and screenshots', 'Developer/Security', 'masked evidence folder'],
  ['Publish user-safe status/support response when needed', 'Support/Founder', 'status or support macro screenshot'],
  ['Verify fix on mobile and desktop before closing', 'QA/Developer', 'before/after route screenshots'],
  ['Write postmortem for SEV0-SEV2 with prevention tasks', 'Incident commander', 'postmortem and action items']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.48-incident-response-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    severityLanes: severityLanes.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  severityLanes: severityLanes.map(([id, priority, label, responseTarget, examples]) => ({ id, priority, label, responseTarget, examples: examples.split('|') })),
  runbook: runbook.map(([step, owner, evidence]) => ({ step, owner, evidence })),
  firstHourChecklist: ['freeze risky deploys', 'assign severity and owner', 'collect masked evidence', 'rollback or disable risky feature', 'prepare user-safe status/support response'],
  outputDir,
  nextAction: blocked ? 'Fix blocked incident configuration.' : manualRequired ? 'Complete incident owner, alert, rollback, status, support and evidence reviews.' : 'Incident response readiness gates are complete.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'incident-response-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'incident-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'incident-severity-map.csv'), csv([['id', 'priority', 'label', 'response_target', 'examples'], ...severityLanes]))
writeFileSync(join(outputDir, 'incident-runbook.csv'), csv([['step', 'owner', 'evidence_required'], ...runbook]))
writeFileSync(join(outputDir, 'incident-postmortem-template.md'), `# Incident postmortem\n\n## Summary\n\n## Impact\n\n## Timeline\n\n## Root cause\n\n## What worked\n\n## What failed\n\n## Prevention tasks\n\n## Owners and due dates\n`)

console.log(`✅ Incident response readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Severity lanes: ${severityLanes.length}`)
