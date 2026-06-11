export type DeploymentQaStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type DeploymentQaControl = {
  id: string
  label: string
  status: DeploymentQaStatus
  adminValue: string
  userValue: string
  launchNote: string
}

export type DeploymentQaScenario = {
  id: string
  label: string
  viewport: 'mobile' | 'tablet' | 'desktop' | 'api' | 'seo'
  path: string
  passCondition: string
  evidenceRequired: string[]
}

export type DeploymentQaReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    scenarios: number
    criticalScenarios: number
  }
  controls: DeploymentQaControl[]
  scenarios: DeploymentQaScenario[]
  runbook: string[]
  evidenceChecklist: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function enabled(name: string) {
  return env(name).toLowerCase() === 'true'
}

function httpsUrl(name: string) {
  const value = env(name)
  return /^https:\/\//i.test(value) && !/localhost|127\.0\.0\.1|example|your-domain/i.test(value)
}

function numberEnv(name: string, fallback: number) {
  const raw = Number(env(name, String(fallback)))
  return Number.isFinite(raw) ? raw : fallback
}

function statusFromBoolean(ok: boolean, missingStatus: DeploymentQaStatus = 'MANUAL_REQUIRED'): DeploymentQaStatus {
  return ok ? 'READY_TO_TEST' : missingStatus
}

const productionUrl = env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL') || env('E2E_BASE_URL')
const lighthouseMinPerformance = numberEnv('LIGHTHOUSE_MIN_PERFORMANCE', 75)

