import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.ACCOUNT_SECURITY_EVIDENCE_DIR || './artifacts/account-security'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost-only/i.test(env(name)))

const factors = [
  ['passkeys', 'Passkeys / WebAuthn', enabled('PASSKEYS_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'HTTPS production domain + browser QA required'],
  ['totp', 'Authenticator app 2FA', ['optional', 'admin_only', 'required'].includes(env('TWO_FACTOR_ENFORCEMENT') || 'optional') ? 'READY_TO_TEST' : 'BLOCKED', `Mode: ${env('TWO_FACTOR_ENFORCEMENT') || 'optional'}`],
  ['backup-codes', 'Backup recovery codes', enabled('BACKUP_CODES_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Required before forcing 2FA'],
  ['email-verification', 'Email verification gate', configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Needs real inbox delivery proof'],
  ['session-review', 'Session review', enabled('SESSION_REVIEW_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Review active sessions on user security page'],
  ['risk-alerts', 'Risk alerts', configured('ACCOUNT_SECURITY_ALERT_EMAIL') || configured('ERROR_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Needs email/webhook alert proof']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.19-account-security-readiness',
  mode: env('ACCOUNT_SECURITY_MODE') || 'readiness',
  enforcement: env('TWO_FACTOR_ENFORCEMENT') || 'optional',
  summary: {
    totalFactors: factors.length,
    ready: factors.filter((factor) => factor[2] === 'READY_TO_TEST' || factor[2] === 'PASS').length,
    manualRequired: factors.filter((factor) => factor[2] === 'MANUAL_REQUIRED').length,
    blocked: factors.filter((factor) => factor[2] === 'BLOCKED').length
  },
  factors: factors.map(([id, label, status, note]) => ({ id, label, status, note })),
  minimumEvidence: [
    'Admin account 2FA setup and recovery screenshot',
    'Backup code generate + use-once proof',
    'Passkey HTTPS domain test on mobile and desktop, if enabled',
    'Security event alert delivery proof',
    'Session review screenshot from /dashboard/security',
    'Admin readiness screenshot from /admin/account-security'
  ]
}

const csvRows = [
  ['factor_id', 'label', 'status', 'note'],
  ...factors.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'account-security-readiness-local.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'account-security-readiness-local.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Account security readiness evidence written to ${outputDir}`)
console.log(`Factors: ${report.summary.totalFactors} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
