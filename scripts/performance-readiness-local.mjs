import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.PERFORMANCE_EVIDENCE_DIR || './artifacts/performance-readiness'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return env(name).toLowerCase() === 'true'
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

const routeTargets = env('PERFORMANCE_ROUTE_TARGETS', '/,/complaint,/upi-help,/scheme-finder,/documents,/tools,/chat,/pricing,/dashboard').split(',').map((route) => route.trim()).filter(Boolean)
const minPerformance = env('LIGHTHOUSE_MIN_PERFORMANCE', '75')
const minAccessibility = env('LIGHTHOUSE_MIN_ACCESSIBILITY', '90')
const minBestPractices = env('LIGHTHOUSE_MIN_BEST_PRACTICES', '90')
const minSeo = env('LIGHTHOUSE_MIN_SEO', '90')
const lcp = env('WEB_VITALS_LCP_TARGET_MS', '2500')
const cls = env('WEB_VITALS_CLS_TARGET', '0.10')
const inp = env('WEB_VITALS_INP_TARGET_MS', '200')

const controls = [
  ['production-url', 'Production URL configured', configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['lighthouse-base-url', 'Lighthouse base URL configured', 'READY_TO_TEST', `LIGHTHOUSE_BASE_URL=${env('LIGHTHOUSE_BASE_URL', 'http://localhost:3000')}`],
  ['score-budget', 'Lighthouse score budget declared', 'READY_TO_TEST', `P=${minPerformance} A=${minAccessibility} BP=${minBestPractices} SEO=${minSeo}`],
  ['web-vitals-budget', 'Core Web Vitals budget declared', 'READY_TO_TEST', `LCP=${lcp}ms CLS=${cls} INP=${inp}ms`],
  ['mobile-throttle-reviewed', 'Mobile throttling reviewed', enabled('PERFORMANCE_MOBILE_THROTTLE_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PERFORMANCE_MOBILE_THROTTLE_REVIEWED=${env('PERFORMANCE_MOBILE_THROTTLE_REVIEWED', 'false')}`],
  ['bundle-reviewed', 'Bundle size reviewed', enabled('PERFORMANCE_BUNDLE_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PERFORMANCE_BUNDLE_REVIEWED=${env('PERFORMANCE_BUNDLE_REVIEWED', 'false')}`],
  ['image-font-reviewed', 'Images and fonts reviewed', enabled('PERFORMANCE_IMAGE_REVIEWED') && enabled('PERFORMANCE_FONT_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `IMAGE=${env('PERFORMANCE_IMAGE_REVIEWED', 'false')} FONT=${env('PERFORMANCE_FONT_REVIEWED', 'false')}`],
  ['performance-evidence-dir', 'Performance evidence directory configured', 'READY_TO_TEST', `PERFORMANCE_EVIDENCE_DIR=${outputDir}`]
]

const lanes = [
  ['core-web-vitals-mobile', 'P0', 'Core Web Vitals mobile pass', 'Mobile Lighthouse/PageSpeed report'],
  ['critical-route-speed', 'P0', 'Critical route speed budget', 'Mobile + desktop route proof'],
  ['image-font-optimization', 'P1', 'Image and font delivery review', 'Network waterfall screenshot'],
  ['javascript-bundle-budget', 'P1', 'JavaScript bundle budget', 'Build output / chunk notes'],
  ['api-latency-budget', 'P1', 'API latency budget', 'API timing table'],
  ['third-party-script-budget', 'P2', 'Third-party script budget', 'Third-party inventory']
]

const ready = controls.filter((control) => control[2] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[2] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.37-performance-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, routes: routeTargets.length, lanes: lanes.length },
  controls: controls.map(([id, label, status, envValue]) => ({ id, label, status, envValue })),
  lanes: lanes.map(([id, priority, label, evidence]) => ({ id, priority, label, evidence })),
  routeTargets,
  nextAction: blocked ? 'Configure production URL before final speed QA.' : manualRequired ? 'Save Lighthouse, low-end mobile, bundle, image and font evidence before launch traffic.' : 'Performance readiness controls are ready for final deployed-domain proof.'
}

const controlRows = [['id', 'label', 'status', 'env_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const laneRows = [['id', 'priority', 'label', 'evidence'], ...lanes].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const routeRows = [['route'], ...routeTargets.map((route) => [route])]

writeFileSync(join(outputDir, 'performance-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'performance-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'performance-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'performance-routes.csv'), routeRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Performance readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Routes: ${routeTargets.length}`)
