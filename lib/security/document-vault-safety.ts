export type VaultSafetyStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type VaultScanSeverity = 'info' | 'warning' | 'critical'

export type VaultSafetyFinding = {
  id: string
  label: string
  severity: VaultScanSeverity
  message: string
}

export type VaultFileSafetyScan = {
  allowed: boolean
  status: VaultSafetyStatus
  score: number
  fileName: string
  mimeType: string
  sizeBytes: number
  detectedType: string
  findings: VaultSafetyFinding[]
  checkedAt: string
}

export type VaultSafetyControl = {
  id: string
  label: string
  status: VaultSafetyStatus
  userValue: string
  adminValue: string
  launchNote: string
}

const MAX_SAFE_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp'])
const RISKY_EXTENSIONS = new Set(['exe', 'msi', 'bat', 'cmd', 'sh', 'ps1', 'js', 'vbs', 'scr', 'jar', 'apk', 'com', 'dll', 'php', 'html', 'svg'])

function env(name: string) {
  return process.env[name] || ''
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost-only/i.test(value))
}

function cleanFileName(name: string) {
  return (name || 'document').replace(/[\\/]+/g, '-').trim() || 'document'
}

function getExtensions(fileName: string) {
  return cleanFileName(fileName).toLowerCase().split('.').filter(Boolean).slice(1)
}

function detectMagicType(bytes: Uint8Array) {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png'
  if (bytes.length >= 12) {
    const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])
    const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (riff === 'RIFF' && webp === 'WEBP') return 'webp'
  }
  return 'unknown'
}

function sniffText(bytes: Uint8Array) {
  const head = bytes.slice(0, Math.min(bytes.length, 120_000))
  try {
    return new TextDecoder('latin1').decode(head).toLowerCase()
  } catch {
    return ''
  }
}

function mimeMatchesMagic(mimeType: string, detectedType: string) {
  if (detectedType === 'unknown') return false
  if (mimeType === 'application/pdf') return detectedType === 'pdf'
  if (mimeType === 'image/jpeg') return detectedType === 'jpg'
  if (mimeType === 'image/png') return detectedType === 'png'
  if (mimeType === 'image/webp') return detectedType === 'webp'
  return false
}

function extensionMatchesMagic(extension: string, detectedType: string) {
  if (!extension || detectedType === 'unknown') return false
  if (extension === 'jpeg') return detectedType === 'jpg'
  return extension === detectedType
}

