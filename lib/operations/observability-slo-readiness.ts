export type ObservabilityReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type ObservabilityReadinessPriority = 'P0' | 'P1' | 'P2'

export type ObservabilityReadinessControl = {
  id: string
  label: string
  status: ObservabilityReadinessStatus
  priority: ObservabilityReadinessPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type ObservabilitySloLane = {
  id: string
  label: string
  target: string
  priority: ObservabilityReadinessPriority
  signal: string
  alertRule: string
  evidenceRequired: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none/i.test(value))
}

function validMode(name: string, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'active', 'enforced'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: ObservabilityReadinessStatus,
  priority: ObservabilityReadinessPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): ObservabilityReadinessControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const sloLanes: ObservabilitySloLane[] = [
  {
    id: 'public-availability',
    label: 'Public availability SLO',
    target: `${env('SLO_AVAILABILITY_TARGET', '99.5')}% monthly uptime for public P0 routes`,
    priority: 'P0',
    signal: 'Home, complaint, UPI help, login and pricing route uptime probes.',
    alertRule: 'Trigger alert when two consecutive uptime probes fail from production domain.',
    evidenceRequired: 'Uptime dashboard screenshot and one successful probe history export.'
  },
  {
    id: 'api-latency',
    label: 'API latency SLO',
    target: `P95 below ${env('SLO_API_P95_MS', '1500')}ms for non-AI APIs`,
    priority: 'P1',
    signal: 'Heartbeat, auth, analytics, newsletter, vault metadata and readiness APIs.',
    alertRule: 'Trigger alert when P95 stays above target for 15 minutes.',
    evidenceRequired: 'Latency panel screenshot from deployed URL or provider dashboard.'
  },
  {
    id: 'error-rate',
    label: 'Error rate SLO',
    target: `Server/client error rate below ${env('SLO_ERROR_RATE_MAX', '1')}% on P0 flows`,
    priority: 'P0',
    signal: 'Client error capture, API non-2xx rate and Vercel runtime errors.',
    alertRule: 'Trigger alert on repeated payment/auth/storage/AI errors or sudden 5xx spike.',
    evidenceRequired: 'Error monitoring dashboard with redacted sample event and alert rule screenshot.'
  },
  {
    id: 'cron-health',
    label: 'Cron and background job health',
    target: 'Every protected cron route has last-run status and failure owner.',
    priority: 'P1',
    signal: 'Link checks, official data refresh, privacy ops, backup readiness and notification dry-run routes.',
    alertRule: 'Trigger alert when expected daily/weekly cron evidence is missing or returns blocked status.',
    evidenceRequired: 'Cron run history screenshot and artifacts folder output.'
  },
  {
    id: 'business-flow-heartbeats',
    label: 'Business flow heartbeats',
    target: 'Auth, email, payment, vault and complaint generator smoke checks are observable.',
    priority: 'P0',
    signal: 'Synthetic checks or manual smoke evidence on deployed Vercel URL.',
    alertRule: 'Escalate to incident response when a P0 flow fails twice in a row.',
    evidenceRequired: 'Smoke run output linked to /admin/deployment-qa and /admin/launch-command-center.'
  }
]

