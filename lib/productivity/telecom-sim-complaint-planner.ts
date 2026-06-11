export type TelecomSimComplaintInput = {
  issueType: string
  operatorName: string
  mobileNumberMasked: string
  rechargeAmount: string
  billAmount: string
  transactionId: string
  issueDate: string
  complaintId: string
  lastResponse: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const telecomIssueTypes = [
  { id: 'recharge-failed', label: 'Recharge failed / pack not activated', focus: 'payment receipt, recharge ID, operator app screenshot and plan details', urgencyBoost: 18 },
  { id: 'wrong-deduction', label: 'Balance/data wrongly deducted', focus: 'balance before/after screenshots, pack validity, usage SMS and app history', urgencyBoost: 14 },
  { id: 'postpaid-bill', label: 'Postpaid bill overcharge', focus: 'itemized bill, previous bill, plan terms, add-on details and payment proof', urgencyBoost: 16 },
  { id: 'sim-blocked', label: 'SIM blocked / no service', focus: 'SIM status screenshot, KYC proof reference, store visit proof and outage timeline', urgencyBoost: 24 },
  { id: 'porting-mnp', label: 'Mobile number portability / porting issue', focus: 'UPC SMS, port request ID, rejection reason, bill clearance proof and operator response', urgencyBoost: 20 },
  { id: 'kyc-misuse', label: 'KYC misuse / unknown SIM concern', focus: 'official KYC reference, suspicious SMS/call proof, operator complaint ID and safety report notes', urgencyBoost: 30 },
  { id: 'network-issue', label: 'Network/data speed issue', focus: 'location, time slots, speed screenshots, outage messages and service request ID', urgencyBoost: 10 },
  { id: 'vas-deduction', label: 'VAS/add-on activated without consent', focus: 'activation SMS, deduction SMS, balance proof and consent dispute details', urgencyBoost: 18 },
  { id: 'spam-scam-call', label: 'Spam/scam call/SMS from telecom route', focus: 'caller/SMS screenshot, timestamp, link preview and report ID', urgencyBoost: 26 },
  { id: 'other', label: 'Other telecom/SIM issue', focus: 'screenshots, bill/recharge proof, complaint ID and operator response', urgencyBoost: 12 }
]

function clean(value: string | undefined, fallback = 'not provided') {
  const v = String(value || '').trim()
  return v || fallback
}

function money(value: string) {
  const numeric = Number(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(numeric) ? numeric : 0
}

function dateValue(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysSince(value: string) {
  const date = dateValue(value)
  if (!date) return null
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
}

function formatDate(value: string) {
  const date = dateValue(value)
  if (!date) return clean(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildTelecomSimComplaintPlan(input: TelecomSimComplaintInput) {
  const issue = telecomIssueTypes.find((item) => item.id === input.issueType) || telecomIssueTypes[0]
  const recharge = money(input.rechargeAmount)
  const bill = money(input.billAmount)
  const moneyAtRisk = Math.max(recharge, bill)
  const issueAge = daysSince(input.issueDate)

  let urgencyScore = 26 + issue.urgencyBoost
  if (moneyAtRisk >= 100) urgencyScore += 6
  if (moneyAtRisk >= 500) urgencyScore += 8
  if (moneyAtRisk >= 2000) urgencyScore += 10
  if (issueAge !== null && issueAge >= 2) urgencyScore += 5
  if (issueAge !== null && issueAge >= 7) urgencyScore += 8
  if (/kyc|sim|blocked|fraud|scam|spam|port|mnp|not working|no service|bill|deduct/i.test(`${issue.label} ${input.lastResponse} ${input.evidenceAvailable}`)) urgencyScore += 8
  if (String(input.evidenceAvailable || '').length > 80) urgencyScore += 3
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 80 ? 'High urgency - preserve proof and escalate through official telecom support quickly' : urgencyScore >= 60 ? 'Medium urgency - send a written complaint with screenshots and complaint ID' : 'Normal urgency - verify plan/bill details and keep a clear support record'

  const proofChecklist = [
    `Issue-specific proof: ${issue.focus}.`,
    'Account proof: masked mobile number, operator name, plan/recharge/bill details, complaint/service request ID and issue date.',
    'Payment proof: recharge receipt, UPI/card/bank transaction ID, invoice/bill PDF and refund status if any.',
    'Service proof: screenshots of app status, SMS alerts, balance/data deduction, speed test, no-service status or porting/UPC details.',
    'Communication proof: customer-care chat/email/call log, store visit note, promised timeline and escalation response.',
    'Safety copy: hide full mobile number where possible, OTP, SIM swap code, account password, UPI PIN, CVV, card PIN and full ID numbers.',
    'Use only official operator app, website, store, customer-care and official grievance routes. Avoid random refund links or remote-control apps.'
  ]

  const escalationRoute = [
    { step: 'Step 1', title: 'Confirm plan/bill/status details', action: 'Check operator app/SMS/email for recharge status, plan validity, itemized bill or service request status.' },
    { step: 'Step 2', title: 'Send written support complaint', action: 'Use the copy-ready message with masked number, issue date, transaction/bill details, complaint ID and proof list.' },
    { step: 'Step 3', title: 'Ask for timeline in writing', action: 'Request refund/activation/bill correction/porting resolution timeline and written reason if rejected.' },
    { step: 'Step 4', title: 'Escalate inside operator', action: 'If support does not resolve, escalate to operator appellate/grievance desk through official route with proof pack.' },
    { step: 'Step 5', title: 'Payment/bank route if needed', action: 'For duplicate debit, failed recharge refund or wrong charge, keep operator response and ask bank/payment app about dispute route.' }
  ]

  const safetyWarnings = [
    'Never share OTP, SIM swap/porting OTP, UPI PIN, CVV, card PIN, account password, full Aadhaar/ID number or remote screen access.',
    'Do not click refund/activation links from unknown SMS/WhatsApp messages. Open the official operator app or website yourself.',
    'For suspected SIM/KYC misuse, act fast: contact operator official support/store and preserve complaint IDs and screenshots.',
    'For threatening scam calls/SMS, keep screenshots/call logs and use official reporting channels. Do not call back suspicious premium numbers.',
    'This tool gives guidance only; verify final action through official operator, bank/payment app or relevant authority.'
  ]

  const copyReadyMessage = [
    `Subject: Telecom/SIM complaint - ${issue.label}`,
    '',
    `Dear ${clean(input.operatorName, 'Telecom Support Team')},`,
    '',
    `I request written resolution for my telecom/SIM issue. Operator: ${clean(input.operatorName)}. Masked mobile number/account: ${clean(input.mobileNumberMasked)}. Issue type: ${issue.label}. Issue date: ${formatDate(input.issueDate)}.`,
    `Recharge amount: ₹${recharge || clean(input.rechargeAmount)}. Bill amount: ₹${bill || clean(input.billAmount)}. Transaction/recharge/bill ID: ${clean(input.transactionId)}. Existing complaint ID: ${clean(input.complaintId)}.`,
    `Last response received: ${clean(input.lastResponse)}. Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please resolve the issue, share written reason/timeline, and process refund/correction/activation if applicable')}.`,
    '',
    'Please check the issue, share the official reason/status, and provide expected resolution timeline in writing. I can share redacted screenshots, bill/recharge receipt and complaint proof if required.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: issue.label,
    moneyAtRisk,
    issueAge,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    escalationRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Estimated money at risk: ₹${moneyAtRisk}. Preserve ${issue.focus} and use official operator routes only.`
  }
}
