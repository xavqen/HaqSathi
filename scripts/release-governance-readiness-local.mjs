import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const modeIsSafe = (name, fallback = 'manual_review') => ['manual_review', 'release_candidate', 'staged', 'production_guarded', 'frozen'].includes(env(name, fallback))

const outputDir = env('RELEASE_GOVERNANCE_EVIDENCE_DIR', './artifacts/release-governance')
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

const controls = [
  ['release-owner-assigned', 'P0', 'Release owner assigned', configured('RELEASE_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `RELEASE_OWNER=${env('RELEASE_OWNER') || 'empty'}`],
  ['release-mode-safe', 'P0', 'Release mode is safe', modeIsSafe('RELEASE_GOVERNANCE_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `RELEASE_GOVERNANCE_MODE=${env('RELEASE_GOVERNANCE_MODE', 'manual_review')}`],
  ['release-notes-reviewed', 'P0', 'Release notes reviewed', enabled('RELEASE_NOTES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RELEASE_NOTES_REVIEWED=${env('RELEASE_NOTES_REVIEWED', 'false')}`],
  ['rollback-target-reviewed', 'P0', 'Rollback target reviewed', enabled('RELEASE_ROLLBACK_TARGET_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RELEASE_ROLLBACK_TARGET_REVIEWED=${env('RELEASE_ROLLBACK_TARGET_REVIEWED', 'false')}`],
  ['deployment-tag-reviewed', 'P1', 'Deployment tag reviewed', configured('RELEASE_DEPLOYMENT_TAG') || configured('VERCEL_GIT_COMMIT_SHA') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `RELEASE_DEPLOYMENT_TAG=${env('RELEASE_DEPLOYMENT_TAG') || 'empty'}`],
  ['quality-command-reviewed', 'P0', 'Quality command reviewed', enabled('RELEASE_QUALITY_COMMAND_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RELEASE_QUALITY_COMMAND_REVIEWED=${env('RELEASE_QUALITY_COMMAND_REVIEWED', 'false')}`],
  ['post-release-watch-reviewed', 'P1', 'Post-release watch reviewed', enabled('RELEASE_POST_RELEASE_WATCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RELEASE_POST_RELEASE_WATCH_REVIEWED=${env('RELEASE_POST_RELEASE_WATCH_REVIEWED', 'false')}`]
]

const lanes = [
  ['version-source-of-truth', 'P0', 'Version source of truth', 'package.json + PHASE note + evidence summary', 'Rollback target must point to previous known-good version'],
  ['changelog-release-notes', 'P0', 'Changelog and release notes', 'PHASE_*.md + artifacts/release-governance', 'Rollback notes identify feature lane to disable first'],
  ['deployment-tagging', 'P1', 'Deployment tagging', 'Vercel URL, git SHA or zip filename', 'Keep previous deployment alias or zip ready'],
  ['rollback-evidence', 'P0', 'Rollback evidence', 'P0 fallback screenshots and rollback checklist', 'Freeze writes, disable risky flags, restore previous deploy'],
  ['release-signoff', 'P0', 'Founder and owner signoff', 'Go/no-go, QA owner and incident owner', 'Pause growth and move to frozen/manual_review mode'],
  ['post-release-watch', 'P1', 'Post-release watch window', '24h monitoring checklist', 'Rollback if P0 metrics fail during watch window']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.52-release-governance-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, lanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  releaseLanes: lanes.map(([id, priority, label, artifact, rollback]) => ({ id, priority, label, artifact, rollback })),
  outputDir,
  nextAction: blocked ? 'Fix blocked release governance mode before deployment.' : manualRequired ? 'Complete P0 release and rollback evidence before public traffic.' : 'Release governance is ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'release-governance-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'release-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'release-lanes.csv'), csv([['id', 'priority', 'label', 'artifact', 'rollback_rule'], ...lanes]))
writeFileSync(join(outputDir, 'release-notes-template.md'), `# Release notes template\n\n## Version\n3.0.52-release-governance-readiness\n\n## Added\n- Release governance and rollback readiness.\n\n## Changed\n- quality:release includes Phase 82 audit.\n\n## Evidence\n- npm run release-governance:readiness\n- npm run quality:release\n\n## Rollback target\n- Previous known-good zip/deploy URL.\n`)
writeFileSync(join(outputDir, 'rollback-checklist.md'), `# Rollback checklist\n\n1. Confirm user impact and failing lane.\n2. Disable risky feature flag or freeze writes.\n3. Restore previous Vercel deployment or previous zip if core flows fail.\n4. Save masked logs/screenshots and alert IDs.\n5. Notify support/admin owner.\n6. Re-run quality gates before re-release.\n`)
writeFileSync(join(outputDir, 'post-release-watch.md'), `# Post-release watch\n\n- Heartbeat/API health checked.\n- Error dashboard checked.\n- Support tickets checked.\n- Payment/vault/AI critical flows checked.\n- Mobile navigation checked.\n- Founder/Ops signoff captured.\n`)

console.log(`✅ Release governance evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
