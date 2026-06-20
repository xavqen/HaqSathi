import type { ComplaintOutput } from '@/lib/validators/complaint'
import { isLikelyUpiFraudText, upiFraudEscalationActions, upiFraudEscalationNote } from '@/lib/safety/fraud-escalation'

export type AiSafetyReview = {
  ok: boolean
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  reminders: string[]
  redactedInput?: string
}

const SECRET_PATTERNS: Array<{ id: string; pattern: RegExp; replacement: string }> = [
  { id: 'otp', pattern: /\b(otp|one[-\s]?time password)\s*(?:number|code)?\s*[:=\-]?\s*[A-Za-z0-9]{3,8}\b/gi, replacement: '$1: [hidden]' },
  { id: 'upi-pin', pattern: /\b(upi\s*pin|pin)\s*[:=\-]?\s*\d{3,8}\b/gi, replacement: '$1: [hidden]' },
  { id: 'cvv', pattern: /\b(cvv|cvc)\s*[:=\-]?\s*\d{3,4}\b/gi, replacement: '$1: [hidden]' },
  { id: 'password', pattern: /\b(password|passcode)\s*[:=\-]?\s*[^\s,;]{4,32}\b/gi, replacement: '$1: [hidden]' },
  { id: 'card-number', pattern: /\b(?:\d[ -]?){13,19}\b/g, replacement: '[card number hidden]' }
]

const GUARANTEE_PATTERNS = [
  /guarantee(?:d)?\s+(refund|approval|win|success|compensation)/i,
  /100%\s+(refund|approval|success|guarantee)/i,
  /definitely\s+(get|win|receive|approve)/i
]

export function redactSensitiveText(text: string) {
  return SECRET_PATTERNS.reduce((value, item) => value.replace(item.pattern, item.replacement), text)
}

export function detectSensitiveText(text: string) {
  const normalized = text.replace(/\s+/g, ' ')
  return SECRET_PATTERNS.filter((item) => {
    item.pattern.lastIndex = 0
    return item.pattern.test(normalized)
  }).map((item) => item.id)
}

function reviewTextBlock(label: string, text: string, flags: string[]) {
  if (GUARANTEE_PATTERNS.some((pattern) => pattern.test(text))) flags.push(`${label}: guarantee language`)
  if (/https?:\/\/(?![^\s]+\.(gov\.in|nic\.in|rbi\.org\.in|npci\.org\.in|consumerhelpline\.gov\.in|cybercrime\.gov\.in)\b)/i.test(text)) flags.push(`${label}: non-official link present`)
  if (/\b(otp|upi\s*pin|cvv|password|passcode)\b/i.test(text)) flags.push(`${label}: secret mention present`)
}

export function reviewAiOutput(output: ComplaintOutput, sourceText = ''): AiSafetyReview {
  const flags: string[] = []
  const reminders = ['Verify final action on the official portal, bank/app support or a qualified professional before submitting.']
  const combinedOutput = Object.values(output).flat().join('\n')
  reviewTextBlock('complaint draft', combinedOutput, flags)
  if (isLikelyUpiFraudText(`${sourceText}\n${combinedOutput}`)) reminders.unshift(upiFraudEscalationNote)
  const riskLevel = flags.length >= 2 ? 'high' : flags.length === 1 ? 'medium' : 'low'
  return { ok: riskLevel !== 'high', riskLevel, flags, reminders, redactedInput: redactSensitiveText(sourceText) }
}

export function hardenComplaintOutput(output: ComplaintOutput, sourceText = ''): ComplaintOutput {
  const redacted: ComplaintOutput = {
    shortComplaint: redactSensitiveText(output.shortComplaint),
    formalEmail: redactSensitiveText(output.formalEmail),
    consumerHelplineFormat: redactSensitiveText(output.consumerHelplineFormat),
    companySupportMessage: redactSensitiveText(output.companySupportMessage),
    followUpMessage: redactSensitiveText(output.followUpMessage),
    legalNoticeStyleDraft: redactSensitiveText(output.legalNoticeStyleDraft),
    checklist: output.checklist.map(redactSensitiveText),
    nextSteps: output.nextSteps.map(redactSensitiveText),
    disclaimer: redactSensitiveText(output.disclaimer)
  }

  if (isLikelyUpiFraudText(`${sourceText}\n${Object.values(redacted).flat().join('\n')}`)) {
    const missingActions = upiFraudEscalationActions.filter((action) => !redacted.nextSteps.some((step) => step.includes(action.split(':')[0])))
    redacted.nextSteps = [...missingActions, ...redacted.nextSteps].slice(0, 10)
    if (!redacted.disclaimer.includes('1930')) redacted.disclaimer = `${upiFraudEscalationNote} ${redacted.disclaimer}`
  }

  return redacted
}
