export type ProductionOpsItem = {
  id: string
  title: string
  owner: string
  command: string
  evidence: string
  launchRule: string
}

export const productionOpsChecklist: ProductionOpsItem[] = [
  {
    id: 'public-health',
    title: 'Public health endpoint',
    owner: 'Deployment owner',
    command: 'curl -s https://haqsathi.site/api/health',
    evidence: 'Returns ok=true, current version, environment and no-cache headers without touching the database.',
    launchRule: 'Must be green before Vercel traffic is moved to the final domain.'
  },
  {
    id: 'readiness-health',
    title: 'Readiness endpoint',
    owner: 'Backend owner',
    command: 'curl -s https://haqsathi.site/api/ready',
    evidence: 'Returns ok=true only when required env values and database connectivity are usable.',
    launchRule: 'A 503 means soft-launch only; do not announce publicly until fixed.'
  },
  {
    id: 'ops-snapshot',
    title: 'Production ops snapshot',
    owner: 'Launch owner',
    command: 'OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot',
    evidence: 'artifacts/live-launch-qa/production-ops-snapshot.json and CSV with endpoint latency, status codes, cache headers and blockers.',
    launchRule: 'Run after every production deploy and keep the artifact with the final launch proof bundle.'
  },
  {
    id: 'rollback-drill-artifact',
    title: 'Rollback drill artifact',
    owner: 'Launch owner',
    command: 'npm run launch:rollback-drill',
    evidence: 'rollback-drill.json records last-good deployment, backup confirmation, owners, rollback test and maintenance notice readiness.',
    launchRule: 'Must be saved before final evidence gate; unresolved manual-required items mean soft launch only.'
  },

  {
    id: 'postlaunch-support-artifact',
    title: 'Post-launch support gate',
    owner: 'Support owner',
    command: 'POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support',
    evidence: 'postlaunch-support-check.json proves support email, contact page, urgent abuse owner, safe macros and first-24h review are ready.',
    launchRule: 'Must be saved before public traffic or paid campaigns.'
  },
  {
    id: 'incident-rollback',
    title: 'Incident and rollback owner',
    owner: 'Founder',
    command: 'Set LAUNCH_INCIDENT_OWNER and LAUNCH_ROLLBACK_OWNER before final gate.',
    evidence: 'Named owner/contact is present in final-evidence-gate.json.',
    launchRule: 'No owner means no public launch.'
  }
]

export function getProductionOpsChecklist() {
  return productionOpsChecklist
}
