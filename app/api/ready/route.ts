import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

type ReadinessStatus = 'pass' | 'fail' | 'warn'

type ReadinessCheck = {
  id: string
  area: string
  status: ReadinessStatus
  message: string
}

const placeholderPattern = /change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD|\[.*\]/i

function hasUsableValue(name: string) {
  const value = process.env[name]
  return Boolean(value && value.trim() && !placeholderPattern.test(value))
}

function addCheck(checks: ReadinessCheck[], id: string, area: string, status: ReadinessStatus, message: string) {
  checks.push({ id, area, status, message })
}

export async function GET() {
  const readinessChecks: ReadinessCheck[] = []

  addCheck(
    readinessChecks,
    'app-url',
    'App',
    hasUsableValue('NEXT_PUBLIC_APP_URL') ? 'pass' : 'fail',
    hasUsableValue('NEXT_PUBLIC_APP_URL') ? 'Production app URL configured.' : 'Set NEXT_PUBLIC_APP_URL to the final domain.'
  )
  addCheck(
    readinessChecks,
    'auth-secret',
    'Security',
    hasUsableValue('AUTH_SECRET') ? 'pass' : 'fail',
    hasUsableValue('AUTH_SECRET') ? 'Auth secret configured.' : 'Set a long AUTH_SECRET before production.'
  )
  addCheck(
    readinessChecks,
    'database-url',
    'Database',
    hasUsableValue('DATABASE_URL') ? 'pass' : 'fail',
    hasUsableValue('DATABASE_URL') ? 'Runtime database URL configured.' : 'Set DATABASE_URL.'
  )
  addCheck(
    readinessChecks,
    'direct-url',
    'Database',
    hasUsableValue('DIRECT_URL') ? 'pass' : 'fail',
    hasUsableValue('DIRECT_URL') ? 'Prisma direct URL configured.' : 'Set DIRECT_URL.'
  )
  addCheck(
    readinessChecks,
    'ai-provider',
    'AI',
    hasUsableValue('OPENAI_API_KEY') || hasUsableValue('GEMINI_API_KEY') ? 'pass' : 'warn',
    hasUsableValue('OPENAI_API_KEY') || hasUsableValue('GEMINI_API_KEY') ? 'At least one AI provider key configured.' : 'No AI provider key configured; safe fallback mode will be used.'
  )
  addCheck(
    readinessChecks,
    'rate-limit',
    'Reliability',
    hasUsableValue('UPSTASH_REDIS_REST_URL') && hasUsableValue('UPSTASH_REDIS_REST_TOKEN') ? 'pass' : 'warn',
    hasUsableValue('UPSTASH_REDIS_REST_URL') && hasUsableValue('UPSTASH_REDIS_REST_TOKEN') ? 'Durable Upstash rate limit configured.' : 'Upstash rate limit missing; serverless fallback may reset between cold starts.'
  )

  let databaseConnectivity = false
  try {
    await db.$queryRaw`SELECT 1`
    databaseConnectivity = true
    addCheck(readinessChecks, 'database-connectivity', 'Database', 'pass', 'Database responded to SELECT 1.')
  } catch {
    addCheck(readinessChecks, 'database-connectivity', 'Database', 'fail', 'Database query failed. Check DATABASE_URL, DIRECT_URL and Supabase network settings.')
  }

  const blockers = readinessChecks.filter((item) => item.status === 'fail')
  const warnings = readinessChecks.filter((item) => item.status === 'warn')
  const ok = blockers.length === 0

  return NextResponse.json(
    {
      ok,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.105-motion-hydration-stability',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'local',
      summary: {
        total: readinessChecks.length,
        pass: readinessChecks.filter((item) => item.status === 'pass').length,
        warn: warnings.length,
        fail: blockers.length,
        databaseConnectivity
      },
      readinessChecks,
      time: new Date().toISOString()
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-HaqSathi-Ready': ok ? 'ok' : 'blocked'
      }
    }
  )
}
