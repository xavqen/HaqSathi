import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const outDir = process.env.LAUNCH_QA_OUTPUT_DIR || process.env.LAUNCH_EVIDENCE_DIR || './artifacts/live-launch-qa'
mkdirSync(outDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return env(name).toLowerCase() === 'true'
}

function normalizeBaseUrl(value) {
  const fallback = 'http://localhost:3000'
  const raw = (value || fallback).trim().replace(/\/+$/, '')
  if (!raw) return fallback
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return url.origin
  } catch {
    return fallback
  }
}

const baseUrl = normalizeBaseUrl(env('OPS_HEALTH_BASE_URL') || env('LAUNCH_QA_BASE_URL') || env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL'))
const timeoutMs = Number(env('OPS_SNAPSHOT_TIMEOUT_MS', '8000'))
const expectedVersion = env('NEXT_PUBLIC_APP_VERSION', '3.0.98')
const requiredPaths = ['/api/health', '/api/ready', '/status', '/launch-readiness']
const secretPattern = /(AUTH_SECRET|DATABASE_URL|DIRECT_URL|SUPABASE_SERVICE_ROLE_KEY|RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET|UPSTASH_REDIS_REST_TOKEN|OPENAI_API_KEY|GEMINI_API_KEY|RESEND_API_KEY|postgresql:\/\/|sk_live_|sk_test_|rzp_live_|rzp_test_)/i

async function checkPath(routePath) {
  const url = `${baseUrl}${routePath}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const started = Date.now()
  const result = {
    path: routePath,
    url,
    status: 0,
    ok: false,
    latencyMs: 0,
    cacheControl: '',
    contentType: '',
    versionSeen: '',
    secretLeak: false,
    blocker: ''
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'HaqSathiOpsSnapshot/3.0.98' }
    })
    const text = await response.text()
    result.status = response.status
    result.ok = response.ok
    result.latencyMs = Date.now() - started
    result.cacheControl = response.headers.get('cache-control') || ''
    result.contentType = response.headers.get('content-type') || ''
    result.secretLeak = secretPattern.test(text)
    try {
      const json = JSON.parse(text)
      result.versionSeen = String(json.version || json.release?.version || '')
      if (routePath === '/api/health' && json.ok !== true) result.blocker = 'health_json_not_ok'
      if (routePath === '/api/ready' && json.ok !== true) result.blocker = 'ready_json_not_ok'
    } catch {
      result.versionSeen = ''
    }
    if (!response.ok && !result.blocker) result.blocker = `http_${response.status}`
    if (routePath.startsWith('/api/') && !/no-store|no-cache/i.test(result.cacheControl)) result.blocker = result.blocker || 'api_cache_header_missing'
    if (result.secretLeak) result.blocker = result.blocker || 'secret_like_text_detected'
    if (routePath === '/api/health' && expectedVersion && result.versionSeen && !result.versionSeen.includes(expectedVersion)) result.blocker = result.blocker || 'version_mismatch'
  } catch (error) {
    result.latencyMs = Date.now() - started
    result.blocker = error?.name === 'AbortError' ? 'timeout' : 'fetch_failed'
  } finally {
    clearTimeout(timer)
  }
  return result
}

const checks = []
for (const routePath of requiredPaths) checks.push(await checkPath(routePath))

const productionUrlSafe = /^https:\/\//i.test(baseUrl) && !/localhost|127\.0\.0\.1|example|your-domain|haqsathi\.local/i.test(baseUrl)
const blockers = []
if (!productionUrlSafe && enabled('STRICT_PRODUCTION_OPS')) blockers.push('production_base_url_not_https_or_final')
for (const check of checks) if (check.blocker) blockers.push(`${check.path}:${check.blocker}`)

const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  baseUrl,
  strict: enabled('STRICT_PRODUCTION_OPS'),
  summary: {
    total: checks.length,
    passing: checks.filter((item) => !item.blocker).length,
    blockers: blockers.length,
    maxLatencyMs: Math.max(...checks.map((item) => item.latencyMs))
  },
  checks,
  blockers,
  runbook: [
    'Deploy the exact ZIP/build to Vercel production.',
    'Set OPS_HEALTH_BASE_URL=https://haqsathi.site.',
    'Run OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot.',
    'If /api/ready returns 503, fix env/database before marketing launch.',
    'Run npm run launch:rollback-drill before final public launch.',
    'Keep production-ops-snapshot.json with Lighthouse, Playwright, rollback drill and evidence gate artifacts.'
  ]
}

const jsonPath = path.join(outDir, 'production-ops-snapshot.json')
const csvPath = path.join(outDir, 'production-ops-snapshot.csv')
writeFileSync(jsonPath, JSON.stringify(report, null, 2))
writeFileSync(csvPath, ['path,url,status,ok,latency_ms,cache_control,version_seen,blocker', ...checks.map((item) => [item.path, item.url, item.status, item.ok, item.latencyMs, item.cacheControl, item.versionSeen, item.blocker].map((value) => String(value).replaceAll('"', "'")).map((value) => `"${value}"`).join(','))].join('\n'))

for (const item of checks) console.log(`${item.blocker ? '❌' : '✅'} ${item.path} ${item.status || 'ERR'} ${item.latencyMs}ms ${item.blocker || 'PASS'}`)
console.log(`\nProduction ops snapshot: ${blockers.length ? 'BLOCKED' : 'PASS'}`)
console.log(`Report saved to ${jsonPath}`)
if (enabled('STRICT_PRODUCTION_OPS') && blockers.length) process.exit(1)
