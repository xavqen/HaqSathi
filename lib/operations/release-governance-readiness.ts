export type ReleaseGovernanceStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type ReleaseGovernancePriority = 'P0' | 'P1' | 'P2'

export type ReleaseGovernanceControl = {
  id: string
  label: string
  status: ReleaseGovernanceStatus
  priority: ReleaseGovernancePriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type ReleaseGovernanceLane = {
  id: string
  label: string
  priority: ReleaseGovernancePriority
  owner: string
  artifact: string
  reviewRule: string
  rollbackRule: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

function modeIsSafe(name: string, fallback = 'manual_review') {
  return ['manual_review', 'release_candidate', 'staged', 'production_guarded', 'frozen'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: ReleaseGovernanceStatus,
  priority: ReleaseGovernancePriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): ReleaseGovernanceControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const releaseLanes: ReleaseGovernanceLane[] = [
  {
    id: 'version-source-of-truth',
    label: 'Version source of truth',
    priority: 'P0',
    owner: 'Founder/Developer',
    artifact: 'package.json + PHASE release note + launch evidence summary',
    reviewRule: 'Every zip/release must have one version string, one release note and one evidence pack path.',
    rollbackRule: 'Rollback target must point to the previous known-good zip/version and its evidence summary.'
  },
  {
    id: 'changelog-release-notes',
    label: 'Changelog and release notes',
    priority: 'P0',
    owner: 'Product/QA',
    artifact: 'PHASE_*.md, /admin/release-governance and artifacts/release-governance',
    reviewRule: 'High-risk changes, new admin routes, env vars and scripts must be recorded before deployment.',
    rollbackRule: 'Rollback notes must identify the feature lane to disable first and the last stable version.'
  },
  {
    id: 'deployment-tagging',
    label: 'Deployment tagging',
    priority: 'P1',
    owner: 'Ops/Admin',
    artifact: 'Vercel deployment URL, git SHA or zip filename, date/time and owner',
    reviewRule: 'Production deploy should be traceable to the exact package that passed quality:release.',
    rollbackRule: 'Keep previous deployment alias or zip ready until new release passes smoke tests.'
  },
  {
    id: 'rollback-evidence',
    label: 'Rollback evidence',
    priority: 'P0',
    owner: 'Ops/Security',
    artifact: 'Rollback drill checklist and disabled-state screenshots for P0 feature lanes',
    reviewRule: 'AI, payments, vault uploads, admin writes and notifications must have fallback evidence.',
    rollbackRule: 'Freeze writes, disable risky feature flags, restore previous deployment, then preserve incident evidence.'
  },
  {
    id: 'release-signoff',
    label: 'Founder and owner signoff',
    priority: 'P0',
    owner: 'Founder',
    artifact: 'Go/no-go decision, QA owner signoff, incident owner and support owner',
    reviewRule: 'Public launch cannot be marked final until P0 manual gates are signed or explicitly deferred.',
    rollbackRule: 'If signoff is revoked, pause growth channels and move to frozen/manual_review mode.'
  },
  {
    id: 'post-release-watch',
    label: 'Post-release watch window',
    priority: 'P1',
    owner: 'Ops/Support',
    artifact: 'First 24h monitoring checklist with heartbeat, errors, support tickets and payments',
    reviewRule: 'New release needs a watch window owner and alert channel before traffic/ads are increased.',
    rollbackRule: 'If P0 metrics fail during watch window, rollback before adding new features.'
  }
]

const controls: ReleaseGovernanceControl[] = [
  control(
    'release-owner-assigned',
    'Release owner assigned',
    configured('RELEASE_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `RELEASE_OWNER=${env('RELEASE_OWNER') || 'empty'}`,
    'A named person owns release approval, rollback and final public launch communication.',
    'Owner name in env/evidence pack and /admin/release-governance screenshot.',
    'Nobody is accountable for go/no-go, rollback and communication during a launch issue.'
  ),
  control(
    'release-mode-safe',
    'Release mode is safe',
    modeIsSafe('RELEASE_GOVERNANCE_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `RELEASE_GOVERNANCE_MODE=${env('RELEASE_GOVERNANCE_MODE', 'manual_review')}`,
    'Mode is manual_review, release_candidate, staged, production_guarded or frozen.',
    'Readiness report showing mode and owner signoff.',
    'Unknown mode can accidentally treat a test build as production-ready.'
  ),
  control(
    'release-notes-reviewed',
    'Release notes reviewed',
    enabled('RELEASE_NOTES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `RELEASE_NOTES_REVIEWED=${env('RELEASE_NOTES_REVIEWED', 'false')}`,
    'The version, added features, changed env vars, scripts, admin routes and known limits are recorded.',
    'PHASE_52 release note and generated release notes artifact.',
    'Operators cannot know what changed, what to test or what to roll back.'
  ),
  control(
    'rollback-target-reviewed',
    'Rollback target reviewed',
    enabled('RELEASE_ROLLBACK_TARGET_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `RELEASE_ROLLBACK_TARGET_REVIEWED=${env('RELEASE_ROLLBACK_TARGET_REVIEWED', 'false')}`,
    'Previous known-good version, rollback owner and feature-flag fallback path are documented.',
    'Rollback target field, previous zip/deploy URL and rollback checklist screenshot.',
    'A broken deployment can stay live while the team searches for a stable version.'
  ),
  control(
    'deployment-tag-reviewed',
    'Deployment tag reviewed',
    configured('RELEASE_DEPLOYMENT_TAG') || configured('VERCEL_GIT_COMMIT_SHA') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P1',
    `RELEASE_DEPLOYMENT_TAG=${env('RELEASE_DEPLOYMENT_TAG') || 'empty'}`,
    'Release can be traced to an exact zip, git SHA or Vercel deployment.',
    'Deployment tag/SHA in release evidence and Vercel deployment screenshot.',
    'Bugs cannot be traced to the exact artifact users received.'
  ),
  control(
    'quality-command-reviewed',
    'Quality command reviewed',
    enabled('RELEASE_QUALITY_COMMAND_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `RELEASE_QUALITY_COMMAND_REVIEWED=${env('RELEASE_QUALITY_COMMAND_REVIEWED', 'false')}`,
    'npm run quality:release and the current phase audit are included in the release checklist.',
    'Terminal output or generated evidence showing quality:release passed.',
    'A release may be shipped without running the same quality gates as previous versions.'
  ),
  control(
    'post-release-watch-reviewed',
    'Post-release watch reviewed',
    enabled('RELEASE_POST_RELEASE_WATCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `RELEASE_POST_RELEASE_WATCH_REVIEWED=${env('RELEASE_POST_RELEASE_WATCH_REVIEWED', 'false')}`,
    'First 24h watch owner, alerts, support queue and payment/vault/AI checks are assigned.',
    'Watch checklist with owner, start time and monitored dashboards.',
    'Problems may go unnoticed after deploy while users face broken flows.'
  )
]

export function getReleaseGovernanceReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.52-release-governance-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      lanes: releaseLanes.length
    },
    controls,
    releaseLanes,
    nextAction: blocked
      ? 'Fix blocked release governance mode before deployment.'
      : manualRequired
        ? 'Complete P0 release notes, rollback target and quality evidence before public launch.'
        : 'Release governance is ready for guarded production rollout.',
    releaseChecklist: [
      'Confirm exact version, deployment tag and evidence folder before deploy.',
      'Run npm run quality:release and save terminal output.',
      'Verify P0 feature flags can disable AI, payments, vault uploads, notifications and admin writes.',
      'Record rollback target and owner before increasing traffic.',
      'Watch errors, heartbeat, payments, support tickets and key mobile flows after release.'
    ],
    rollbackPlaybook: [
      'Freeze growth channels and admin writes first if the issue is unclear.',
      'Disable the affected feature lane using the kill switch matrix.',
      'Restore the previous Vercel deployment or previous zip if core flows fail.',
      'Save masked screenshots, logs, alert IDs and user impact summary.',
      'Create incident/postmortem record and only re-release after quality gates pass again.'
    ]
  }
}
