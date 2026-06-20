import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const outDir = process.env.LAUNCH_QA_OUTPUT_DIR || process.env.LAUNCH_EVIDENCE_DIR || './artifacts/live-launch-qa'
const lighthouseDir = process.env.LIGHTHOUSE_OUTPUT_DIR || './artifacts/lighthouse'
const playwrightDir = process.env.PLAYWRIGHT_REPORT_DIR || './playwright-report'
const codeScanDir = './artifacts/code-scan'
mkdirSync(outDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return env(name).toLowerCase() === 'true'
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD|\[.*\]/i.test(value))
}

function readJson(file) {
  if (!existsSync(file)) return null
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}

function hasAnyReport(dir, extensions) {
  if (!existsSync(dir)) return false
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop()
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (extensions.some((ext) => entry.name.endsWith(ext))) return true
    }
  }
  return false
}

const fullCodeScanPath = path.join(codeScanDir, 'full-project-code-scan.json')
const deepCodeScanPath = path.join(codeScanDir, 'deep-project-code-scan.json')
const liveQaPath = path.join(outDir, 'live-launch-qa-report.json')
const paymentStoragePath = path.join(outDir, 'payment-storage-readiness.json')
const opsSnapshotPath = path.join(outDir, 'production-ops-snapshot.json')
const rollbackDrillPath = path.join(outDir, 'rollback-drill.json')
const postLaunchSupportPath = path.join(outDir, 'postlaunch-support-check.json')
const fullCodeScan = readJson(fullCodeScanPath)
const deepCodeScan = readJson(deepCodeScanPath)
const liveQa = readJson(liveQaPath)
const paymentStorage = readJson(paymentStoragePath)
const opsSnapshot = readJson(opsSnapshotPath)
const rollbackDrill = readJson(rollbackDrillPath)
const postLaunchSupport = readJson(postLaunchSupportPath)

const gates = []
function gate(id, area, ok, status, evidence, nextStep, hardBlock = false) {
  gates.push({ id, area, ok, status: ok ? 'PASS' : hardBlock ? 'BLOCKED' : status, evidence, nextStep })
}

const productionUrl = env('VERCEL_PRODUCTION_URL') || env('LAUNCH_QA_BASE_URL') || env('NEXT_PUBLIC_APP_URL')

gate(
  'full-code-scan-artifact',
  'Full project code scan',
  Boolean(fullCodeScan && fullCodeScan.ok === true && (fullCodeScan.issues?.length || 0) === 0),
  'READY_TO_RUN',
  fullCodeScan ? `${fullCodeScanPath} · issues=${fullCodeScan.issues?.length ?? 'unknown'}` : `${fullCodeScanPath} missing`,
  'Run npm run scan:full or npm run scan:complete before launch evidence gate.'
)

gate(
  'deep-code-scan-artifact',
  'Deep code safety scan',
  Boolean(deepCodeScan && deepCodeScan.ok === true && (deepCodeScan.issues?.length || 0) === 0),
  'READY_TO_RUN',
  deepCodeScan ? `${deepCodeScanPath} · issues=${deepCodeScan.issues?.length ?? 'unknown'}` : `${deepCodeScanPath} missing`,
  'Run npm run scan:deep or npm run scan:complete before launch evidence gate.'
)

gate(
  'production-url',
  'Vercel production domain',
  /^https:\/\//i.test(productionUrl) && !/localhost|127\.0\.0\.1|example|your-domain|vercel\.app\/preview/i.test(productionUrl),
  'BLOCKED',
  productionUrl || 'missing',
  'Set VERCEL_PRODUCTION_URL or LAUNCH_QA_BASE_URL to the final https://haqsathi.site domain.',
  true
)

gate(
  'live-route-qa-artifact',
  'Live route smoke QA',
  Boolean(liveQa && (liveQa.summary?.blockers === 0 || liveQa.blockers?.length === 0)),
  'READY_TO_RUN',
  liveQa ? `${liveQaPath} · blockers=${liveQa.summary?.blockers ?? liveQa.blockers?.length ?? 'unknown'}` : `${liveQaPath} missing`,
  'Run LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa and keep the JSON artifact.'
)

