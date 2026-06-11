export type VoiceReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type VoiceReadinessControl = {
  id: string
  label: string
  status: VoiceReadinessStatus
  userValue: string
  adminValue: string
  launchNote: string
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(process.env[name] || '')
}

function value(name: string, fallback = '') {
  return process.env[name] || fallback
}

function configured(name: string) {
  const current = process.env[name]
  return Boolean(current && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(current))
}

export function getVoiceInputControls(): VoiceReadinessControl[] {
  const voiceEnabled = enabled('NEXT_PUBLIC_VOICE_INPUT_ENABLED') || !process.env.NEXT_PUBLIC_VOICE_INPUT_ENABLED
  const consentRequired = enabled('VOICE_INPUT_REQUIRE_CONSENT') || !process.env.VOICE_INPUT_REQUIRE_CONSENT
  const manualFallback = enabled('VOICE_INPUT_MANUAL_FALLBACK') || !process.env.VOICE_INPUT_MANUAL_FALLBACK
  const piiMasking = enabled('VOICE_INPUT_PII_MASKING') || !process.env.VOICE_INPUT_PII_MASKING
  const ownerReady = configured('VOICE_INPUT_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER')

  return [
    {
      id: 'browser-support',
      label: 'Browser speech support fallback',
      status: voiceEnabled && manualFallback ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Voice button appears only as an assistive input helper; normal typing still works.',
      adminValue: `NEXT_PUBLIC_VOICE_INPUT_ENABLED=${value('NEXT_PUBLIC_VOICE_INPUT_ENABLED', 'true')}; VOICE_INPUT_MANUAL_FALLBACK=${value('VOICE_INPUT_MANUAL_FALLBACK', 'true')}`,
      launchNote: 'Test Chrome Android, desktop Chrome and a browser without Web Speech support. Unsupported browsers must show a safe manual typing message.'
    },
    {
      id: 'privacy-consent',
      label: 'Mic consent and privacy copy',
      status: consentRequired ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'User sees that speech is handled by the browser and can stop recording anytime.',
      adminValue: `VOICE_INPUT_REQUIRE_CONSENT=${value('VOICE_INPUT_REQUIRE_CONSENT', 'true')}`,
      launchNote: 'Do not auto-start microphone. User must tap the voice button manually.'
    },
    {
      id: 'pii-safety',
      label: 'Sensitive data warning and masking readiness',
      status: piiMasking ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'UI warns users not to speak OTP, full bank details, passwords or secret IDs.',
      adminValue: `VOICE_INPUT_PII_MASKING=${value('VOICE_INPUT_PII_MASKING', 'true')}`,
      launchNote: 'Review generated transcript before saving or sending to AI. Add server-side masking if voice transcripts become stored separately.'
    },
    {
      id: 'language-coverage',
      label: 'English/Hinglish/Hindi language hints',
      status: 'READY_TO_TEST',
      userValue: 'Voice helper supports configurable locale hints for English and Hindi-style complaint dictation.',
      adminValue: `VOICE_INPUT_DEFAULT_LOCALE=${value('VOICE_INPUT_DEFAULT_LOCALE', 'en-IN')}`,
      launchNote: 'Manually test Hindi/Hinglish pronunciation with common complaint terms before public launch.'
    },
    {
      id: 'mobile-touch',
      label: 'Mobile touch target and safe layout',
      status: 'READY_TO_TEST',
      userValue: 'Voice controls use large tap targets and never block the complaint form.',
      adminValue: 'Responsive helper is embedded inside complaint details card.',
      launchNote: 'Test with Android Chrome keyboard open, small viewport and bottom nav visible.'
    },
    {
      id: 'review-owner',
      label: 'Voice QA owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'A human owner should review bad transcripts and user confusion before scaling.',
      adminValue: `VOICE_INPUT_REVIEW_OWNER=${value('VOICE_INPUT_REVIEW_OWNER', '')}`,
      launchNote: 'Assign one owner for voice transcript quality feedback and accessibility issues.'
    }
  ]
}

export function getVoiceInputReadinessReport() {
  const controls = getVoiceInputControls()
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.26-voice-input-readiness',
    mode: value('VOICE_INPUT_MODE', 'assistive'),
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    supportedUseCases: [
      'Dictate issue description in complaint generator',
      'Append previous support communication by voice',
      'Use manual typing fallback when speech recognition is unsupported',
      'Review transcript before generating an AI complaint draft'
    ],
    safetyRules: [
      'Never auto-start microphone recording',
      'Do not ask users to speak OTP, passwords, full card/bank numbers or secret IDs',
      'Keep voice input as optional assistive UX; typing must remain fully functional',
      'Show unsupported-browser fallback instead of breaking the form',
      'Review transcript quality on real Android Chrome before public traffic'
    ],
    launchEvidence: [
      'Chrome Android voice dictation screenshot',
      'Desktop Chrome voice dictation screenshot',
      'Unsupported browser fallback screenshot',
      'Complaint form with voice-filled description screenshot',
      'Admin readiness page screenshot and local evidence JSON/CSV'
    ]
  }
}
