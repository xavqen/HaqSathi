export type UtilityBillInput = {
  providerName: string
  consumerId: string
  billType: string
  billMonth: string
  billAmount: string
  usualAmount: string
  dueDate: string
  issueType: string
  meterReading: string
  previousComplaintId: string
  desiredResolution: string
  userNotes: string
}

export type UtilityBillIssueType = 'high_bill' | 'wrong_meter_reading' | 'duplicate_bill' | 'payment_not_updated' | 'late_fee' | 'service_outage' | 'wrong_plan' | 'other'

export const utilityBillTypes = [
  'Electricity',
  'Water',
  'Piped gas',
  'Mobile postpaid',
  'Broadband / Wi-Fi',
  'DTH / cable',
  'Municipal / property utility',
  'Other utility'
]

export const utilityBillIssueTypes: { id: UtilityBillIssueType; label: string; proofFocus: string }[] = [
  { id: 'high_bill', label: 'Unusually high bill', proofFocus: 'current bill, previous bills, meter photo and usage comparison' },
  { id: 'wrong_meter_reading', label: 'Wrong meter reading', proofFocus: 'clear meter photo/video, bill reading and reading date proof' },
  { id: 'duplicate_bill', label: 'Duplicate / repeated bill', proofFocus: 'both bills, payment proof and billing period screenshots' },
  { id: 'payment_not_updated', label: 'Payment not updated', proofFocus: 'payment receipt, UTR/reference ID and account/bill screenshot' },
  { id: 'late_fee', label: 'Wrong late fee / penalty', proofFocus: 'due date proof, payment date proof and penalty line item' },
  { id: 'service_outage', label: 'Service outage but charged', proofFocus: 'outage dates, complaint IDs, downtime proof and bill period' },
  { id: 'wrong_plan', label: 'Wrong plan / tariff charged', proofFocus: 'plan screenshot, tariff promise, bill line items and support chat' },
  { id: 'other', label: 'Other bill issue', proofFocus: 'bill copy, timeline, proof screenshots and support response' }
]

function clean(value: string, fallback: string) {
  return (value || fallback).trim().replace(/\s+/g, ' ')
}

function money(value: string) {
  const n = Number.parseFloat((value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

function safeDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(date: Date | null) {
  if (!date) return 'Not provided'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(date: Date | null) {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function issueConfig(issueType: string) {
  return utilityBillIssueTypes.find((item) => item.id === issueType) || utilityBillIssueTypes[utilityBillIssueTypes.length - 1]
}

function urgency(daysLeft: number | null, issueType: string, overcharge: number | null) {
  if (issueType === 'service_outage') return 'SERVICE CONTINUITY ISSUE'
  if (daysLeft !== null && daysLeft < 0) return 'DUE DATE PASSED - ACT FAST'
  if (daysLeft !== null && daysLeft <= 2) return 'URGENT BEFORE DUE DATE'
  if (overcharge !== null && overcharge >= 1000) return 'HIGH VALUE DISPUTE'
  return 'REVIEW AND FILE COMPLAINT'
}

export function buildUtilityBillDisputePlan(input: UtilityBillInput) {
  const current = money(input.billAmount)
  const usual = money(input.usualAmount)
  const overcharge = current !== null && usual !== null ? Math.max(0, current - usual) : null
  const dueDate = safeDate(input.dueDate)
  const dueInDays = daysUntil(dueDate)
  const selectedIssue = issueConfig(input.issueType)
  const urgencyLevel = urgency(dueInDays, selectedIssue.id, overcharge)
  const billType = clean(input.billType, 'Utility')

  const proofStrengthInputs = [
    input.providerName,
    input.consumerId,
    input.billMonth,
    input.billAmount,
    input.usualAmount,
    input.dueDate,
    input.meterReading,
    input.previousComplaintId
  ].filter(Boolean).length

  const proofChecklist = [
    'Current bill PDF/screenshot showing provider, consumer/account ID, billing period, due date and amount.',
    'Previous 2-3 bills or usage history to show normal average amount.',
    `Issue proof: ${selectedIssue.proofFocus}.`,
    'Payment receipt/UTR/reference ID if payment was made but not updated.',
    'Meter photo/video with date/time proof if meter reading is disputed.',
    'Previous complaint/ticket ID and support chat/call notes if already reported.',
    'Redacted sharing copy with phone, address, account ID and payment details hidden where possible.'
  ]

  const escalationPlan = [
    { step: 'Step 1', target: 'Provider support', action: 'Raise complaint through official app/website/helpline and save ticket ID.' },
    { step: 'Step 2', target: 'Billing department / nodal officer', action: 'Send bill, previous usage, meter/payment proof and desired correction.' },
    { step: 'Step 3', target: 'Payment route', action: 'If payment is not updated, share receipt/UTR only through official support channel.' },
    { step: 'Step 4', target: 'Regulator / grievance route', action: 'Use official regulator/consumer grievance route only after provider response or no-response period.' },
    { step: 'Step 5', target: 'Evidence pack', action: 'Prepare concise timeline, proof index and copy of all replies before escalation.' }
  ]

  const safetyWarnings = [
    'Use only official provider app, website, bill desk, verified helpline or written office counter receipt.',
    'Never share OTP, UPI PIN, card CVV, net-banking password, screen-sharing access or full bank/card details for bill correction/refund.',
    'Before public posting, hide consumer ID, address, phone, QR code, full transaction ID and payment details.',
    'For disconnection risk, check official due date, minimum payment/under-protest option and provider policy before delaying payment.'
  ]

  const copyReadyMessage = [
    `Subject: ${billType} bill dispute - ${clean(input.providerName, 'Provider')} - ${clean(input.consumerId, 'Consumer ID not provided')}`,
    '',
    `Dear ${clean(input.providerName, 'Support Team')},`,
    '',
    `I am raising a billing dispute for ${billType}. Consumer/account ID: ${clean(input.consumerId, 'not provided')}.`,
    `Billing month/period: ${clean(input.billMonth, 'not provided')}. Current bill amount: ₹${clean(input.billAmount, 'not provided')}. Usual bill amount: ₹${clean(input.usualAmount, 'not provided')}.`,
    `Issue type: ${selectedIssue.label}. Due date: ${formatDate(dueDate)}. Urgency: ${urgencyLevel}.`,
    `Meter reading / usage detail: ${clean(input.meterReading, 'not provided')}.`,
    `Previous complaint ID: ${clean(input.previousComplaintId, 'not provided')}.`,
    `Requested resolution: ${clean(input.desiredResolution, 'please verify the bill, correct wrong charges and confirm the updated payable amount in writing')}.`,
    `Notes: ${clean(input.userNotes, 'proof attached')}.`,
    '',
    'Please register this complaint, share the official ticket/reference number, and provide a written bill-wise explanation/correction timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: selectedIssue.label,
    billType,
    estimatedOvercharge: overcharge,
    dueDate: formatDate(dueDate),
    dueInDays,
    urgencyLevel,
    proofStrengthScore: Math.min(100, Math.round((proofStrengthInputs / 8) * 100)),
    proofChecklist,
    escalationPlan,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}: ${selectedIssue.label}. Keep bill, previous usage, meter/payment proof and official complaint ID ready.`
  }
}
