export type DependencyReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type DependencyReadinessPriority = 'P0' | 'P1' | 'P2'

export type DependencyReadinessControl = {
  id: string
  label: string
  status: DependencyReadinessStatus
  priority: DependencyReadinessPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type DependencyRiskLane = {
  id: string
  label: string
  priority: DependencyReadinessPriority
  scope: string[]
  checks: string[]
  launchRisk: string
}

export type DependencyRunbookStep = {
  step: string
  owner: string
  evidence: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function validPolicyMode(name: string, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'block_high', 'enforced'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: DependencyReadinessStatus,
  priority: DependencyReadinessPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): DependencyReadinessControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const riskLanes: DependencyRiskLane[] = [
  {
    id: 'runtime-framework',
    label: 'Runtime framework and rendering stack',
    priority: 'P0',
    scope: ['next', 'react', 'react-dom', 'typescript', 'tailwindcss'],
    checks: ['Pinned major versions reviewed', 'Next security advisory review', 'build/typecheck smoke evidence', 'responsive UI regression check'],
    launchRisk: 'A framework or rendering regression can break all public pages, PWA behavior, SEO metadata and admin routes.'
  },
  {
    id: 'database-auth',
    label: 'Database, ORM and auth-related dependencies',
    priority: 'P0',
    scope: ['prisma', '@prisma/client', 'auth/session helpers', 'zod validation'],
    checks: ['Prisma engine install proof', 'schema validate/generate proof', 'auth/session smoke proof', 'validation dependency review'],
    launchRisk: 'A Prisma/auth dependency mismatch can break login, admin, payments, document vault and migrations.'
  },
  {
    id: 'document-generation',
    label: 'Document and file handling dependencies',
    priority: 'P1',
    scope: ['pdfkit', 'document vault safety helpers', 'OCR fallback helpers', 'storage upload utilities'],
    checks: ['Unsafe file type review', 'PDF generation smoke proof', 'sensitive data redaction review', 'storage upload/download proof'],
    launchRisk: 'Unsafe or broken file libraries can expose private data, fail complaint PDF generation or allow risky uploads.'
  },
  {
    id: 'testing-toolchain',
    label: 'Testing and QA toolchain',
    priority: 'P1',
    scope: ['@playwright/test', 'lighthouse scripts', 'custom phase audits', 'responsive scan'],
    checks: ['Playwright browser install proof', 'quality:release proof', 'phase audit coverage', 'deployment QA proof'],
    launchRisk: 'Broken test tooling gives false confidence and can miss mobile/desktop launch regressions.'
  },
  {
    id: 'license-compliance',
    label: 'Open-source license and attribution review',
    priority: 'P1',
    scope: ['production dependencies', 'dev dependencies', 'fonts/icons/media assets', 'generated code snippets'],
    checks: ['License allowlist reviewed', 'restricted license review', 'attribution notes saved', 'dependency export evidence'],
    launchRisk: 'Unreviewed licenses can create legal/commercial risk before ads, subscription billing or app-store submission.'
  },
  {
    id: 'supply-chain',
    label: 'Supply-chain and install integrity',
    priority: 'P0',
    scope: ['package-lock.json', 'npm audit', 'package overrides', 'CI install logs'],
    checks: ['Lockfile committed', 'npm audit reviewed', 'high/critical policy defined', 'CI clean install proof'],
    launchRisk: 'A compromised or vulnerable package can affect users, payments, auth sessions, admin tools and private documents.'
  }
]

const controls: DependencyReadinessControl[] = [
  control(
    'owner-assigned',
    'Dependency/security owner assigned',
    configured('DEPENDENCY_SECURITY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `DEPENDENCY_SECURITY_OWNER=${env('DEPENDENCY_SECURITY_OWNER') || 'empty'}`,
    'A named owner is responsible for dependency updates, audit triage, license review and release approval.',
    'Owner name in env/evidence notes and /admin/dependency-readiness screenshot.',
    'Security or license issues may be ignored because nobody owns the review.'
  ),
  control(
    'policy-mode-safe',
    'Dependency policy mode is safe',
    validPolicyMode('DEPENDENCY_POLICY_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `DEPENDENCY_POLICY_MODE=${env('DEPENDENCY_POLICY_MODE', 'manual_review')}`,
    'Policy mode is dry_run/manual_review/block_high/enforced and not an unknown value.',
    'Readiness report showing the selected mode and rollout note.',
    'An unsafe policy can either block urgent fixes or allow risky packages silently.'
  ),
  control(
    'lockfile-reviewed',
    'Package lockfile reviewed',
    enabled('DEPENDENCY_LOCKFILE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DEPENDENCY_LOCKFILE_REVIEWED=${env('DEPENDENCY_LOCKFILE_REVIEWED', 'false')}`,
    'package-lock.json is committed, clean install is tested and lockfile drift is reviewed before deployment.',
    'Git diff/CI clean install screenshot and package-lock timestamp.',
    'Vercel or another developer may install different transitive packages than the tested build.'
  ),
  control(
    'npm-audit-reviewed',
    'npm audit/security advisories reviewed',
    enabled('DEPENDENCY_AUDIT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DEPENDENCY_AUDIT_REVIEWED=${env('DEPENDENCY_AUDIT_REVIEWED', 'false')}`,
    'npm audit or trusted advisory output is reviewed and high/critical items have an owner, fix or accepted-risk note.',
    'Audit output, vulnerability count, remediation note and accepted-risk approval if needed.',
    'Known vulnerable packages can reach production with auth, payment or document data exposure risk.'
  ),
  control(
    'high-critical-gate',
    'High/critical vulnerability gate defined',
    enabled('DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED=${env('DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED', 'false')}`,
    'Launch blocks or gets founder approval when high/critical vulnerabilities affect runtime packages.',
    'Policy note and release command screenshot showing gate behavior.',
    'High-risk security advisories may be shipped accidentally during urgent launches.'
  ),
  control(
    'license-reviewed',
    'Open-source license review completed',
    enabled('DEPENDENCY_LICENSE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DEPENDENCY_LICENSE_REVIEWED=${env('DEPENDENCY_LICENSE_REVIEWED', 'false')}`,
    'Production and dev dependencies plus icons/fonts/assets are checked against the license allowlist.',
    'License inventory CSV, restricted-license notes and attribution file if required.',
    'Commercial launch, ads, subscriptions or app-store review may be blocked by unreviewed license obligations.'
  ),
  control(
    'update-cadence-reviewed',
    'Dependency update cadence reviewed',
    enabled('DEPENDENCY_UPDATE_CADENCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DEPENDENCY_UPDATE_CADENCE_REVIEWED=${env('DEPENDENCY_UPDATE_CADENCE_REVIEWED', 'false')}`,
    'A weekly/monthly update window exists with rollback, QA and owner responsibilities.',
    'Calendar/runbook note and release owner approval.',
    'Dependencies become stale, creating hidden security, performance and build compatibility risk.'
  ),
  control(
    'major-overrides-reviewed',
    'Major pins and overrides reviewed',
    enabled('DEPENDENCY_OVERRIDES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DEPENDENCY_OVERRIDES_REVIEWED=${env('DEPENDENCY_OVERRIDES_REVIEWED', 'false')}`,
    'Major-version pins/overrides such as Prisma are intentionally documented and tested.',
    'package.json overrides screenshot and prisma/typecheck/build evidence.',
    'A hidden override can keep a vulnerable or incompatible dependency in production.'
  ),
  control(
    'ci-clean-install',
    'CI/Vercel clean install proof saved',
    enabled('DEPENDENCY_CI_INSTALL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DEPENDENCY_CI_INSTALL_REVIEWED=${env('DEPENDENCY_CI_INSTALL_REVIEWED', 'false')}`,
    'A clean install in CI/Vercel succeeds with the same Node/npm versions planned for production.',
    'Vercel build log, npm version, node version and successful postinstall/prisma generate proof.',
    'Local builds can pass while Vercel deployment fails due to install or engine mismatch.'
  )
]

const runbook: DependencyRunbookStep[] = [
  { step: 'Run npm run dependency:readiness and save JSON/CSV evidence.', owner: 'Developer/Security', evidence: 'artifacts/dependency-readiness files' },
  { step: 'Run npm install from a clean folder and verify package-lock does not drift unexpectedly.', owner: 'Developer', evidence: 'clean install terminal output and git diff screenshot' },
  { step: 'Run npm audit and triage every high/critical advisory before launch.', owner: 'Security/Founder', evidence: 'audit report, remediation or accepted-risk note' },
  { step: 'Review package.json overrides, latest tags and major pins before dependency bumps.', owner: 'Developer', evidence: 'package diff and typecheck/build proof' },
  { step: 'Export license inventory and review non-allowlisted licenses/assets.', owner: 'Founder/Legal', evidence: 'license CSV and attribution notes' },
  { step: 'Deploy to Vercel and save clean install/build logs after dependency changes.', owner: 'Developer/Ops', evidence: 'Vercel log screenshot and deployment URL' }
]

export function getDependencyReadinessReport() {
  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length
  const p0Controls = controls.filter((control) => control.priority === 'P0')

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.47-dependency-security-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      p0Controls: p0Controls.length,
      riskLanes: riskLanes.length,
      p0RiskLanes: riskLanes.filter((lane) => lane.priority === 'P0').length
    },
    controls,
    riskLanes,
    runbook,
    nextAction: blocked
      ? 'Fix blocked dependency policy configuration before deployment review.'
      : manualRequired
        ? 'Complete lockfile, npm audit, high/critical, license, override and CI clean-install evidence before public launch.'
        : 'Dependency security readiness gates are complete for launch review.'
  }
}
