import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.QA_EVIDENCE_DIR || './artifacts/production-qa'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const version = JSON.parse(await import('node:fs').then(({ readFileSync }) => readFileSync('package.json', 'utf8'))).version
const now = new Date().toISOString()

const gates = [
  ['P0','Clean install build','npm ci && npm run db:generate && npm run release:typecheck && npm run build','Terminal/CI log'],
  ['P0','Vercel runtime QA','Open production URL, /api/health, /api/ready, sitemap and robots','Vercel URL + screenshots'],
  ['P0','Razorpay lifecycle','Successful + failed test payment and webhook verification','Event IDs + DB rows'],
  ['P0','Resend delivery','Register, verify email, forgot password and test email','Inbox screenshots + EmailLog'],
  ['P0','Supabase Storage vault','Upload/download/deny cross-user access','Self-test JSON + metadata row'],
  ['P0','Security abuse check','CSRF, rate limit, headers and env exposure checks','Blocked request + header proof'],
  ['P1','Official link review','Verify every public source URL and notes','Reviewer CSV + screenshots'],
  ['P1','Translation review','Review priority pages/locales','Reviewer CSV + screenshots'],
  ['P1','Playwright production','E2E_BASE_URL=https://domain npm run test:e2e','Playwright report'],
  ['P1','Lighthouse production','LIGHTHOUSE_BASE_URL=https://domain npm run lighthouse:local','Lighthouse report']
]

const envKeys = [
  'NEXT_PUBLIC_APP_URL','VERCEL_PRODUCTION_URL','DATABASE_URL','DIRECT_URL','AUTH_SECRET','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY','RESEND_FROM_EMAIL','RESEND_TEST_TO_EMAIL','RAZORPAY_KEY_ID','NEXT_PUBLIC_RAZORPAY_KEY_ID','RAZORPAY_WEBHOOK_SECRET','RAZORPAY_WEBHOOK_URL',
  'NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_STORAGE_BUCKET','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN',
  'E2E_BASE_URL','LIGHTHOUSE_BASE_URL','OFFICIAL_LINK_REVIEWER','TRANSLATION_REVIEWER'
]

function clean(value = '') {
  if (!value) return 'MISSING'
  if (/change-this|PROJECT_REF|YOUR-PASSWORD|haqsathi\.local|YOUR-VERCEL-DOMAIN/i.test(value)) return 'PLACEHOLDER'
  return 'SET'
}

const envRows = envKeys.map((key) => ({ key, status: clean(process.env[key]) }))
const checklistMd = `# HaqSathi AI Production QA Evidence Pack\n\nGenerated: ${now}\nVersion: ${version}\n\n## Go/No-Go Gates\n\n| Priority | Gate | Command / Action | Evidence to save | Result | Notes |\n|---|---|---|---|---|---|\n${gates.map((row) => `| ${row[0]} | ${row[1]} | \`${row[2]}\` | ${row[3]} | TODO | TODO |`).join('\n')}\n\n## Final rule\n\nDo not send SEO/ads/social traffic until all P0 gates are PASS and every P1 gate has either PASS or a written risk acceptance note.\n`
writeFileSync(join(outDir, 'launch-evidence-checklist.md'), checklistMd)

const envCsv = ['key,status', ...envRows.map((row) => `${row.key},${row.status}`)].join('\n')
writeFileSync(join(outDir, 'env-readiness.csv'), envCsv)
writeFileSync(join(outDir, 'env-readiness.json'), JSON.stringify({ generatedAt: now, version, env: envRows }, null, 2))

const translationCsv = [
  'page,priority,locales,reviewer,status,notes',
  '/,P0,"ENGLISH;HINGLISH;HINDI",,TODO,',
  '/complaint,P0,"ENGLISH;HINGLISH;HINDI",,TODO,',
  '/upi-help,P0,"ENGLISH;HINGLISH;HINDI",,TODO,',
  '/scheme-finder,P1,"ENGLISH;HINGLISH;HINDI;BENGALI;MARATHI",,TODO,',
  '/documents,P1,"ENGLISH;HINGLISH;HINDI",,TODO,',
  '/pricing,P1,"ENGLISH;HINGLISH;HINDI",,TODO,',
  '/privacy,P1,"ENGLISH;HINGLISH;HINDI",,TODO,',
  '/tools/scam-radar,P1,"ENGLISH;HINGLISH;HINDI",,TODO,'
].join('\n')
writeFileSync(join(outDir, 'translation-review-priority.csv'), translationCsv)

const linkCsv = [
  'source,url,category,reviewer,status,notes',
  'National Consumer Helpline,https://consumerhelpline.gov.in/,consumer,,TODO,',
  'e-Jagriti,https://e-jagriti.gov.in/,consumer,,TODO,',
  'Cyber Crime Portal,https://cybercrime.gov.in/,cyber,,TODO,',
  'RBI CMS,https://cms.rbi.org.in/,banking,,TODO,',
  'NPCI UPI Complaint,https://www.npci.org.in/upi-complaint,upi,,TODO,',
  'National Scholarship Portal,https://scholarships.gov.in/,scholarship,,TODO,',
  'UIDAI,https://uidai.gov.in/,documents,,TODO,',
  'DigiLocker,https://www.digilocker.gov.in/,documents,,TODO,'
].join('\n')
writeFileSync(join(outDir, 'official-link-review.csv'), linkCsv)

console.log('\nHaqSathi production QA pack generated')
console.log(`Output: ${outDir}`)
console.log('Files: launch-evidence-checklist.md, env-readiness.csv/json, translation-review-priority.csv, official-link-review.csv\n')
