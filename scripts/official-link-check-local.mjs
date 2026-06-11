import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const seedFile = join(root, 'lib/link-checks/seed-link-checks.ts')
const outputDir = process.env.LINK_CHECK_LOCAL_OUTPUT_DIR || './artifacts/link-checks'
const timeoutMs = Number(process.env.LINK_CHECK_TIMEOUT_MS || 8000)

function readSeeds() {
  const text = readFileSync(seedFile, 'utf8')
  const itemRegex = /\{\s*label:\s*'([^']+)'\s*,\s*url:\s*'([^']+)'\s*,\s*category:\s*'([^']+)'\s*,\s*state:\s*'([^']+)'/g
  return Array.from(text.matchAll(itemRegex)).map((match) => ({
    label: match[1],
    url: match[2],
    category: match[3],
    state: match[4]
  }))
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function fetchWithTimeout(url, method) {
  const controller = new AbortController()
  const started = Date.now()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'HaqSathiAI-LinkMonitor/1.0 (+https://www.haqsathi.site)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    return { httpStatus: response.status, method, responseTimeMs: Date.now() - started, error: '' }
  } catch (error) {
    return { httpStatus: '', method, responseTimeMs: Date.now() - started, error: error instanceof Error ? error.message : String(error) }
  } finally {
    clearTimeout(timer)
  }
}

function statusFromHttpStatus(status) {
  const code = Number(status)
  if (!code) return 'NEEDS_REVIEW'
  if (code >= 200 && code < 400) return 'VERIFIED'
  if ([401, 403, 405, 429].includes(code)) return 'NEEDS_REVIEW'
  if ([404, 410, 451].includes(code)) return 'BROKEN'
  if (code >= 500) return 'NEEDS_REVIEW'
  return 'NEEDS_REVIEW'
}

async function checkLink(link) {
  const head = await fetchWithTimeout(link.url, 'HEAD')
  const result = head.httpStatus && head.httpStatus !== 405 && head.httpStatus !== 403 ? head : await fetchWithTimeout(link.url, 'GET')
  return {
    ...link,
    status: statusFromHttpStatus(result.httpStatus),
    httpStatus: result.httpStatus || '',
    method: result.method,
    responseTimeMs: result.responseTimeMs,
    error: result.error,
    checkedAt: new Date().toISOString()
  }
}

const seeds = readSeeds()
if (!seeds.length) {
  console.error('No link seeds found in lib/link-checks/seed-link-checks.ts')
  process.exit(1)
}

const results = []
for (const seed of seeds) {
  results.push(await checkLink(seed))
}

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const jsonPath = join(outputDir, `official-link-check-${stamp}.json`)
const csvPath = join(outputDir, `official-link-check-${stamp}.csv`)
const csvHeader = ['label', 'url', 'category', 'state', 'status', 'httpStatus', 'method', 'responseTimeMs', 'error', 'checkedAt']
const csvRows = [csvHeader.join(','), ...results.map((row) => csvHeader.map((key) => csvEscape(row[key])).join(','))]
writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
writeFileSync(csvPath, csvRows.join('\n') + '\n')

const summary = {
  total: results.length,
  verified: results.filter((row) => row.status === 'VERIFIED').length,
  needsReview: results.filter((row) => row.status === 'NEEDS_REVIEW').length,
  broken: results.filter((row) => row.status === 'BROKEN').length
}

console.log('\nHaqSathi official link local check')
console.log(`Total: ${summary.total}`)
console.log(`Verified: ${summary.verified}`)
console.log(`Needs review: ${summary.needsReview}`)
console.log(`Broken: ${summary.broken}`)
console.log(`JSON: ${jsonPath}`)
console.log(`CSV: ${csvPath}\n`)

if (summary.broken > 0) process.exitCode = 1
