export type InteractionChannel = 'phone-call' | 'office-visit' | 'service-center' | 'email-chat' | 'bank-branch' | 'courier-pickup'
export type InteractionMood = 'helpful' | 'neutral' | 'delayed' | 'rude' | 'refused'
export type FollowUpUrgency = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type InteractionChannelConfig = {
  id: InteractionChannel
  label: string
  proofHint: string
  nextStepHint: string
}

export type CallVisitLogbookInput = {
  issueTitle: string
  channel: InteractionChannel | string
  interactionDate: string
  contactName: string
  referenceId: string
  outcome: string
  promisedDate: string
  mood: InteractionMood | string
}

export type CallVisitLogbookPlan = {
  channel: InteractionChannelConfig
  headline: string
  urgency: FollowUpUrgency
  interactionDate: string
  promisedDateLabel: string
  nextFollowUpDate: string
  logSummary: string
  proofChecklist: string[]
  nextActions: string[]
  followUpMessage: string
  safetyWarnings: string[]
}

export const interactionChannels: InteractionChannelConfig[] = [
  {
    id: 'phone-call',
    label: 'Phone call / helpline',
    proofHint: 'Call time, phone number, ticket/reference ID, agent name if given, and screenshot of call log.',
    nextStepHint: 'Send a written follow-up by email/support chat if there is no update.'
  },
  {
    id: 'office-visit',
    label: 'Office / government counter visit',
    proofHint: 'Visit date, office name, counter number, token slip, acknowledgement receipt and notice-board photo if allowed.',
    nextStepHint: 'Ask for written acknowledgement or official status route.'
  },
  {
    id: 'service-center',
    label: 'Service center visit',
    proofHint: 'Job sheet, device/item photo, warranty card, invoice, service center stamp and promised delivery date.',
    nextStepHint: 'Request job sheet update and escalation email if repair is delayed.'
  },
  {
    id: 'email-chat',
    label: 'Email / support chat',
    proofHint: 'Email thread, chat transcript, ticket ID, attachment proof and timestamp screenshot.',
    nextStepHint: 'Reply on the same thread with a clear deadline and proof list.'
  },
  {
    id: 'bank-branch',
    label: 'Bank branch / payment desk',
    proofHint: 'Branch name, visit token, complaint number, debit/transaction reference and written acknowledgement.',
    nextStepHint: 'Escalate to bank grievance/ombudsman route only after official waiting period.'
  },
  {
    id: 'courier-pickup',
    label: 'Courier / pickup / delivery agent',
    proofHint: 'Tracking ID, agent call log, pickup slip, package photos and delivery status screenshot.',
    nextStepHint: 'Ask support for written confirmation of pickup/refund timeline.'
  }
]

const fallbackChannel = interactionChannels[0]
const secretPattern = /(otp|password|upi\s*pin|cvv|full\s*card|full\s*bank|aadhaar\s*number|pan\s*number)/i

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function formatLogbookDate(value: string) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

export function getInteractionChannel(channelId: string) {
  return interactionChannels.find((item) => item.id === channelId) || fallbackChannel
}

export function getFollowUpUrgency(input: CallVisitLogbookInput): FollowUpUrgency {
  const outcome = `${input.outcome} ${input.mood}`.toLowerCase()
  const promised = input.promisedDate ? new Date(input.promisedDate) : null
  const today = new Date()
  if (secretPattern.test(outcome)) return 'URGENT'
  if (promised && !Number.isNaN(promised.getTime()) && promised.getTime() < today.getTime()) return 'HIGH'
  if (/(refused|rude|no update|ignored|fraud|scam|threat|harassment|delay)/i.test(outcome)) return 'HIGH'
  if (/(delayed|pending|wait|callback|tomorrow|next week)/i.test(outcome)) return 'NORMAL'
  return 'LOW'
}

export function buildCallVisitLogbookPlan(input: CallVisitLogbookInput): CallVisitLogbookPlan {
  const channel = getInteractionChannel(String(input.channel || 'phone-call'))
  const interactionDate = formatLogbookDate(input.interactionDate)
  const baseDate = new Date(interactionDate)
  const promisedDate = input.promisedDate ? formatLogbookDate(input.promisedDate) : ''
  const urgency = getFollowUpUrgency(input)
  const nextFollowUpDate = promisedDate || formatLogbookDate(addDays(baseDate, urgency === 'HIGH' || urgency === 'URGENT' ? 1 : urgency === 'NORMAL' ? 3 : 7).toISOString())
  const issue = input.issueTitle?.trim() || 'my pending issue'
  const reference = input.referenceId?.trim() || 'not provided'
  const contact = input.contactName?.trim() || 'support/official staff'
  const outcome = input.outcome?.trim() || 'I contacted them and need a clear written update.'
  const mood = input.mood || 'neutral'
  const promisedDateLabel = promisedDate || 'No clear promised date given'

  const proofChecklist = [
    channel.proofHint,
    'Keep date, time, location/number/email and exact words of promise/refusal.',
    'Save screenshots/photos only if allowed and never expose private IDs publicly.',
    'Attach invoice, transaction ID, complaint number or acknowledgement where relevant.'
  ]

  const nextActions = [
    `Save this log with reference: ${reference}.`,
    `Follow up on ${nextFollowUpDate} if the issue is not resolved.`,
    channel.nextStepHint,
    urgency === 'URGENT' ? 'Do not share OTP, UPI PIN, password, CVV or remote-access app access. Contact official emergency/bank support if money or account safety is involved.' : 'Use only official contact channels for the next update.'
  ]

  const followUpMessage = `Hello, I am following up about ${issue}. I contacted via ${channel.label} on ${interactionDate}. Reference/Complaint ID: ${reference}. The person/contact was ${contact}. Outcome noted: ${outcome}. Promised date: ${promisedDateLabel}. Please provide a written update and clear resolution timeline.`

  return {
    channel,
    headline: `${channel.label} log for ${issue}`,
    urgency,
    interactionDate,
    promisedDateLabel,
    nextFollowUpDate,
    logSummary: `On ${interactionDate}, contacted ${contact} via ${channel.label}. Reference: ${reference}. Mood/status: ${mood}. Outcome: ${outcome}`,
    proofChecklist,
    nextActions,
    followUpMessage,
    safetyWarnings: [
      'Never write OTP, password, UPI PIN, CVV, full card number or full bank details in a call/visit log.',
      'For public sharing, hide phone numbers, email IDs, addresses, account IDs and private names.',
      'Prefer written acknowledgement, ticket ID or official portal status over verbal promises.'
    ]
  }
}
