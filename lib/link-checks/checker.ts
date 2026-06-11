import { LinkCheckStatus } from '@prisma/client'
import { db } from '@/lib/db'

export type OfficialLinkCheckResult = {
  id: string
  label: string
  url: string
  previousStatus: LinkCheckStatus
  status: LinkCheckStatus
  httpStatus: number | null
  ok: boolean
  checkedAt: string
  responseTimeMs: number
  note: string
}

function timeoutMs() {
  const parsed = Number(process.env.LINK_CHECK_TIMEOUT_MS || 8000)
  return Number.isFinite(parsed) && parsed >= 1500 ? parsed : 8000
}

function statusFromHttpStatus(status: number | null): LinkCheckStatus {
  if (!status) return LinkCheckStatus.NEEDS_REVIEW
  if (status >= 200 && status < 400) return LinkCheckStatus.VERIFIED
  if (status === 401 || status === 403 || status === 405 || status === 429) return LinkCheckStatus.NEEDS_REVIEW
  if (status === 404 || status === 410 || status === 451) return LinkCheckStatus.BROKEN
  if (status >= 500) return LinkCheckStatus.NEEDS_REVIEW
  return LinkCheckStatus.NEEDS_REVIEW
}

function noteFor(status: LinkCheckStatus, httpStatus: number | null, method: string, error?: string) {
  if (status === LinkCheckStatus.VERIFIED) return `Auto-checked ${method}: reachable with HTTP ${httpStatus}. Manual content review is still recommended before deadline/date claims.`
  if (status === LinkCheckStatus.BROKEN) return `Auto-checked ${method}: link appears broken with HTTP ${httpStatus}. Replace or verify manually before publishing.`
  if (httpStatus) return `Auto-checked ${method}: HTTP ${httpStatus}. Portal may block bots or require browser review, so manual verification is required.`
  return `Auto-check could not confirm reachability${error ? `: ${error}` : ''}. Open manually before publishing.`
}

async function fetchWithTimeout(url: string, method: 'HEAD' | 'GET') {
  const started = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs())
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
    return { httpStatus: response.status, responseTimeMs: Date.now() - started, method, error: null as string | null }
  } catch (error) {
    return {
      httpStatus: null,
      responseTimeMs: Date.now() - started,
      method,
      error: error instanceof Error ? error.message : String(error)
    }
  } finally {
    clearTimeout(timer)
  }
}

async function checkSingleUrl(url: string) {
  const head = await fetchWithTimeout(url, 'HEAD')
  if (head.httpStatus && head.httpStatus !== 405 && head.httpStatus !== 403) return head
  const get = await fetchWithTimeout(url, 'GET')
  return get.httpStatus || !head.httpStatus ? get : head
}

export async function runOfficialLinkChecks(limit?: number): Promise<OfficialLinkCheckResult[]> {
  const batchLimit = Math.max(1, Math.min(Number(limit || process.env.LINK_CHECK_BATCH_LIMIT || 25), 100))
  const links = await db.officialLinkCheck.findMany({
    orderBy: [{ lastCheckedAt: 'asc' }, { updatedAt: 'asc' }],
    take: batchLimit
  })

  const checkedAt = new Date().toISOString()
  const results: OfficialLinkCheckResult[] = []

  for (const link of links) {
    const previousStatus = link.status
    const result = await checkSingleUrl(link.url)
    const status = statusFromHttpStatus(result.httpStatus)
    const note = noteFor(status, result.httpStatus, result.method, result.error || undefined)

    await db.officialLinkCheck.update({
      where: { id: link.id },
      data: {
        status,
        lastCheckedAt: new Date(checkedAt),
        notes: note
      }
    })

    results.push({
      id: link.id,
      label: link.label,
      url: link.url,
      previousStatus,
      status,
      httpStatus: result.httpStatus,
      ok: status === LinkCheckStatus.VERIFIED,
      checkedAt,
      responseTimeMs: result.responseTimeMs,
      note
    })
  }

  return results
}

export function summarizeOfficialLinkChecks(results: OfficialLinkCheckResult[]) {
  return {
    total: results.length,
    verified: results.filter((result) => result.status === LinkCheckStatus.VERIFIED).length,
    needsReview: results.filter((result) => result.status === LinkCheckStatus.NEEDS_REVIEW).length,
    broken: results.filter((result) => result.status === LinkCheckStatus.BROKEN).length,
    unknown: results.filter((result) => result.status === LinkCheckStatus.UNKNOWN).length
  }
}
