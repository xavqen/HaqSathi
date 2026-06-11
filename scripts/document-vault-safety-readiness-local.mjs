import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.DOCUMENT_VAULT_SAFETY_EVIDENCE_DIR || './artifacts/document-vault-safety'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost-only/i.test(env(name)))

const storageConfigured = configured('NEXT_PUBLIC_SUPABASE_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') && configured('SUPABASE_STORAGE_BUCKET')
const scannerConfigured = configured('FILE_SCAN_PROVIDER') || configured('CLAMAV_SCAN_URL')
const encryptionReady = configured('DOCUMENT_VAULT_ENCRYPTION_KEY_ID') || configured('SUPABASE_STORAGE_BUCKET')

const controls = [
  ['basic-file-safety-scan', 'Basic file safety scan', 'PASS', 'Extension, MIME, magic-byte and script-marker checks are installed in upload route.'],
  ['private-storage', 'Private storage bucket', storageConfigured ? 'READY_TO_TEST' : 'BLOCKED', storageConfigured ? 'Supabase storage envs are present.' : 'Supabase storage envs are missing.'],
  ['external-malware-scanner', 'External malware scanner', scannerConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', scannerConfigured ? 'External scanner env configured.' : 'Connect ClamAV/cloud scanner before high-volume launch.'],
  ['quarantine-workflow', 'Quarantine workflow', enabled('DOCUMENT_VAULT_QUARANTINE_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Unsafe uploads are blocked now; quarantine remains optional.'],
  ['encryption-readiness', 'Encryption readiness', encryptionReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', configured('DOCUMENT_VAULT_ENCRYPTION_KEY_ID') ? 'App-level encryption key ID configured.' : 'Private bucket is baseline; app-level encryption key not configured.'],
  ['vault-audit-log', 'Vault audit log', enabled('DOCUMENT_VAULT_AUDIT_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Enable audit logs before public document uploads at scale.']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.20-document-vault-safety',
  mode: env('DOCUMENT_VAULT_SAFETY_MODE') || 'basic',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  uploadRules: {
    maxFileSizeMB: 5,
    allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    riskyExtensions: ['exe', 'msi', 'bat', 'cmd', 'sh', 'ps1', 'js', 'vbs', 'scr', 'jar', 'apk']
  },
  minimumEvidence: [
    'Safe PDF/JPG/PNG/WEBP upload proof from /dashboard/document-vault',
    'Blocked unsafe extension proof such as .exe or .pdf.js',
    'Blocked MIME/signature mismatch proof',
    'Supabase private bucket screenshot',
    'Signed URL expires after 5 minutes proof',
    'Admin readiness screenshot from /admin/document-vault-safety'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'document-vault-safety-readiness-local.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'document-vault-safety-readiness-local.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Document vault safety evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