export async function scanVaultFileSafety(file: File): Promise<VaultFileSafetyScan> {
  const safeName = cleanFileName(file.name)
  const extensions = getExtensions(safeName)
  const lastExtension = extensions[extensions.length - 1] || ''
  const findings: VaultSafetyFinding[] = []

  if (!file || file.size <= 0) {
    findings.push({ id: 'empty-file', label: 'Empty file', severity: 'critical', message: 'File is empty or unreadable.' })
  }

  if (file.size > MAX_SAFE_FILE_SIZE) {
    findings.push({ id: 'size-limit', label: 'Size limit', severity: 'critical', message: 'File is larger than the 5MB vault limit.' })
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    findings.push({ id: 'mime-blocked', label: 'Blocked MIME type', severity: 'critical', message: `MIME type ${file.type || 'unknown'} is not allowed.` })
  }

  if (!ALLOWED_EXTENSIONS.has(lastExtension)) {
    findings.push({ id: 'extension-blocked', label: 'Blocked extension', severity: 'critical', message: `.${lastExtension || 'unknown'} files are not allowed in the vault.` })
  }

  const riskyExtension = extensions.find((extension) => RISKY_EXTENSIONS.has(extension))
  if (riskyExtension) {
    findings.push({ id: 'risky-extension', label: 'Risky extension', severity: 'critical', message: `Filename contains risky .${riskyExtension} extension.` })
  }

  if (extensions.length > 1) {
    findings.push({ id: 'double-extension', label: 'Double extension', severity: 'warning', message: 'Filename has multiple extensions. Keep only the real PDF/image extension.' })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const detectedType = detectMagicType(bytes)

  if (detectedType === 'unknown') {
    findings.push({ id: 'magic-unknown', label: 'Unknown file signature', severity: 'critical', message: 'File signature does not match PDF/JPG/PNG/WEBP.' })
  }

  if (file.type && !mimeMatchesMagic(file.type, detectedType)) {
    findings.push({ id: 'mime-mismatch', label: 'MIME mismatch', severity: 'critical', message: `Browser MIME ${file.type || 'unknown'} does not match detected ${detectedType}.` })
  }

  if (lastExtension && !extensionMatchesMagic(lastExtension, detectedType)) {
    findings.push({ id: 'extension-mismatch', label: 'Extension mismatch', severity: 'critical', message: `Filename extension .${lastExtension} does not match detected ${detectedType}.` })
  }

  const text = sniffText(bytes)
  if (detectedType === 'pdf' && /(\/javascript|\/js\b|launch\s*\(|submitform\s*\(|embeddedfile|openaction)/i.test(text)) {
    findings.push({ id: 'pdf-active-content', label: 'PDF active content', severity: 'critical', message: 'PDF appears to contain scripts, launch actions or embedded files.' })
  }

  if (/<script\b|onerror\s*=|onload\s*=|javascript:/i.test(text)) {
    findings.push({ id: 'script-marker', label: 'Script marker', severity: 'critical', message: 'File contains script-like markers and is blocked.' })
  }

  if (/aadhaar|aadhar|pan\s*card|passport|bank\s*account|ifsc|otp|password/i.test(text)) {
    findings.push({ id: 'sensitive-data', label: 'Sensitive document markers', severity: 'warning', message: 'File may contain sensitive identity/financial data. Store only if necessary.' })
  }

  const criticalCount = findings.filter((finding) => finding.severity === 'critical').length
  const warningCount = findings.filter((finding) => finding.severity === 'warning').length
  const score = Math.max(0, 100 - criticalCount * 35 - warningCount * 10)
  const allowed = criticalCount === 0

  if (!findings.length) {
    findings.push({ id: 'clean-basic-scan', label: 'Basic safety scan passed', severity: 'info', message: 'Extension, MIME, file signature and basic active-content checks passed.' })
  }

  return {
    allowed,
    status: allowed ? 'PASS' : 'BLOCKED',
    score,
    fileName: safeName,
    mimeType: file.type || 'unknown',
    sizeBytes: file.size,
    detectedType,
    findings,
    checkedAt: new Date().toISOString()
  }
}

export function getDocumentVaultSafetyControls(): VaultSafetyControl[] {
  const storageConfigured = configured('NEXT_PUBLIC_SUPABASE_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') && configured('SUPABASE_STORAGE_BUCKET')
  const safetyMode = env('DOCUMENT_VAULT_SAFETY_MODE') || 'basic'
  const externalScanner = configured('FILE_SCAN_PROVIDER') || configured('CLAMAV_SCAN_URL')
  const encryptionReady = configured('DOCUMENT_VAULT_ENCRYPTION_KEY_ID') || configured('SUPABASE_STORAGE_BUCKET')
  const quarantineEnabled = enabled('DOCUMENT_VAULT_QUARANTINE_ENABLED')
  const auditEnabled = enabled('DOCUMENT_VAULT_AUDIT_ENABLED')

  return [
    {
      id: 'basic-file-safety-scan',
      label: 'Basic file safety scan',
      status: 'PASS',
      userValue: 'Uploads are checked for extension, MIME, magic bytes, script markers and risky PDF content.',
      adminValue: `Current safety mode: ${safetyMode}`,
      launchNote: 'This blocks obvious unsafe files without adding any external dependency.'
    },
    {
      id: 'private-storage',
      label: 'Private storage bucket',
      status: storageConfigured ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'Files should stay private and download only through short-lived signed URLs.',
      adminValue: storageConfigured ? 'Supabase URL, service role and bucket envs are present.' : 'Supabase Storage envs are missing.',
      launchNote: 'Bucket must be private. Never expose service role keys in client-side code.'
    },
    {
      id: 'external-malware-scanner',
      label: 'External malware scanner readiness',
      status: externalScanner ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Basic scan works now; external antivirus scan can be connected before public scale.',
      adminValue: externalScanner ? 'FILE_SCAN_PROVIDER or CLAMAV_SCAN_URL configured.' : 'No external malware scanner configured yet.',
      launchNote: 'Use ClamAV/cloud scanner for production document vault at scale.'
    },
    {
      id: 'quarantine-workflow',
      label: 'Quarantine workflow',
      status: quarantineEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Unsafe uploads are blocked immediately; quarantine can be enabled for manual review workflows.',
      adminValue: `DOCUMENT_VAULT_QUARANTINE_ENABLED=${quarantineEnabled ? 'true' : 'false'}`,
      launchNote: 'Quarantine is optional for MVP, but useful when support team manually reviews rejected files.'
    },
    {
      id: 'encryption-readiness',
      label: 'Encryption readiness',
      status: encryptionReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Supabase private storage is the baseline; app-level encryption can be added before sensitive-scale launch.',
      adminValue: configured('DOCUMENT_VAULT_ENCRYPTION_KEY_ID') ? 'App-level key identifier configured.' : 'No app-level encryption key ID configured.',
      launchNote: 'Use managed KMS/key rotation before claiming end-to-end or app-level encryption.'
    },
    {
      id: 'vault-audit-log',
      label: 'Vault audit log readiness',
      status: auditEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Upload/download actions should create audit evidence for privacy and support review.',
      adminValue: `DOCUMENT_VAULT_AUDIT_ENABLED=${auditEnabled ? 'true' : 'false'}`,
      launchNote: 'Enable audit logs before public launch with document uploads.'
    }
  ]
}

export function getDocumentVaultSafetyReadinessReport() {
  const controls = getDocumentVaultSafetyControls()
  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manual = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length

  return {
    version: '3.0.20-document-vault-safety',
    generatedAt: new Date().toISOString(),
    mode: env('DOCUMENT_VAULT_SAFETY_MODE') || 'basic',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired: manual,
      blocked,
      launchStatus: blocked > 0 ? 'NEEDS_STORAGE_SETUP' : manual > 0 ? 'READY_FOR_MANUAL_QA' : 'READY_TO_TEST'
    },
    controls,
    uploadRules: {
      maxFileSizeMB: 5,
      allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      allowedExtensions: Array.from(ALLOWED_EXTENSIONS),
      riskyExtensions: Array.from(RISKY_EXTENSIONS)
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
}
