import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.SEO_INDEXING_EVIDENCE_DIR || './artifacts/seo-indexing'
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

const coreRoutes = env('SEO_INDEXING_CORE_ROUTES', '/,/complaint,/upi-help,/scheme-finder,/documents,/tools,/official-sources,/authority-directory,/filing-guides,/state-guides,/pricing,/blog').split(',').map((route) => route.trim()).filter(Boolean)

const controls = [
  ['production-url', 'Production URL configured', configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['search-console-property', 'Search Console property verified', enabled('SEARCH_CONSOLE_PROPERTY_VERIFIED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_CONSOLE_PROPERTY_VERIFIED=${env('SEARCH_CONSOLE_PROPERTY_VERIFIED', 'false')}`],
  ['sitemap-submitted', 'Sitemap submitted successfully', enabled('SEARCH_CONSOLE_SITEMAP_SUBMITTED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_CONSOLE_SITEMAP_SUBMITTED=${env('SEARCH_CONSOLE_SITEMAP_SUBMITTED', 'false')}`],
  ['robots-reviewed', 'Robots.txt reviewed on production', enabled('ROBOTS_TXT_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ROBOTS_TXT_REVIEWED=${env('ROBOTS_TXT_REVIEWED', 'false')}`],
  ['canonical-reviewed', 'Canonical metadata reviewed', enabled('SEO_CANONICAL_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEO_CANONICAL_REVIEWED=${env('SEO_CANONICAL_REVIEWED', 'false')}`],
  ['evidence-dir', 'SEO indexing evidence directory configured', 'READY_TO_TEST', `SEO_INDEXING_EVIDENCE_DIR=${outputDir}`]
]

const lanes = [
  ['domain-property', 'P0', 'Search Console domain property', 'Search Console property screenshot'],
  ['sitemap-submit', 'P0', 'Sitemap submitted and fetched', 'Search Console sitemap success screenshot'],
  ['robots-indexability', 'P0', 'Robots and noindex guard', 'robots.txt screenshot'],
  ['canonical-metadata', 'P1', 'Canonical and metadata review', 'metadata screenshot'],
  ['core-route-inspection', 'P1', 'Core route URL inspection', 'URL inspection screenshots'],
  ['search-snippet-safety', 'P2', 'Snippet safety and disclaimer review', 'SERP preview note']
]

const ready = controls.filter((control) => control[2] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[2] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.36-seo-indexing-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, coreRoutes: coreRoutes.length, lanes: lanes.length },
  controls: controls.map(([id, label, status, envValue]) => ({ id, label, status, envValue })),
  lanes: lanes.map(([id, priority, label, evidence]) => ({ id, priority, label, evidence })),
  coreRoutes,
  nextAction: blocked ? 'Configure production URL before Search Console launch QA.' : manualRequired ? 'Save Search Console, sitemap, robots and metadata evidence before launch traffic.' : 'SEO indexing readiness controls are ready for final launch evidence.'
}

const controlRows = [['id', 'label', 'status', 'env_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const routeRows = [['route'], ...coreRoutes.map((route) => [route])]
const laneRows = [['id', 'priority', 'label', 'evidence'], ...lanes].map((row) => row.map((value) => String(value).replaceAll(',', ';')))

writeFileSync(join(outputDir, 'seo-indexing-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'seo-indexing-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'seo-indexing-core-routes.csv'), routeRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'seo-indexing-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ SEO indexing readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Core routes: ${coreRoutes.length}`)
