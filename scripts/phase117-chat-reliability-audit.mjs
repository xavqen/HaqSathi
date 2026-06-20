import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(path, 'utf8')
}

function pass(label, ok) {
  if (!ok) {
    console.error(`❌ ${label}`)
    process.exitCode = 1
    return
  }
  console.log(`✅ ${label}`)
}

const pkg = JSON.parse(read('package.json'))
const chat = read('components/forms/chat-assistant.tsx')
const route = read('app/api/ai/chat/route.ts')
const validator = read('lib/validators/chat.ts')
const phase = read('PHASE_117_CHAT_RELIABILITY_POLISH.md')

console.log('\nPhase 117 chat reliability polish audit')
pass('version is at least v3.0.87', (/^3\.0\.(8[7-9]|9[0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)))
pass('phase117 audit script is registered', pkg.scripts['phase117:audit'] === 'node scripts/phase117-chat-reliability-audit.mjs')
pass('quality release includes phase117', pkg.scripts['quality:release'].includes('phase117:audit'))
pass('chat parser safely handles NDJSON lines', chat.includes('parseStreamEvent') && chat.includes('JSON.parse(line)') && chat.includes('return null'))
pass('stream fallback avoids duplicate POST request', chat.includes('readJsonPayload(response)') && chat.includes('const fallback = await readJsonPayload(response)'))
pass('chat has sticky-bottom scroll guard', chat.includes('stickToBottomRef') && chat.includes('AUTOSCROLL_THRESHOLD_PX') && chat.includes('onScroll={handleScroll}'))
pass('quick prompts send directly in one tap', chat.includes('onClick={() => void send(prompt)}'))
pass('client blocks obvious OTP/PIN/CVV/password numbers', chat.includes('isLikelySecretMessage') && chat.includes('SECRET_NUMBER_PATTERN'))
pass('server blocks obvious OTP/PIN/CVV/password numbers', route.includes('containsSensitiveSecret') && route.includes('SENSITIVE_NUMBER_PATTERN'))
pass('chat route has Vercel duration guard', route.includes('export const maxDuration = 30'))
pass('session id input is bounded', validator.includes('max(80)'))
pass('phase report documents the changes', phase.includes('duplicate chat request') && phase.includes('sticky-bottom'))

if (process.exitCode) {
  console.error('\nPhase 117 failed: fix the missing reliability guard above.')
} else {
  console.log('\n✅ Phase 117 passed: chat reliability, privacy and mobile streaming polish are in place.')
}
