import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const outDir = process.env.LAUNCH_QA_OUTPUT_DIR || './artifacts/live-launch-qa'
mkdirSync(outDir, { recursive: true })

function configured(key) {
  const value = process.env[key]
  return Boolean(value && !/change-this|example|your-|PROJECT_REF|localhost|127\.0\.0\.1|\[YOUR-PASSWORD\]/i.test(value))
}

function mask(key) {
  const value = process.env[key]
  if (!value) return 'missing'
  if (value.length <= 10) return 'configured'
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

const checks = []
function check(id, area, ok, status, advice) {
  checks.push({ id, area, ok, status, advice })
}

const razorpayKey = process.env.RAZORPAY_KEY_ID || ''
const publicRazorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

check('razorpay-key-id', 'Billing', configured('RAZORPAY_KEY_ID') && /^rzp_(test|live)_/i.test(razorpayKey), mask('RAZORPAY_KEY_ID'), 'Use a real Razorpay test/live key ID starting with rzp_test_ or rzp_live_.')
check('razorpay-public-key-match', 'Billing', Boolean(publicRazorpayKey && publicRazorpayKey === razorpayKey), mask('NEXT_PUBLIC_RAZORPAY_KEY_ID'), 'NEXT_PUBLIC_RAZORPAY_KEY_ID must match RAZORPAY_KEY_ID so browser checkout opens the same provider account.')
check('razorpay-secret', 'Billing', configured('RAZORPAY_KEY_SECRET'), mask('RAZORPAY_KEY_SECRET'), 'Set only as a server-side env variable. Never expose as NEXT_PUBLIC.')
check('razorpay-webhook-secret', 'Billing', configured('RAZORPAY_WEBHOOK_SECRET'), mask('RAZORPAY_WEBHOOK_SECRET'), 'Set a real Razorpay webhook secret before relying on async payment events.')
check('supabase-url', 'Storage', configured('NEXT_PUBLIC_SUPABASE_URL') && /^https:\/\/[^/]+\.supabase\.co$/i.test(publicSupabaseUrl.replace(/\/$/, '')), publicSupabaseUrl ? publicSupabaseUrl.replace(/\/$/, '') : 'missing', 'Set the Supabase project URL exactly, without a trailing path.')
check('supabase-service-key', 'Storage', configured('SUPABASE_SERVICE_ROLE_KEY') && !serviceRole.startsWith('anon'), mask('SUPABASE_SERVICE_ROLE_KEY'), 'Use the service-role key server-side for private signed document uploads/downloads.')
check('supabase-bucket', 'Storage', configured('SUPABASE_STORAGE_BUCKET'), process.env.SUPABASE_STORAGE_BUCKET || 'missing', 'Create a private bucket, usually documents.')
check('database-runtime-url', 'Database', configured('DATABASE_URL'), mask('DATABASE_URL'), 'Set the Supabase Transaction Pooler URL for Vercel/serverless runtime.')
check('database-direct-url', 'Database', configured('DIRECT_URL'), mask('DIRECT_URL'), 'Set the Supabase direct connection URL for Prisma migrate/db push.')
check('upstash-url', 'Rate limit', configured('UPSTASH_REDIS_REST_URL'), process.env.UPSTASH_REDIS_REST_URL ? process.env.UPSTASH_REDIS_REST_URL.replace(/\?.*/, '') : 'missing', 'Set Upstash REST URL for durable distributed rate limits.')
check('upstash-token', 'Rate limit', configured('UPSTASH_REDIS_REST_TOKEN'), mask('UPSTASH_REDIS_REST_TOKEN'), 'Set Upstash REST token server-side only.')

if (process.env.RUN_LIVE_STORAGE_CHECK === 'true' && configured('NEXT_PUBLIC_SUPABASE_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') && configured('SUPABASE_STORAGE_BUCKET')) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  const response = await fetch(`${publicSupabaseUrl.replace(/\/$/, '')}/storage/v1/bucket/${bucket}`, {
    headers: { Authorization: `Bearer ${serviceRole}`, apikey: serviceRole }
  }).catch((error) => error)
  if (response instanceof Error) {
    check('supabase-bucket-live', 'Storage', false, response.message, 'Live bucket check failed before getting a response.')
  } else {
    check('supabase-bucket-live', 'Storage', response.ok, `HTTP ${response.status}`, 'Bucket endpoint must be reachable with service-role key. Keep bucket private; use signed URLs for downloads.')
  }
}

if (process.env.RUN_RAZORPAY_ACCOUNT_CHECK === 'true' && configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_KEY_SECRET')) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
  const response = await fetch('https://api.razorpay.com/v1/orders?count=1', { headers: { Authorization: `Basic ${auth}` } }).catch((error) => error)
  if (response instanceof Error) {
    check('razorpay-auth-live', 'Billing', false, response.message, 'Razorpay account check failed before getting a response.')
  } else {
    check('razorpay-auth-live', 'Billing', response.ok, `HTTP ${response.status}`, 'Razorpay test/live credentials must authenticate before accepting payments.')
  }
}

const blockers = checks.filter((item) => !item.ok)
const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  strict: process.env.STRICT_LAUNCH_QA === 'true',
  summary: { checks: checks.length, passing: checks.length - blockers.length, blockers: blockers.length },
  checks,
  manualEvidence: [
    'Create one Razorpay sandbox order and save appOrderId/providerOrderId proof.',
    'Verify valid signature upgrades plan and invalid signature returns 401.',
    'Replay webhook success/failure and save 200/401 evidence.',
    'Upload one safe test PDF/JPG to the private Supabase bucket and verify signed download works.',
    'Confirm no service-role key, webhook secret or signed URL appears in browser source/logs.'
  ]
}
const reportPath = path.join(outDir, 'payment-storage-readiness.json')
writeFileSync(reportPath, JSON.stringify(report, null, 2))
for (const item of checks) console.log(`${item.ok ? '✅' : '❌'} ${item.area}: ${item.id} (${item.status})`)
console.log(`\nPayment/storage readiness report saved to ${reportPath}`)
if (blockers.length && process.env.STRICT_LAUNCH_QA === 'true') process.exit(1)
