import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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

function validPolicyMode(name, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'block_high', 'enforced'].includes(env(name, fallback))
}

const root = process.cwd()
const outputDir = join(root, env('DEPENDENCY_EVIDENCE_DIR', './artifacts/dependency-readiness'))
mkdirSync(outputDir, { recursive: true })

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const lockfileExists = existsSync(join(root, 'package-lock.json'))
const dependencyRows = Object.entries(pkg.dependencies || {}).map(([name, version]) => ['dependency', name, version])
const devDependencyRows = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ['devDependency', name, version])

const riskLanes = [
  ['runtime-framework', 'P0', 'Runtime framework and rendering stack', 'next|react|react-dom|typescript|tailwindcss', 'security-advisory|build-typecheck|responsive-regression'],
  ['database-auth', 'P0', 'Database, ORM and auth-related dependencies', 'prisma|@prisma/client|zod|session helpers', 'prisma-generate|auth-smoke|validation-review'],
  ['document-generation', 'P1', 'Document and file handling dependencies', 'pdfkit|storage upload|OCR fallback|vault safety', 'signature-check|redaction-review|pdf-smoke'],
  ['testing-toolchain', 'P1', 'Testing and QA toolchain', '@playwright/test|lighthouse scripts|phase audits|ui scan', 'browser-install|quality-release|deployment-qa'],
  ['license-compliance', 'P1', 'Open-source license and attribution review', 'dependencies|devDependencies|fonts|icons|media assets', 'license-inventory|restricted-license-review|attribution'],
  ['supply-chain', 'P0', 'Supply-chain and install integrity', 'package-lock.json|npm audit|overrides|CI install logs', 'lockfile|audit-reviewed|high-critical-policy|clean-install']
]

const controls = [
  ['owner-assigned', 'P0', 'Dependency/security owner assigned', configured('DEPENDENCY_SECURITY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DEPENDENCY_SECURITY_OWNER=${env('DEPENDENCY_SECURITY_OWNER') || 'empty'}`],
  ['policy-mode-safe', 'P0', 'Dependency policy mode is safe', validPolicyMode('DEPENDENCY_POLICY_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `DEPENDENCY_POLICY_MODE=${env('DEPENDENCY_POLICY_MODE', 'manual_review')}`],
  ['lockfile-exists', 'P0', 'package-lock.json is present', lockfileExists ? 'READY_TO_TEST' : 'BLOCKED', `package-lock.json=${lockfileExists ? 'present' : 'missing'}`],
  ['lockfile-reviewed', 'P0', 'Package lockfile reviewed', enabled('DEPENDENCY_LOCKFILE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_LOCKFILE_REVIEWED=${env('DEPENDENCY_LOCKFILE_REVIEWED', 'false')}`],
  ['npm-audit-reviewed', 'P0', 'npm audit/security advisories reviewed', enabled('DEPENDENCY_AUDIT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_AUDIT_REVIEWED=${env('DEPENDENCY_AUDIT_REVIEWED', 'false')}`],
  ['high-critical-gate', 'P0', 'High/critical vulnerability gate defined', enabled('DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED=${env('DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED', 'false')}`],
  ['license-reviewed', 'P1', 'Open-source license review completed', enabled('DEPENDENCY_LICENSE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_LICENSE_REVIEWED=${env('DEPENDENCY_LICENSE_REVIEWED', 'false')}`],
  ['update-cadence-reviewed', 'P1', 'Dependency update cadence reviewed', enabled('DEPENDENCY_UPDATE_CADENCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_UPDATE_CADENCE_REVIEWED=${env('DEPENDENCY_UPDATE_CADENCE_REVIEWED', 'false')}`],
  ['major-overrides-reviewed', 'P1', 'Major pins and overrides reviewed', enabled('DEPENDENCY_OVERRIDES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_OVERRIDES_REVIEWED=${env('DEPENDENCY_OVERRIDES_REVIEWED', 'false')}`],
  ['ci-clean-install', 'P0', 'CI/Vercel clean install proof saved', enabled('DEPENDENCY_CI_INSTALL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEPENDENCY_CI_INSTALL_REVIEWED=${env('DEPENDENCY_CI_INSTALL_REVIEWED', 'false')}`]
]

const runbook = [
  ['Run npm run dependency:readiness and save JSON/CSV evidence.', 'Developer/Security', 'artifacts/dependency-readiness files'],
  ['Run npm install from a clean folder and verify package-lock does not drift unexpectedly.', 'Developer', 'clean install terminal output and git diff screenshot'],
  ['Run npm audit and triage every high/critical advisory before launch.', 'Security/Founder', 'audit report, remediation or accepted-risk note'],
  ['Review package.json overrides, latest tags and major pins before dependency bumps.', 'Developer', 'package diff and typecheck/build proof'],
  ['Export license inventory and review non-allowlisted licenses/assets.', 'Founder/Legal', 'license CSV and attribution notes'],
  ['Deploy to Vercel and save clean install/build logs after dependency changes.', 'Developer/Ops', 'Vercel log screenshot and deployment URL']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.47-dependency-security-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    riskLanes: riskLanes.length,
    productionDependencies: dependencyRows.length,
    devDependencies: devDependencyRows.length,
    lockfileExists
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  riskLanes: riskLanes.map(([id, priority, label, scope, checks]) => ({ id, priority, label, scope, checks })),
  dependencyInventory: [...dependencyRows, ...devDependencyRows].map(([type, name, version]) => ({ type, name, version })),
  overrides: pkg.overrides || {},
  runbook: runbook.map(([step, owner, evidence]) => ({ step, owner, evidence })),
  nextAction: blocked ? 'Fix blocked dependency security configuration before deploy review.' : manualRequired ? 'Complete lockfile, npm audit, high/critical, license, override and CI clean-install evidence before public launch.' : 'Dependency security readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'dependency-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'dependency-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'dependency-risk-lanes.csv'), csv([['id', 'priority', 'label', 'scope', 'checks'], ...riskLanes]))
writeFileSync(join(outputDir, 'dependency-inventory.csv'), csv([['type', 'name', 'version'], ...dependencyRows, ...devDependencyRows]))
writeFileSync(join(outputDir, 'dependency-runbook.csv'), csv([['step', 'owner', 'evidence_required'], ...runbook]))

console.log(`✅ Dependency security readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Dependencies: ${dependencyRows.length} prod / ${devDependencyRows.length} dev`)
