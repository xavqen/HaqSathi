export type MedicalBillPlannerInput = {
  providerType: string
  issueType: string
  providerName: string
  patientName: string
  billNumber: string
  serviceDate: string
  billDate: string
  totalBillAmount: string
  amountPaid: string
  disputedAmount: string
  insuranceOrTpa: string
  estimateOrPackage: string
  providerResponse: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const medicalProviderTypes = [
  { id: 'hospital', label: 'Hospital / nursing home', proofFocus: 'final bill, estimate, discharge summary, deposit receipts, doctor note and itemized breakup', urgencyBoost: 24 },
  { id: 'clinic', label: 'Clinic / doctor consultation', proofFocus: 'consultation receipt, prescription, appointment proof and payment proof', urgencyBoost: 14 },
  { id: 'diagnostic-lab', label: 'Diagnostic lab / scan center', proofFocus: 'test booking, lab receipt, report delivery proof, rate card and payment proof', urgencyBoost: 16 },
  { id: 'pharmacy', label: 'Pharmacy / medicine bill', proofFocus: 'medicine bill, prescription, batch/expiry photo, payment proof and return/complaint proof', urgencyBoost: 12 },
  { id: 'ambulance', label: 'Ambulance / emergency transport', proofFocus: 'ambulance receipt, distance/time details, hospital entry proof and payment proof', urgencyBoost: 18 },
  { id: 'insurance-cashless', label: 'Insurance cashless / TPA', proofFocus: 'policy details, pre-auth request, denial/approval letter, hospital bill and TPA communication', urgencyBoost: 22 },
  { id: 'insurance-reimbursement', label: 'Insurance reimbursement', proofFocus: 'claim form, policy, final bill, payment proof, discharge documents and claim status', urgencyBoost: 20 },
  { id: 'telemedicine', label: 'Telemedicine / online health service', proofFocus: 'booking invoice, chat/call record, prescription, refund policy and payment proof', urgencyBoost: 12 },
  { id: 'other', label: 'Other medical billing issue', proofFocus: 'bill, receipt, written quote, service proof, provider response and payment proof', urgencyBoost: 12 }
]

export const medicalBillIssueTypes = [
  'Overcharged compared to estimate/package',
  'Duplicate charge or double payment',
  'Wrong item/service added in bill',
  'Deposit refund delayed',
  'No proper bill or receipt given',
  'Insurance/TPA cashless denied or delayed',
  'Insurance reimbursement delayed or short paid',
  'Medicine/test/service not provided but charged',
  'Package inclusions excluded unexpectedly',
  'Emergency/ambulance charge disputed',
  'Other medical bill dispute'
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

export function buildMedicalBillDisputePlan(input: MedicalBillPlannerInput) {
  const provider = medicalProviderTypes.find((item) => item.id === input.providerType) || medicalProviderTypes[0]
  const total = money(input.totalBillAmount)
  const paid = money(input.amountPaid)
  const disputed = money(input.disputedAmount) || Math.max(0, total - paid)
  const billAge = daysSince(input.billDate || input.serviceDate)

  let urgencyScore = 28 + provider.urgencyBoost
  if (disputed >= 1000) urgencyScore += 8
  if (disputed >= 10000) urgencyScore += 12
  if (disputed >= 50000) urgencyScore += 12
  if (billAge !== null && billAge >= 7) urgencyScore += 8
  if (billAge !== null && billAge >= 30) urgencyScore += 10
  if (/insurance|cashless|tpa|emergency|deposit|duplicate|receipt|overcharge|wrong item|not provided/i.test(`${input.issueType} ${input.providerResponse} ${input.estimateOrPackage}`)) urgencyScore += 10
  if (String(input.evidenceAvailable || '').length > 80) urgencyScore += 4
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 80 ? 'High urgency - ask for itemized breakup and written billing resolution' : urgencyScore >= 60 ? 'Medium urgency - organize proof and send a clear billing dispute request' : 'Normal urgency - verify bill details and keep written records'

  const proofChecklist = [
    `Provider proof: ${provider.proofFocus}.`,
    'Bill proof: final bill, itemized bill, estimate/package quote, admission/discharge or service record and all payment receipts.',
    'Payment proof: UPI/card/bank transaction ID, deposit receipts, refund status, TPA/insurance claim number and payment screenshots.',
    'Medical/billing context: prescription, test order, medicine details, report date, service date and any package inclusion/exclusion proof.',
    'Communication proof: billing desk response, email/chat/call log, complaint number, insurance/TPA response and promised timeline.',
    'Redacted sharing copy: hide full health ID, policy full number, card number, CVV, OTP, UPI PIN, password, full bank account and unnecessary medical history.',
    'Keep originals safe and share copies only through official provider, insurer, TPA or payment-app channels.'
  ]

  const escalationRoute = [
    { step: 'Step 1', title: 'Ask for itemized breakup', action: 'Request written item-wise bill breakup with estimate/package comparison and reason for each disputed charge.' },
    { step: 'Step 2', title: 'Submit billing dispute in writing', action: 'Send the copy-ready message with bill number, service date, total amount, paid amount, disputed amount and proof list.' },
    { step: 'Step 3', title: 'Insurance/TPA route if involved', action: 'If insurance is involved, ask hospital/TPA/insurer for pre-auth, denial, deduction or settlement reason in writing.' },
    { step: 'Step 4', title: 'Escalate to nodal/grievance desk', action: 'If billing desk does not resolve, escalate to hospital/provider grievance desk or insurer grievance/nodal route with proof pack.' },
    { step: 'Step 5', title: 'Payment dispute only when valid', action: 'For duplicate payment, failed refund or wrong debit, ask bank/payment app about dispute route with receipts and provider response.' }
  ]

  const safetyWarnings = [
    'Guidance only. This tool does not provide medical, legal, insurance or financial advice.',
    'Do not share OTP, CVV, UPI PIN, card PIN, passwords, full policy number, full bank account or remote screen-share access for refund/claim.',
    'Do not alter medical records, prescriptions or bills. False claims can weaken your case.',
    'For urgent treatment or health risk, prioritize medical care and speak with qualified healthcare professionals.',
    'Share medical documents only with official provider, insurer, TPA or required authority, and redact unnecessary private details when possible.'
  ]

  const copyReadyMessage = [
    `Subject: Medical bill dispute / clarification request - ${clean(input.billNumber, 'Bill number not provided')}`,
    '',
    `Dear ${clean(input.providerName, 'Billing/Support Team')},`,
    '',
    `I request a written clarification and resolution for a billing issue related to ${provider.label.toLowerCase()}.`,
    `Patient/name on record: ${clean(input.patientName)}. Bill/receipt/claim number: ${clean(input.billNumber)}. Service date: ${formatDate(input.serviceDate)}. Bill date: ${formatDate(input.billDate)}.`,
    `Issue type: ${clean(input.issueType)}. Total bill amount: ₹${total || clean(input.totalBillAmount)}. Amount paid: ₹${paid || clean(input.amountPaid)}. Disputed/unclear amount: ₹${disputed}.`,
    `Insurance/TPA details if any: ${clean(input.insuranceOrTpa)}. Estimate/package/reference details: ${clean(input.estimateOrPackage)}.`,
    `Response received so far: ${clean(input.providerResponse)}. Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please provide item-wise billing breakup, correction/refund if applicable, and expected resolution timeline in writing')}.`,
    '',
    'Please share the itemized breakup, reason for disputed charges/deductions, and the next action required from my side. I can provide relevant redacted bill, receipt, policy/TPA and payment proof.',
    '',
    'Regards,'
  ].join('\n')

  return {
    providerLabel: provider.label,
    totalBillAmount: total,
    amountPaid: paid,
    disputedAmount: disputed,
    billAge,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    escalationRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Disputed/unclear amount estimate: ₹${disputed}. Preserve itemized bill, receipt, estimate/package and insurance/TPA proof.`
  }
}
