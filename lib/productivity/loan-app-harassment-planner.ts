export type LoanAppHarassmentInput = {
  issueType: string
  appOrLenderName: string
  amountBorrowed: string
  amountDemanded: string
  dueDate: string
  firstHarassmentDate: string
  contactMethod: string
  cityState: string
  harassmentSummary: string
  evidenceAvailable: string
  desiredOutcome: string
  extraNotes: string
}

export const loanAppIssueTypes = [
  { id: 'harassment-calls', label: 'Harassment calls/messages', proofFocus: 'call logs, SMS/WhatsApp screenshots, numbers used, time/date pattern', urgencyBoost: 25 },
  { id: 'contact-list-threat', label: 'Contact list / family threat', proofFocus: 'threat screenshots, app permission screenshots, contact/family message proof', urgencyBoost: 35 },
  { id: 'fake-legal-threat', label: 'Fake legal/police threat', proofFocus: 'threat text, caller number, fake notice screenshot, payment demand proof', urgencyBoost: 30 },
  { id: 'overcharging', label: 'High fees / overcharging', proofFocus: 'loan agreement screenshot, disbursal amount, repayment demand, fee breakup', urgencyBoost: 15 },
  { id: 'privacy-misuse', label: 'Photo/contact/privacy misuse', proofFocus: 'privacy abuse screenshot, edited image/message proof, app permissions, account details', urgencyBoost: 40 },
  { id: 'paid-but-demanding', label: 'Paid but still demanding', proofFocus: 'UPI/bank payment proof, receipt, lender acknowledgement and latest demand', urgencyBoost: 20 },
  { id: 'other', label: 'Other loan/app issue', proofFocus: 'written communication, payment proof, app screenshots and timeline', urgencyBoost: 10 }
]

function clean(value: string | undefined, fallback = 'not provided') {
  const v = String(value || '').trim()
  return v || fallback
}

function numberFrom(value: string) {
  const n = Number(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function daysSince(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
}

function formatDate(value: string) {
  if (!value) return 'not provided'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildLoanAppHarassmentPlan(input: LoanAppHarassmentInput) {
  const issue = loanAppIssueTypes.find((item) => item.id === input.issueType) || loanAppIssueTypes[0]
  const borrowed = numberFrom(input.amountBorrowed)
  const demanded = numberFrom(input.amountDemanded)
  const harassmentAgeDays = daysSince(input.firstHarassmentDate)
  const dueAgeDays = daysSince(input.dueDate)
  const overDemand = borrowed > 0 && demanded > borrowed ? demanded - borrowed : 0

  let riskScore = 35 + issue.urgencyBoost
  if (String(input.harassmentSummary || '').length > 120) riskScore += 10
  if (/family|contact|photo|morph|police|arrest|legal|suicide|abuse|threat/i.test(input.harassmentSummary || '')) riskScore += 20
  if (overDemand > 0) riskScore += 10
  if ((harassmentAgeDays ?? 99) <= 3) riskScore += 10
  riskScore = Math.min(100, riskScore)

  const urgencyLevel = riskScore >= 85 ? 'High risk - preserve proof and use official help channels' : riskScore >= 65 ? 'Medium risk - document proof and escalate carefully' : 'Low/medium risk - organize proof and communicate in writing'

  const proofChecklist = [
    `Issue-specific proof: ${issue.proofFocus}.`,
    'Loan app name, lender/NBFC name if visible, loan ID/reference, disbursal amount and repayment demand screenshot.',
    'Call log screenshots showing repeated calls, dates, times and phone numbers. Do not call back unknown numbers from public screenshots.',
    'SMS/WhatsApp/chat screenshots showing threat, abuse, fake legal warning, contact-list threat or payment demand.',
    'Payment proof: UPI/bank receipt, transaction ID, date and amount paid. Hide full UPI ID/account/card data before sharing publicly.',
    'App permission screenshots if contact/photo/storage misuse is suspected.',
    'A short timeline: loan date, first harassment date, payment date if any, latest threat date and support/grievance messages.'
  ]

  const escalationPlan = [
    { step: 'Step 1', target: 'Stop sharing secrets', action: 'Do not share OTP, UPI PIN, CVV, password, screen access, Aadhaar/PAN copies or contact-list data with callers.' },
    { step: 'Step 2', target: 'Preserve proof', action: 'Save screenshots, call logs, numbers, payment proof and app details in a separate folder before blocking/reporting.' },
    { step: 'Step 3', target: 'Use written communication', action: 'Ask the app/lender in writing for loan breakup, amount due, payment proof update and harassment stop confirmation.' },
    { step: 'Step 4', target: 'Official complaint route', action: 'For threats, privacy misuse, abusive recovery or fake legal/police threats, use official cybercrime/police/consumer/RBI-style channels as applicable.' },
    { step: 'Step 5', target: 'Emergency safety', action: 'If there are physical threats, blackmail, self-harm pressure or family harassment, contact trusted adults/local authorities/emergency support immediately.' }
  ]

  const safetyWarnings = [
    'This tool is guidance only. It does not provide legal/financial advice or guarantee recovery/relief.',
    'Do not share OTP, UPI PIN, CVV, net-banking password, screen-share access, full ID documents, contact list or private photos with any recovery caller.',
    'Do not post full phone numbers, addresses, Aadhaar/PAN, bank details, family contacts or private images publicly. Redact first.',
    'Preserve original evidence. Do not edit or fabricate screenshots, call logs, receipts or messages.',
    'For immediate threats, blackmail, extortion or safety risk, use official emergency/local authority/cybercrime channels quickly.'
  ]

  const copyReadyMessage = [
    `Subject: Request to stop harassment and provide written loan/payment clarification - ${issue.label}`,
    '',
    `Dear ${clean(input.appOrLenderName, 'Loan App / Lender Support Team')},`,
    '',
    `I am writing regarding ${issue.label.toLowerCase()}.`,
    `App/Lender name: ${clean(input.appOrLenderName)}. City/State: ${clean(input.cityState)}. Contact method used by recovery side: ${clean(input.contactMethod)}.`,
    `Amount borrowed: ₹${clean(input.amountBorrowed)}. Amount demanded: ₹${clean(input.amountDemanded)}. Due date: ${formatDate(input.dueDate)}. First harassment date: ${formatDate(input.firstHarassmentDate)}.`,
    `Issue summary: ${clean(input.harassmentSummary)}.`,
    `Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please stop harassment, share written amount breakup, update payment status and communicate only through lawful official channels')}.`,
    `Extra notes: ${clean(input.extraNotes, 'not provided')}.`,
    '',
    'Please provide a written response with the valid loan reference, principal amount, fees/charges breakup, payment history, pending amount if any, and confirmation that abusive calls/messages/contact-list harassment will stop immediately.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: issue.label,
    urgencyLevel,
    riskScore,
    borrowed,
    demanded,
    overDemand,
    harassmentAgeDays,
    dueAgeDays,
    proofChecklist,
    escalationPlan,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Keep proof safe, avoid secret sharing and use official complaint routes for threats/privacy misuse.`
  }
}