gate(
  'ops-snapshot-artifact',
  'Production health and readiness snapshot',
  Boolean(opsSnapshot && (opsSnapshot.summary?.blockers === 0 || opsSnapshot.blockers?.length === 0)),
  'READY_TO_RUN',
  opsSnapshot ? `${opsSnapshotPath} · blockers=${opsSnapshot.summary?.blockers ?? opsSnapshot.blockers?.length ?? 'unknown'}` : `${opsSnapshotPath} missing`,
  'Run OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot after the production deploy.'
)


gate(
  'rollback-drill-artifact',
  'Incident rollback drill evidence',
  Boolean(rollbackDrill && rollbackDrill.decision === 'ROLLBACK_DRILL_READY'),
  'READY_TO_RUN',
  rollbackDrill ? `${rollbackDrillPath} · decision=${rollbackDrill.decision}` : `${rollbackDrillPath} missing`,
  'Run npm run launch:rollback-drill; confirm owners, backup, rollback target and maintenance notice before public launch.'
)


gate(
  'postlaunch-support-artifact',
  'Post-launch support and abuse readiness',
  Boolean(postLaunchSupport && postLaunchSupport.decision === 'POSTLAUNCH_SUPPORT_READY'),
  'READY_TO_RUN',
  postLaunchSupport ? `${postLaunchSupportPath} · decision=${postLaunchSupport.decision}` : `${postLaunchSupportPath} missing`,
  'Run POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support; confirm support owner, abuse owner, safe macros, contact form and first-24h review.'
)

gate(
  'payment-storage-artifact',
  'Payment, storage, database and rate-limit readiness',
  Boolean(paymentStorage && paymentStorage.summary?.blockers === 0),
  'READY_TO_RUN',
  paymentStorage ? `${paymentStoragePath} · blockers=${paymentStorage.summary?.blockers ?? 'unknown'}` : `${paymentStoragePath} missing`,
  'Run npm run launch:payment-storage-check; set STRICT_LAUNCH_QA=true after env keys are ready.'
)

gate(
  'lighthouse-artifact',
  'Core Web Vitals evidence',
  enabled('LIGHTHOUSE_PRODUCTION_PASSED') || hasAnyReport(lighthouseDir, ['.html', '.json']),
  'READY_TO_RUN',
  enabled('LIGHTHOUSE_PRODUCTION_PASSED') ? 'LIGHTHOUSE_PRODUCTION_PASSED=true' : `${lighthouseDir} report files ${hasAnyReport(lighthouseDir, ['.html', '.json']) ? 'found' : 'missing'}`,
  'Run LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch and save mobile + desktop reports.'
)

gate(
  'playwright-artifact',
  'Browser smoke evidence',
  enabled('PLAYWRIGHT_PRODUCTION_PASSED') || existsSync(path.join(playwrightDir, 'index.html')) || hasAnyReport('./test-results', ['.png', '.webm', '.json']),
  'READY_TO_RUN',
  enabled('PLAYWRIGHT_PRODUCTION_PASSED') ? 'PLAYWRIGHT_PRODUCTION_PASSED=true' : `${playwrightDir}/index.html ${existsSync(path.join(playwrightDir, 'index.html')) ? 'found' : 'missing'}`,
  'Run PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e and keep the report.'
)

