import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const helper = exists('lib/voice/readiness.ts') ? read('lib/voice/readiness.ts') : ''
const component = exists('components/forms/voice-input-assist.tsx') ? read('components/forms/voice-input-assist.tsx') : ''
const complaint = exists('components/forms/complaint-generator.tsx') ? read('components/forms/complaint-generator.tsx') : ''
const adminPage = exists('app/admin/voice-input-readiness/page.tsx') ? read('app/admin/voice-input-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/voice-input-readiness/route.ts') ? read('app/api/admin/voice-input-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(2[6-9]|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.26+')
require(pkg.scripts['voice:readiness'] === 'node scripts/voice-input-readiness-local.mjs', 'voice:readiness script missing')
require(pkg.scripts['phase56:audit'] === 'node scripts/phase56-voice-input-audit.mjs', 'phase56:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase56:audit'), 'quality:release must include phase56 audit')
require(exists('lib/voice/readiness.ts'), 'voice readiness helper missing')
for (const token of ['getVoiceInputReadinessReport', 'getVoiceInputControls', 'VOICE_INPUT_REQUIRE_CONSENT', 'NEXT_PUBLIC_VOICE_INPUT_ENABLED', 'launchEvidence']) {
  require(helper.includes(token), `voice helper missing ${token}`)
}
require(exists('components/forms/voice-input-assist.tsx'), 'voice input assist component missing')
for (const token of ['SpeechRecognition', 'webkitSpeechRecognition', 'cleanTranscript', 'Apply to description', 'Do not speak OTP']) {
  require(component.includes(token), `voice component missing ${token}`)
}
require(complaint.includes('VoiceInputAssist') && complaint.includes('applyVoiceTranscript') && complaint.includes("form.setValue('description'"), 'complaint generator must integrate voice assist without replacing existing form')
require(exists('app/admin/voice-input-readiness/page.tsx'), 'admin voice readiness page missing')
require(adminPage.includes('Voice input readiness') && adminPage.includes('npm run voice:readiness') && adminPage.includes('/api/admin/voice-input-readiness'), 'admin voice page must show command and API')
require(exists('app/api/admin/voice-input-readiness/route.ts'), 'admin voice readiness API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getVoiceInputReadinessReport'), 'admin voice API must require admin and return report')
require(exists('scripts/voice-input-readiness-local.mjs'), 'voice readiness local script missing')
require(adminShell.includes('/admin/voice-input-readiness'), 'admin shell must link voice readiness page')
for (const key of ['VOICE_INPUT_MODE', 'NEXT_PUBLIC_VOICE_INPUT_ENABLED', 'VOICE_INPUT_REQUIRE_CONSENT', 'VOICE_INPUT_MANUAL_FALLBACK', 'VOICE_INPUT_PII_MASKING', 'VOICE_INPUT_DEFAULT_LOCALE', 'VOICE_INPUT_REVIEW_OWNER', 'VOICE_INPUT_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Voice Input Readiness'), 'launch evidence gate missing voice input readiness')
require(exists('PHASE_56_VOICE_INPUT.md'), 'Phase 56 notes missing')

console.log('\nHaqSathi Phase 56 voice input audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 56 audit passed: voice input assist, admin readiness, API, local evidence, envs and launch gate are installed.\n')