const controls: ObservabilityReadinessControl[] = [
  control(
    'observability-owner-assigned',
    'Observability owner assigned',
    configured('OBSERVABILITY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `OBSERVABILITY_OWNER=${env('OBSERVABILITY_OWNER') || 'empty'}`,
    'A named owner reviews uptime, errors, latency and alert evidence during launch week.',
    'Owner name and /admin/observability-slo screenshot.',
    'Alerts may be ignored or routed to nobody during launch traffic.'
  ),
  control(
    'observability-mode-safe',
    'Observability mode is safe',
    validMode('OBSERVABILITY_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `OBSERVABILITY_MODE=${env('OBSERVABILITY_MODE', 'manual_review')}`,
    'Mode is dry_run/manual_review/active/enforced and matches the launch stage.',
    'Readiness report showing selected mode and approval note.',
    'Unknown mode can hide alerts or create noisy false positives during a launch incident.'
  ),
  control(
    'provider-configured',
    'Monitoring provider or manual dashboard path selected',
    configured('OBSERVABILITY_PROVIDER') || configured('NEXT_PUBLIC_GA_ID') || configured('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P1',
    `OBSERVABILITY_PROVIDER=${env('OBSERVABILITY_PROVIDER', 'none')}`,
    'A provider/dashboard path is selected for uptime, errors, latency and SLO review.',
    'Provider dashboard screenshot or manual evidence folder path.',
    'The team may have logs but no single place to see launch health.'
  ),
  control(
    'uptime-target-configured',
    'Production uptime target configured',
    configured('OBSERVABILITY_UPTIME_URL') || configured('VERCEL_PRODUCTION_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `OBSERVABILITY_UPTIME_URL=${configured('OBSERVABILITY_UPTIME_URL') ? 'configured' : 'empty'}; VERCEL_PRODUCTION_URL=${configured('VERCEL_PRODUCTION_URL') ? 'configured' : 'empty'}`,
    'Public production URL is monitored from outside localhost.',
    'Uptime probe screenshot with production domain, not local URL.',
    'The app can be down publicly while local tests still pass.'
  ),
  control(
    'heartbeat-reviewed',
    'Heartbeat endpoint reviewed',
    enabled('OBSERVABILITY_HEARTBEAT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `OBSERVABILITY_HEARTBEAT_REVIEWED=${env('OBSERVABILITY_HEARTBEAT_REVIEWED', 'false')}`,
    'Heartbeat/API health route is tested on production and returns safe, non-sensitive output.',
    'Heartbeat JSON screenshot from deployed URL.',
    'Health checks can leak secrets or fail silently if never reviewed.'
  ),
  control(
    'slo-reviewed',
    'SLO targets reviewed',
    enabled('OBSERVABILITY_SLO_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `OBSERVABILITY_SLO_REVIEWED=${env('OBSERVABILITY_SLO_REVIEWED', 'false')}`,
    'Availability, latency, error-rate, cron and P0 business flow targets are approved.',
    'SLO checklist screenshot or saved JSON/CSV evidence.',
    'Launch can look green while users still face slow or broken core flows.'
  ),
  control(
    'dashboard-reviewed',
    'Monitoring dashboard reviewed',
    enabled('OBSERVABILITY_DASHBOARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `OBSERVABILITY_DASHBOARD_REVIEWED=${env('OBSERVABILITY_DASHBOARD_REVIEWED', 'false')}`,
    'Dashboard shows uptime, errors, latency, cron health and P0 route probes.',
    'Dashboard screenshot with date/time and production domain.',
    'Operators may miss whether a failure is global, route-specific, API-specific or browser-specific.'
  ),
  control(
    'alert-drill-reviewed',
    'Alert drill reviewed',
    configured('OBSERVABILITY_ALERT_WEBHOOK_URL') || configured('OBSERVABILITY_ALERT_EMAIL') || enabled('OBSERVABILITY_ALERT_DRILL_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `OBSERVABILITY_ALERT_WEBHOOK_URL=${configured('OBSERVABILITY_ALERT_WEBHOOK_URL') ? 'configured' : 'empty'}; OBSERVABILITY_ALERT_EMAIL=${configured('OBSERVABILITY_ALERT_EMAIL') ? 'configured' : 'empty'}; OBSERVABILITY_ALERT_DRILL_REVIEWED=${env('OBSERVABILITY_ALERT_DRILL_REVIEWED', 'false')}`,
    'At least one alert channel reaches the owner and one alert drill proof is saved.',
    'Test alert screenshot/email and owner acknowledgment.',
    'Failures may be detected too late, especially payment/auth/vault outages.'
  ),
  control(
    'error-budget-reviewed',
    'Error budget reviewed',
    enabled('OBSERVABILITY_ERROR_BUDGET_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P2',
    `OBSERVABILITY_ERROR_BUDGET_REVIEWED=${env('OBSERVABILITY_ERROR_BUDGET_REVIEWED', 'false')}`,
    'Team knows when to stop feature shipping and focus on stability.',
    'Error budget note linked from launch command center.',
    'Small repeated failures can pile up without a stop-shipping rule.'
  )
]

const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control.status === 'BLOCKED').length

export function getObservabilitySloReadinessReport() {
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.49-observability-slo-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      sloLanes: sloLanes.length,
      p0Controls: controls.filter((control) => control.priority === 'P0').length,
      p1Controls: controls.filter((control) => control.priority === 'P1').length
    },
    controls,
    sloLanes,
    dashboards: [
      'Vercel runtime errors and build/deploy health',
      'Client error monitoring from /api/system/client-error',
      'Uptime probe for public home, complaint, UPI help and login routes',
      'Heartbeat from /api/system/heartbeat or deployment QA endpoint',
      'Cron evidence from link checks, official data refresh, privacy ops and backups'
    ],
    launchAlerts: [
      'production domain unavailable or redirects incorrectly',
      'payment verify/webhook error spike',
      'email verification/forgot password failure spike',
      'document vault upload/download failure spike',
      'mobile complaint or UPI helper route error spike',
      'cron link-check/official-data refresh missing expected evidence'
    ],
    nextAction: blocked
      ? 'Fix blocked observability configuration before production deploy.'
      : manualRequired
        ? 'Complete owner, uptime, heartbeat, dashboard, alert and SLO evidence before public traffic.'
        : 'Observability and SLO readiness gates are complete for launch review.'
  }
}
