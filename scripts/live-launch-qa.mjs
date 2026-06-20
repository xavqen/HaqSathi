import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const baseUrl = (process.env.LAUNCH_QA_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
const outDir = process.env.LAUNCH_QA_OUTPUT_DIR || './artifacts/live-launch-qa'
const timeoutMs = Number(process.env.LAUNCH_QA_TIMEOUT_MS || 15000)
const routes = (process.env.LAUNCH_QA_ROUTES || '/,/about,/tools,/tools/scam-radar,/tools/smart-complaint-wizard,/complaint,/upi-help,/scheme-finder,/documents,/pricing,/search,/status,/privacy,/terms,/disclaimer,/language-hub/hindi')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

mkdirSync(outDir, { recursive: true })

function count(text, token) {
  return (text.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || ''
}

async function fetchRoute(route) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const url = `${baseUrl}${route}`
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'cache-control': 'no-cache',
        'user-agent': 'HaqSathiLaunchQA/3.0.98'
      }
    })
    const html = await response.text()
    return { route, url, status: response.status, ok: response.ok, html, title: extractTitle(html) }
  } catch (error) {
    return { route, url, status: 0, ok: false, error: error instanceof Error ? error.message : 'Fetch failed', html: '', title: '' }
  } finally {
    clearTimeout(timer)
  }
}

function inspect(result) {
  const issues = []
  const html = result.html || ''
  if (!result.ok) issues.push(`HTTP ${result.status || 'fetch-failed'}`)
  if (result.title && count(result.title, 'HaqSathi AI') !== 1) issues.push(`SEO title should contain HaqSathi AI exactly once; got: ${result.title}`)
  if (/In local development, empty Razorpay keys/i.test(html)) issues.push('Pricing/dev Razorpay debug copy is visible')
  if (/Document vault placeholder/i.test(html)) issues.push('Document vault placeholder copy is visible')
  if (/Respond primarily|Use simple words|system instruction/i.test(html)) issues.push('AI system prompt/instruction text is visible')
  if (result.route === '/' && /0\+\s*Tools/i.test(html)) issues.push('Homepage renders 0+ Tools before hydration')
  if (['/upi-help', '/tools/scam-radar', '/tools/smart-complaint-wizard'].includes(result.route)) {
    if (!html.includes('1930')) issues.push('Official fraud helpline 1930 missing')
    if (!/cybercrime\.gov\.in/i.test(html)) issues.push('cybercrime.gov.in missing')
  }
  if (['/privacy', '/terms', '/disclaimer', '/about'].includes(result.route) && html.length < 3000) issues.push('Public trust/legal page looks too thin')
  return issues
}

const results = []
for (const route of routes) {
  const result = await fetchRoute(route)
  const issues = inspect(result)
  results.push({ route: result.route, url: result.url, status: result.status, title: result.title, ok: result.ok && issues.length === 0, issues })
  const mark = result.ok && issues.length === 0 ? '✅' : '❌'
  console.log(`${mark} ${route} ${result.status} ${issues.length ? '- ' + issues.join('; ') : ''}`)
}

const blockers = results.filter((item) => !item.ok)
const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  baseUrl,
  routesChecked: results.length,
  blockers: blockers.length,
  results
}
const reportPath = path.join(outDir, 'live-launch-qa-report.json')
writeFileSync(reportPath, JSON.stringify(report, null, 2))
console.log(`\nLive launch QA report saved to ${reportPath}`)
if (blockers.length) {
  console.error(`Launch QA blockers: ${blockers.length}`)
  process.exit(1)
}