const controls: DeploymentQaControl[] = [
  {
    id: 'production-url',
    label: 'Production HTTPS URL configured',
    status: statusFromBoolean(/^https:\/\//i.test(productionUrl) && !/localhost|127\.0\.0\.1|your-domain|example/i.test(productionUrl), 'BLOCKED'),
    adminValue: `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}; NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`,
    userValue: 'Final QA must run against the real deployed Vercel domain, not localhost.',
    launchNote: 'Set VERCEL_PRODUCTION_URL=https://your-live-domain before running production QA.'
  },
  {
    id: 'preview-url',
    label: 'Preview deployment review path',
    status: statusFromBoolean(httpsUrl('VERCEL_PREVIEW_URL') || httpsUrl('VERCEL_PRODUCTION_URL')),
    adminValue: `VERCEL_PREVIEW_URL=${env('VERCEL_PREVIEW_URL') || 'empty'}`,
    userValue: 'Preview URL should be available for risky UI/API changes before production promotion.',
    launchNote: 'Use preview for sanity checks, then run final evidence on production.'
  },
  {
    id: 'build-log',
    label: 'Vercel build log reviewed',
    status: statusFromBoolean(enabled('VERCEL_BUILD_LOG_REVIEWED')),
    adminValue: `VERCEL_BUILD_LOG_REVIEWED=${env('VERCEL_BUILD_LOG_REVIEWED', 'false')}`,
    userValue: 'Build must finish without dependency, Prisma, route, or environment warnings.',
    launchNote: 'Save Vercel build log screenshot or CI output in launch evidence.'
  },
  {
    id: 'error-logs',
    label: 'Vercel runtime logs reviewed',
    status: statusFromBoolean(enabled('VERCEL_ERROR_LOGS_REVIEWED')),
    adminValue: `VERCEL_ERROR_LOGS_REVIEWED=${env('VERCEL_ERROR_LOGS_REVIEWED', 'false')}`,
    userValue: 'Runtime logs must be checked after opening core pages and APIs on deployed domain.',
    launchNote: 'No repeated 500, auth, storage, payment, email or cron errors before public launch.'
  },
  {
    id: 'playwright-production',
    label: 'Playwright production smoke passed',
    status: statusFromBoolean(enabled('PLAYWRIGHT_PRODUCTION_PASSED')),
    adminValue: `E2E_BASE_URL=${env('E2E_BASE_URL', 'http://localhost:3000')}; PLAYWRIGHT_PRODUCTION_PASSED=${env('PLAYWRIGHT_PRODUCTION_PASSED', 'false')}`,
    userValue: 'Mobile and desktop E2E smoke should pass on the live deployment URL.',
    launchNote: 'Run: E2E_BASE_URL=$VERCEL_PRODUCTION_URL npm run test:e2e'
  },
  {
    id: 'lighthouse-production',
    label: 'Lighthouse production passed',
    status: statusFromBoolean(enabled('LIGHTHOUSE_PRODUCTION_PASSED')),
    adminValue: `LIGHTHOUSE_BASE_URL=${env('LIGHTHOUSE_BASE_URL', 'http://localhost:3000')}; LIGHTHOUSE_MIN_PERFORMANCE=${lighthouseMinPerformance}; LIGHTHOUSE_PRODUCTION_PASSED=${env('LIGHTHOUSE_PRODUCTION_PASSED', 'false')}`,
    userValue: 'Lighthouse must be run on deployed URL because CDN, images and script loading affect real scores.',
    launchNote: 'Run: LIGHTHOUSE_BASE_URL=$VERCEL_PRODUCTION_URL npm run lighthouse:local'
  },
  {
    id: 'mobile-viewport',
    label: 'Real mobile viewport QA',
    status: statusFromBoolean(enabled('MOBILE_VIEWPORT_QA_PASSED')),
    adminValue: `MOBILE_VIEWPORT_QA_PASSED=${env('MOBILE_VIEWPORT_QA_PASSED', 'false')}`,
    userValue: 'Chrome Android/iPhone-sized viewport should show no horizontal scroll, broken dropdowns or hidden CTAs.',
    launchNote: 'Save screenshots for home, complaint, tools, dashboard, admin and auth flows.'
  },
  {
    id: 'desktop-viewport',
    label: 'Desktop viewport QA',
    status: statusFromBoolean(enabled('DESKTOP_VIEWPORT_QA_PASSED')),
    adminValue: `DESKTOP_VIEWPORT_QA_PASSED=${env('DESKTOP_VIEWPORT_QA_PASSED', 'false')}`,
    userValue: 'Desktop layout should keep readable cards, safe admin sidebar, working dropdowns and stable spacing.',
    launchNote: 'Test 1366px and 1920px widths, plus browser zoom at 90% and 110%.'
  },
  {
    id: 'cron-jobs',
    label: 'Vercel cron jobs configured',
    status: statusFromBoolean(enabled('VERCEL_CRON_JOBS_CONFIGURED')),
    adminValue: `VERCEL_CRON_JOBS_CONFIGURED=${env('VERCEL_CRON_JOBS_CONFIGURED', 'false')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`,
    userValue: 'Cron routes for link checks, backup readiness, privacy ops and official data refresh need protected scheduled calls.',
    launchNote: 'Confirm Vercel cron settings and Authorization header secret before relying on automation.'
  },
  {
    id: 'seo-indexing',
    label: 'SEO/indexing production review',
    status: statusFromBoolean(enabled('SEO_INDEXING_REVIEWED')),
    adminValue: `SEO_INDEXING_REVIEWED=${env('SEO_INDEXING_REVIEWED', 'false')}; NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL', 'empty')}`,
    userValue: 'Sitemap, robots, canonical URL, metadataBase and Search Console should point to the live domain.',
    launchNote: 'Open /sitemap.xml, /robots.txt and core public pages on the deployed URL.'
  }
]

const scenarios: DeploymentQaScenario[] = [
  {
    id: 'mobile-home-nav',
    label: 'Mobile home + navigation',
    viewport: 'mobile',
    path: '/',
    passCondition: 'Header, language dropdown, account menu, bottom nav, hero CTA and footer are visible without horizontal scroll.',
    evidenceRequired: ['Android Chrome screenshot', 'Language dropdown screenshot', 'Bottom nav screenshot']
  },
  {
    id: 'mobile-complaint-flow',
    label: 'Mobile complaint wizard',
    viewport: 'mobile',
    path: '/complaint',
    passCondition: 'Complaint form fields, voice assist, generate action, copy/download/share actions and warning text fit small screens.',
    evidenceRequired: ['Filled form screenshot', 'Generated draft screenshot', 'No overflow proof']
  },
  {
    id: 'tablet-tools-grid',
    label: 'Tablet tools grid',
    viewport: 'tablet',
    path: '/tools',
    passCondition: 'Tool cards wrap cleanly, search/filter controls stay reachable and cards keep consistent spacing.',
    evidenceRequired: ['768px screenshot', '1024px screenshot']
  },
  {
    id: 'desktop-admin-shell',
    label: 'Desktop admin shell',
    viewport: 'desktop',
    path: '/admin/production-qa',
    passCondition: 'Admin sidebar stays sticky, content area scrolls normally and wide tables/cards do not force page overflow.',
    evidenceRequired: ['1366px screenshot', '1920px screenshot', 'Sidebar scroll proof']
  },
  {
    id: 'auth-dashboard-flow',
    label: 'Auth + dashboard smoke',
    viewport: 'desktop',
    path: '/dashboard',
    passCondition: 'Login/session redirect, dashboard cards, document vault links and account/security controls work after deployment.',
    evidenceRequired: ['Login proof', 'Dashboard screenshot', 'Account menu screenshot']
  },
  {
    id: 'api-health-cron',
    label: 'API health + cron routes',
    viewport: 'api',
    path: '/api/system/heartbeat',
    passCondition: 'Heartbeat is healthy, protected admin APIs require auth and cron routes reject missing/invalid secret.',
    evidenceRequired: ['Heartbeat JSON', '401/403 proof', 'Cron dry-run JSON']
  },
  {
    id: 'seo-public-pages',
    label: 'SEO public pages',
    viewport: 'seo',
    path: '/sitemap.xml',
    passCondition: 'Sitemap, robots, OpenGraph metadata and core landing pages resolve using final production domain.',
    evidenceRequired: ['Sitemap screenshot', 'Robots screenshot', 'Search Console URL inspection proof']
  }
]

export function getDeploymentQaReadinessReport(): DeploymentQaReport {
  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.33-live-deployment-qa-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      scenarios: scenarios.length,
      criticalScenarios: scenarios.filter((scenario) => ['mobile', 'api', 'seo'].includes(scenario.viewport)).length
    },
    controls,
    scenarios,
    runbook: [
      'Deploy preview branch to Vercel and verify build logs.',
      'Set VERCEL_PRODUCTION_URL, E2E_BASE_URL and LIGHTHOUSE_BASE_URL to the final deployed domain.',
      'Run npm run quality:release locally from a clean install.',
      'Run npm run test:e2e:install && npm run test:e2e against the deployed URL.',
      'Run LIGHTHOUSE_BASE_URL=$VERCEL_PRODUCTION_URL npm run lighthouse:local and save reports.',
      'Open mobile and desktop real-device screenshots for home, tools, complaint, dashboard and admin pages.',
      'Review Vercel function logs, cron routes, sitemap, robots and Search Console URL inspection.',
      'Mark env flags true only after evidence is saved; do not mark by assumption.'
    ],
    evidenceChecklist: [
      'Vercel production deployment URL and build log screenshot',
      'Vercel function/runtime log screenshot after smoke testing',
      'Playwright terminal or HTML report for mobile + desktop tests',
      'Lighthouse JSON/HTML report for production URL',
      'Android Chrome screenshots for home, language menu, complaint and tools pages',
      'Desktop screenshots for admin shell, final QA and dashboard pages',
      'Sitemap.xml, robots.txt and canonical metadata proof',
      'Cron route dry-run proof with CRON_SECRET configured'
    ]
  }
}
