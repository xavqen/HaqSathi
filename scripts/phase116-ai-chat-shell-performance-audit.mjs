import { readFileSync, existsSync } from 'node:fs'

const checks = []
const pass = (name, ok) => checks.push({ name, ok })
const read = (file) => readFileSync(file, 'utf8')

const chatPage = read('app/chat/page.tsx')
const chatClient = read('components/forms/chat-assistant.tsx')
const chatRoute = read('app/api/ai/chat/route.ts')
const globals = read('app/globals.css')
const env = read('.env.example')
const pkg = JSON.parse(read('package.json'))

pass('chat page is static shell', chatPage.includes("export const dynamic = 'force-static'") && chatPage.includes('revalidate = 86400'))
pass('chat assistant is dynamically loaded with skeleton', chatPage.includes('dynamic(') && chatPage.includes('ChatAssistantLoading'))
pass('chat loading route exists', existsSync('app/chat/loading.tsx'))
pass('chat skeleton component exists', existsSync('components/forms/chat-assistant-loading.tsx'))
pass('chat client supports streaming parser', chatClient.includes('readStream') && chatClient.includes('application/x-ndjson'))
pass('chat client has abort/timeout safety', chatClient.includes('AbortController') && chatClient.includes('CHAT_TIMEOUT_MS'))
pass('chat client has retry path', chatClient.includes('Retry') && chatClient.includes('fetchJsonFallback'))
pass('chat client limits rendered messages', chatClient.includes('MAX_RENDERED_MESSAGES'))
pass('chat route supports NDJSON stream', chatRoute.includes('ReadableStream') && chatRoute.includes('application/x-ndjson'))
pass('chat route uses async rate limit', chatRoute.includes('rateLimitAsync') && chatRoute.includes('getClientIp'))
pass('chat route caches nothing', chatRoute.includes('Cache-Control') && chatRoute.includes('no-store'))
pass('chat route uses Prisma select for preference', chatRoute.includes('select: { primaryLanguage: true'))
pass('chat route has timeout guard', chatRoute.includes('withTimeout') && chatRoute.includes('AI_CHAT_TIMEOUT_MS'))
pass('chat env controls documented', env.includes('AI_CHAT_TIMEOUT_MS') && env.includes('AI_CHAT_STREAM_DELAY_MS'))
pass('chat CSS contains scroll containment', globals.includes('.chat-scroll') && globals.includes('contain: layout paint'))
pass('version is v3.0.86 or newer', (/^3\.0\.(8[6-9]|9[0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)))
pass('quality release includes phase116', pkg.scripts['quality:release']?.includes('phase116:audit'))

console.log('\nPhase 116 AI chat + shell performance audit')
let failed = 0
for (const check of checks) {
  if (check.ok) console.log(`✅ ${check.name}`)
  else {
    failed++
    console.error(`❌ ${check.name}`)
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed.`)
  process.exit(1)
}

console.log('\n✅ Phase 116 passed: chat streaming UX, retry safety, static chat shell and lightweight rendering guards are in place.\n')
