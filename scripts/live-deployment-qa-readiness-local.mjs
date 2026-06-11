import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.DEPLOYMENT_QA_EVIDENCE_DIR || './artifacts/deployment-qa'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function enabled(name) {
  return env(name).toLowerCase() === 'true'
}

function httpsUrl(value) {
  return /^https:\/\//i.test(value || '') && !/localhost|127\.0\.0\.1|example|your-domain/i.test(value || '')
}

function numberEnv(name, fallback) {
  const raw = Number(env(name, String(fallback)))
  return Number.isFinite(raw) ? raw : fallback
}

const productionUrl = env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL') || env('E2E_BASE_URL')
const lighthouseMinPerformance = numberEnv('LIGHTHOUSE_MIN_PERFORMANCE', 75)

const controls = [
  ['production-url', 'Production HTTPS URL configured', httpsUrl(productionUrl) ? 'READY_TO_TEST' : 'BLOCKED', `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}; NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['preview-url', 'Preview deployment review path', httpsUrl(env('VERCEL_PREVIEW_URL')) || httpsUrl(env('VERCEL_PRODUCTION_URL')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `VERCEL_PREVIEW_URL=${env('VERCEL_PREVIEW_URL') || 'empty'}`],
  ['build-log', 'Vercel build log reviewed', enabled('VERCEL_BUILD_LOG_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `VERCEL_BUILD_LOG_REVIEWED=${env('VERCEL_BUILD_LOG_REVIEWED', 'false')}`],
  ['error-logs', 'Vercel runtime logs reviewed', enabled('VERCEL_ERROR_LOGS_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `VERCEL_ERROR_LOGS_REVIEWED=${env('VERCEL_ERROR_LOGS_REVIEWED', 'false')}`],
  ['playwright-production', 'Playwright production smoke passed', enabled('PLAYWRIGHT_PRODUCTION_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `E2E_BASE_URL=${env('E2E_BASE_URL', 'http://localhost:3000')}; PLAYWRIGHT_PRODUCTION_PASSED=${env('PLAYWRIGHT_PRODUCTION_PASSED', 'false')}`],
  ['lighthouse-production', 'Lighthouse production passed', enabled('LIGHTHOUSE_PRODUCTION_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `LIGHTHOUSE_BASE_URL=${env('LIGHTHOUSE_BASE_URL', 'http://localhost:3000')}; LIGHTHOUSE_MIN_PERFORMANCE=${lighthouseMinPerformance}; LIGHTHOUSE_PRODUCTION_PASSED=${env('LIGHTHOUSE_PRODUCTION_PASSED', 'false')}`],
  ['mobile-viewport', 'Real mobile viewport QA', enabled('MOBILE_VIEWPORT_QA_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `MOBILE_VIEWPORT_QA_PASSED=${env('MOBILE_VIEWPORT_QA_PASSED', 'false')}`],
  ['desktop-viewport', 'Desktop viewport QA', enabled('DESKTOP_VIEWPORT_QA_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DESKTOP_VIEWPORT_QA_PASSED=${env('DESKTOP_VIEWPORT_QA_PASSED', 'false')}`],
  ['cron-jobs', 'Vercel cron jobs configured', enabled('VERCEL_CRON_JOBS_CONFIGURED') && configured('CRON_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `VERCEL_CRON_JOBS_CONFIGURED=${env('VERCEL_CRON_JOBS_CONFIGURED', 'false')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`],
  ['seo-indexing', 'SEO/indexing production review', enabled('SEO_INDEXING_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEO_INDEXING_REVIEWED=${env('SEO_INDEXING_REVIEWED', 'false')}; NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['evidence-output', 'Deployment QA evidence output', 'PASS', `DEPLOYMENT_QA_EVIDENCE_DIR=${outputDir}`]
]

const scenarios = [
  ['mobile-home-nav', 'Mobile home + navigation', 'mobile', '/', 'Header, language dropdown, account menu, bottom nav, hero CTA and footer are visible without horizontal scroll.', 'Android Chrome screenshot | Language dropdown screenshot | Bottom nav screenshot'],
  ['mobile-complaint-flow', 'Mobile complaint wizard', 'mobile', '/complaint', 'Complaint form fields, voice assist, generate action, copy/download/share actions and warning text fit small screens.', 'Filled form screenshot | Generated draft screenshot | No overflow proof'],
  ['tablet-tools-grid', 'Tablet tools grid', 'tablet', '/tools', 'Tool cards wrap cleanly, search/filter controls stay reachable and cards keep consistent spacing.', '768px screenshot | 1024px screenshot'],
  ['desktop-admin-shell', 'Desktop admin shell', 'desktop', '/admin/production-qa', 'Admin sidebar stays sticky, content area scrolls normally and wide tables/cards do not force page overflow.', '1366px screenshot | 1920px screenshot | Sidebar scroll proof'],
  ['auth-dashboard-flow', 'Auth + dashboard smoke', 'desktop', '/dashboard', 'Login/session redirect, dashboard cards, document vault links and account/security controls work after deployment.', 'Login proof | Dashboard screenshot | Account menu screenshot'],
  ['api-health-cron', 'API health + cron routes', 'api', '/api/system/heartbeat', 'Heartbeat is healthy, protected admin APIs require auth and cron routes reject missing/invalid secret.', 'Heartbeat JSON | 401/403 proof | Cron dry-run JSON'],
  ['seo-public-pages', 'SEO public pages', 'seo', '/sitemap.xml', 'Sitemap, robots, OpenGraph metadata and core landing pages resolve using final production domain.', 'Sitemap screenshot | Robots screenshot | Search Console URL inspection proof']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.33-live-deployment-qa-readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length,
    scenarios: scenarios.length,
    criticalScenarios: scenarios.filter((scenario) => ['mobile', 'api', 'seo'].includes(scenario[2])).length
  },
  controls: controls.map(([id, label, status, adminValue]) => ({ id, label, status, adminValue })),
  scenarios: scenarios.map(([id, label, viewport, path, passCondition, evidenceRequired]) => ({ id, label, viewport, path, passCondition, evidenceRequired: evidenceRequired.split(' | ') }))
}

const controlRows = [['id', 'label', 'status', 'admin_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const scenarioRows = [['id', 'label', 'viewport', 'path', 'pass_condition', 'evidence_required'], ...scenarios].map((row) => row.map((value) => String(value).replaceAll(',', ';')))

writeFileSync(join(outputDir, 'deployment-qa-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'deployment-qa-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'deployment-qa-scenarios.csv'), scenarioRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Deployment QA readiness evidence written to ${outputDir}`)
console.log(`Scenarios: ${report.summary.scenarios} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
