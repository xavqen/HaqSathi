import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const evidenceDir = process.env.LAUNCH_EVIDENCE_DIR || process.env.LAUNCH_QA_OUTPUT_DIR || './artifacts/live-launch-qa'
const lighthouseDir = process.env.LIGHTHOUSE_OUTPUT_DIR || './artifacts/lighthouse'
const playwrightDir = process.env.PLAYWRIGHT_REPORT_DIR || './playwright-report'
const testResultsDir = './test-results'
const codeScanDir = './artifacts/code-scan'
const outDir = evidenceDir
mkdirSync(outDir, { recursive: true })

const textExtensions = new Set(['.json', '.csv', '.html', '.txt', '.md', '.log'])
const includedExtensions = new Set(['.json', '.csv', '.html', '.txt', '.md', '.log', '.png', '.jpg', '.jpeg', '.webp', '.webm', '.zip'])
const ignoredDirs = new Set(['node_modules', '.next', '.git'])
const maxScanBytes = Number(process.env.LAUNCH_ARTIFACT_MAX_SECRET_SCAN_BYTES || 2_000_000)

const sensitivePatterns = [
  { id: 'openai-secret-key', pattern: /sk-(?:live|test|proj)-[A-Za-z0-9_-]{16,}/i },
  { id: 'razorpay-secret-env', pattern: /RAZORPAY_KEY_SECRET\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}/i },
  { id: 'razorpay-webhook-secret-env', pattern: /RAZORPAY_WEBHOOK_SECRET\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}/i },
  { id: 'supabase-service-role-env', pattern: /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["']?eyJ[A-Za-z0-9_-]+\./i },
  { id: 'generic-service-role-jwt', pattern: /service[_-]?role[\s\S]{0,80}eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/i },
  { id: 'auth-secret-env', pattern: /AUTH_SECRET\s*[:=]\s*["']?[A-Za-z0-9_\-]{20,}/i },
  { id: 'upstash-token-env', pattern: /UPSTASH_REDIS_REST_TOKEN\s*[:=]\s*["']?[A-Za-z0-9_\-]{20,}/i },
  { id: 'database-url-password', envKey: 'DATABASE_URL', pattern: /postgres(?:ql)?:\/\/[^\s:@]+:[^\s:@]{8,}@/i }
]

function walk(dir) {
  if (!existsSync(dir)) return []
  const files = []
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop()
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (ignoredDirs.has(entry.name)) continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (includedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(full)
    }
  }
  return files.sort()
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

function scanForSecrets(file) {
  const ext = path.extname(file).toLowerCase()
  if (!textExtensions.has(ext)) return []
  const stat = statSync(file)
  if (stat.size > maxScanBytes) return [{ id: 'secret-scan-skipped-large-file', file, note: `${stat.size} bytes exceeds scan limit` }]
  const text = readFileSync(file, 'utf8')
  return sensitivePatterns
    .filter((item) => item.pattern.test(text))
    .map((item) => ({ id: item.id, file, note: 'Sensitive-looking token pattern found. Review and remove/redact before sharing launch artifacts.' }))
}

const sourceDirs = [evidenceDir, lighthouseDir, playwrightDir, testResultsDir, codeScanDir]
const uniqueFiles = Array.from(new Set(sourceDirs.flatMap(walk)))
const files = uniqueFiles.map((file) => {
  const stat = statSync(file)
  return {
    path: path.relative(process.cwd(), file).replaceAll('\\\\', '/'),
    bytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
    sha256: sha256(file)
  }
})

const findings = uniqueFiles.flatMap(scanForSecrets).map((finding) => ({ ...finding, file: path.relative(process.cwd(), finding.file).replaceAll('\\\\', '/') }))
const hasFile = (name) => files.some((file) => file.path.endsWith(name))
const hasUnder = (segment) => files.some((file) => file.path.includes(segment))

const required = [
  { id: 'full-project-code-scan', ok: hasFile('full-project-code-scan.json'), expected: 'artifacts/code-scan/full-project-code-scan.json' },
  { id: 'deep-project-code-scan', ok: hasFile('deep-project-code-scan.json'), expected: 'artifacts/code-scan/deep-project-code-scan.json' },
  { id: 'live-launch-qa', ok: hasFile('live-launch-qa-report.json'), expected: 'artifacts/live-launch-qa/live-launch-qa-report.json' },
  { id: 'payment-storage-readiness', ok: hasFile('payment-storage-readiness.json'), expected: 'artifacts/live-launch-qa/payment-storage-readiness.json' },
  { id: 'final-evidence-gate', ok: hasFile('final-evidence-gate.json'), expected: 'artifacts/live-launch-qa/final-evidence-gate.json' },
  { id: 'production-ops-snapshot', ok: hasFile('production-ops-snapshot.json'), expected: 'artifacts/live-launch-qa/production-ops-snapshot.json' },
  { id: 'rollback-drill', ok: hasFile('rollback-drill.json'), expected: 'artifacts/live-launch-qa/rollback-drill.json' },
  { id: 'postlaunch-support', ok: hasFile('postlaunch-support-check.json'), expected: 'artifacts/live-launch-qa/postlaunch-support-check.json' },
  { id: 'lighthouse-report', ok: hasUnder('artifacts/lighthouse') && files.some((file) => file.path.endsWith('.html') || file.path.endsWith('.json')), expected: 'artifacts/lighthouse/*.html or *.json' },
  { id: 'playwright-report', ok: hasUnder('playwright-report') || hasUnder('test-results'), expected: 'playwright-report/index.html or test-results screenshots/json' }
]

const missingRequired = required.filter((item) => !item.ok)
const blockingFindings = findings.filter((item) => item.id !== 'secret-scan-skipped-large-file')
const decision = blockingFindings.length ? 'ARTIFACTS_BLOCKED_SECRET_REVIEW' : missingRequired.length ? 'ARTIFACTS_INCOMPLETE' : 'ARTIFACTS_OK'

const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  evidenceDir,
  summary: {
    totalFiles: files.length,
    requiredChecks: required.length,
    requiredPassing: required.length - missingRequired.length,
    secretFindings: findings.length,
    blockingSecretFindings: blockingFindings.length,
    decision
  },
  required,
  files,
  findings,
  sharingRules: [
    'Share the manifest and screenshots/reports only after secretFindings is 0 or manually reviewed.',
    'Do not share raw .env files, service-role keys, webhook secrets, database URLs or signed URLs.',
    'Keep SHA-256 hashes so final launch evidence can be verified against the exact files tested.'
  ]
}

const jsonPath = path.join(outDir, 'launch-artifact-manifest.json')
const csvPath = path.join(outDir, 'launch-artifact-manifest.csv')
writeFileSync(jsonPath, JSON.stringify(report, null, 2))
writeFileSync(csvPath, ['path,bytes,sha256,modified_at', ...files.map((file) => [file.path, file.bytes, file.sha256, file.modifiedAt].map((value) => `"${String(value).replaceAll('"', "'")}"`).join(','))].join('\n'))

for (const item of required) console.log(`${item.ok ? '✅' : '⚠️'} ${item.id}: ${item.ok ? 'found' : item.expected}`)
for (const finding of findings) console.log(`❌ ${finding.id}: ${finding.file}`)
console.log(`\nArtifact manifest: ${decision}`)
console.log(`Manifest saved to ${jsonPath}`)

if ((process.env.STRICT_LAUNCH_ARTIFACTS === 'true' || process.env.LAUNCH_STRICT_EVIDENCE_GATE === 'true') && decision !== 'ARTIFACTS_OK') process.exit(1)