for (const [id, label, envKey] of [
  ['payment-approved', 'Payment lifecycle manually approved', 'LAUNCH_PAYMENT_APPROVED'],
  ['email-approved', 'Email delivery manually approved', 'LAUNCH_EMAIL_APPROVED'],
  ['storage-approved', 'Supabase storage manually approved', 'LAUNCH_STORAGE_APPROVED'],
  ['official-data-approved', 'Official data manually approved', 'LAUNCH_OFFICIAL_DATA_APPROVED'],
  ['ai-safety-approved', 'AI safety manually approved', 'LAUNCH_AI_SAFETY_APPROVED'],
  ['support-approved', 'Support operations manually approved', 'LAUNCH_SUPPORT_APPROVED'],
  ['deployment-approved', 'Deployment QA manually approved', 'LAUNCH_DEPLOYMENT_QA_APPROVED']
]) {
  gate(id, label, enabled(envKey), 'MANUAL_REQUIRED', `${envKey}=${env(envKey, 'false')}`, `Save real evidence, then set ${envKey}=true for final launch.`)
}

gate('rollback-owner', 'Rollback owner assigned', configured('LAUNCH_ROLLBACK_OWNER'), 'MANUAL_REQUIRED', `LAUNCH_ROLLBACK_OWNER=${env('LAUNCH_ROLLBACK_OWNER') || 'missing'}`, 'Add a real rollback owner/contact before launch.')
gate('incident-owner', 'Incident owner assigned', configured('LAUNCH_INCIDENT_OWNER'), 'MANUAL_REQUIRED', `LAUNCH_INCIDENT_OWNER=${env('LAUNCH_INCIDENT_OWNER') || 'missing'}`, 'Add a real incident owner/contact for the first 24 hours after launch.')
gate('founder-signoff', 'Founder final signoff', enabled('LAUNCH_FOUNDER_SIGNOFF') && enabled('LAUNCH_GO_NO_GO_COMPLETED'), 'MANUAL_REQUIRED', `LAUNCH_FOUNDER_SIGNOFF=${env('LAUNCH_FOUNDER_SIGNOFF', 'false')}; LAUNCH_GO_NO_GO_COMPLETED=${env('LAUNCH_GO_NO_GO_COMPLETED', 'false')}`, 'Do final go/no-go review only after the artifacts above are saved.')

const blocked = gates.filter((item) => item.status === 'BLOCKED').length
const manualRequired = gates.filter((item) => item.status === 'MANUAL_REQUIRED').length
const readyToRun = gates.filter((item) => item.status === 'READY_TO_RUN').length
const pass = gates.filter((item) => item.status === 'PASS').length
const decision = blocked > 0 ? 'NO_GO_BLOCKED' : manualRequired > 0 || readyToRun > 0 ? 'NO_GO_EVIDENCE_REQUIRED' : 'GO'

const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  strict: enabled('LAUNCH_STRICT_EVIDENCE_GATE'),
  decision,
  summary: { total: gates.length, pass, readyToRun, manualRequired, blocked },
  gates,
  runbook: [
    'npm install && npm run scan:complete && npm run quality:release && npm run build',
    'LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa',
    'STRICT_LAUNCH_QA=true npm run launch:payment-storage-check',
    'LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch',
    'PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e',
    'OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot',
    'npm run launch:rollback-drill',
    'POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support',
    'Fill manual approval envs only after real screenshots/logs are saved, then run npm run launch:evidence-gate.',
    'Run npm run launch:artifact-manifest to hash final artifacts and scan for leaked secrets before sharing proof.'
  ]
}

writeFileSync(path.join(outDir, 'final-evidence-gate.json'), JSON.stringify(report, null, 2))
writeFileSync(path.join(outDir, 'final-evidence-gate.csv'), ['id,area,status,evidence,next_step', ...gates.map((item) => [item.id, item.area, item.status, item.evidence, item.nextStep].map((value) => String(value).replaceAll('"', "'")).map((value) => `"${value}"`).join(','))].join('\n'))

for (const item of gates) console.log(`${item.status === 'PASS' ? '✅' : item.status === 'BLOCKED' ? '❌' : '⚠️'} ${item.area}: ${item.status}`)
console.log(`\nFinal evidence gate: ${decision}`)
console.log(`Report saved to ${path.join(outDir, 'final-evidence-gate.json')}`)

if (enabled('LAUNCH_STRICT_EVIDENCE_GATE') && decision !== 'GO') process.exit(1)
