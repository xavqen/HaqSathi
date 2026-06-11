export type RentDepositInput = {
  issueType: string
  cityState: string
  landlordOrBroker: string
  propertyAddress: string
  monthlyRent: string
  depositAmount: string
  moveInDate: string
  moveOutDate: string
  noticeGivenDate: string
  agreementStatus: string
  deductionClaim: string
  pendingAmount: string
  previousRequestDate: string
  desiredResolution: string
  userNotes: string
}

export type RentDepositIssueType = 'deposit_not_returned' | 'unfair_deduction' | 'rent_receipt_missing' | 'maintenance_not_done' | 'notice_period_dispute' | 'brokerage_dispute' | 'lockin_dispute' | 'other'

export const rentDepositIssueTypes: { id: RentDepositIssueType; label: string; proofFocus: string }[] = [
  { id: 'deposit_not_returned', label: 'Security deposit not returned', proofFocus: 'rent agreement, payment proof, move-out photos, handover proof and written requests' },
  { id: 'unfair_deduction', label: 'Unfair deposit deduction', proofFocus: 'deduction breakup, inspection photos, repair estimates, move-in/move-out condition proof' },
  { id: 'rent_receipt_missing', label: 'Rent receipt not provided', proofFocus: 'rent payment proof, bank/UPI receipts and written receipt requests' },
  { id: 'maintenance_not_done', label: 'Maintenance/repair not done', proofFocus: 'photos/videos, complaint messages, dates, rent agreement maintenance clause' },
  { id: 'notice_period_dispute', label: 'Notice period dispute', proofFocus: 'notice message/email, agreement notice clause, move-out date and handover proof' },
  { id: 'brokerage_dispute', label: 'Brokerage/broker issue', proofFocus: 'broker messages, payment proof, service promise and agreement terms' },
  { id: 'lockin_dispute', label: 'Lock-in / early exit dispute', proofFocus: 'agreement lock-in clause, notice reason, handover proof and communication timeline' },
  { id: 'other', label: 'Other rent/home dispute', proofFocus: 'agreement, payment proof, photos, timeline and written communication' }
]

export const agreementStatuses = [
  'Written rental agreement available',
  'Only WhatsApp/email terms available',
  'No written agreement',
  'Agreement expired / renewal pending',
  'Not sure'
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

function daysSince(date: Date | null) {
  if (!date) return null
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function issueConfig(issueType: string) {
  return rentDepositIssueTypes.find((item) => item.id === issueType) || rentDepositIssueTypes[0]
}

function urgency(issueType: string, pendingAmount: number | null, requestAgeDays: number | null) {
  if (requestAgeDays !== null && requestAgeDays >= 30) return 'ESCALATE WITH WRITTEN RECORD'
  if (pendingAmount !== null && pendingAmount >= 20000) return 'HIGH VALUE RENT DISPUTE'
  if (issueType === 'maintenance_not_done') return 'LIVING CONDITION ISSUE'
  if (issueType === 'notice_period_dispute' || issueType === 'lockin_dispute') return 'AGREEMENT TERMS REVIEW NEEDED'
  return 'START WRITTEN FOLLOW-UP'
}

export function buildRentDepositDisputePlan(input: RentDepositInput) {
  const selectedIssue = issueConfig(input.issueType)
  const pending = money(input.pendingAmount) ?? money(input.depositAmount)
  const lastRequest = safeDate(input.previousRequestDate)
  const requestAgeDays = daysSince(lastRequest)
  const urgencyLevel = urgency(selectedIssue.id, pending, requestAgeDays)
  const moveOut = safeDate(input.moveOutDate)
  const noticeDate = safeDate(input.noticeGivenDate)

  const proofInputs = [
    input.issueType,
    input.cityState,
    input.landlordOrBroker,
    input.propertyAddress,
    input.monthlyRent,
    input.depositAmount,
    input.moveInDate,
    input.moveOutDate,
    input.noticeGivenDate,
    input.agreementStatus,
    input.previousRequestDate
  ].filter(Boolean).length

  const proofChecklist = [
    'Rental agreement or written terms showing rent, deposit, notice period, lock-in and deduction clauses.',
    'Deposit/rent payment proof: bank transfer, UPI receipt, cash receipt or signed acknowledgement.',
    `Issue-specific proof: ${selectedIssue.proofFocus}.`,
    'Move-in and move-out photos/videos, keys/handover proof and inventory checklist if available.',
    'Written messages/emails asking for deposit return, receipt, repair, or explanation of deductions.',
    'Deduction breakup, repair bill/estimate and before/after condition proof if landlord claims damage.',
    'Redacted sharing copy that hides phone number, exact address, account details, UPI IDs and ID numbers.'
  ]

  const escalationPlan = [
    { step: 'Step 1', target: 'Written request', action: 'Send a polite written request with agreement/payment proof and deadline for written response.' },
    { step: 'Step 2', target: 'Proof pack', action: 'Prepare timeline, payment proof, agreement clauses, handover photos and pending amount calculation.' },
    { step: 'Step 3', target: 'Mediation / society / owner office', action: 'If safe and available, request written mediation or society/manager acknowledgement.' },
    { step: 'Step 4', target: 'Local legal/consumer route', action: 'For serious/high-value disputes, consult a local legal aid/expert before sending formal notice or filing.' },
    { step: 'Step 5', target: 'Safety first', action: 'Avoid threats, lock change conflicts, public doxxing or sharing private address/phone online.' }
  ]

  const safetyWarnings = [
    'This is guidance only, not legal advice. Local rent laws, agreement terms and evidence decide the next step.',
    'Do not publish exact address, phone number, ID proof, account/UPI details or family details publicly.',
    'Keep communication polite and written. Avoid threats, forceful entry, lock conflict, harassment or fake claims.',
    'For eviction, threats, violence, illegal lockout or very high-value disputes, contact local legal aid/police/authority as applicable.'
  ]

  const copyReadyMessage = [
    `Subject: Request to resolve rent/deposit issue - ${selectedIssue.label}`,
    '',
    `Dear ${clean(input.landlordOrBroker, 'Landlord/Property Manager')},`,
    '',
    `I am writing regarding the rented property: ${clean(input.propertyAddress, 'property details not provided')}.`,
    `Issue type: ${selectedIssue.label}. City/State: ${clean(input.cityState, 'not provided')}.`,
    `Agreement status: ${clean(input.agreementStatus, 'not provided')}. Monthly rent: ₹${clean(input.monthlyRent, 'not provided')}. Deposit amount: ₹${clean(input.depositAmount, 'not provided')}.`,
    `Move-out date: ${formatDate(moveOut)}. Notice given date: ${formatDate(noticeDate)}. Pending amount/claim: ₹${clean(input.pendingAmount, 'not provided')}.`,
    `Deduction/claim details: ${clean(input.deductionClaim, 'not provided')}.`,
    `Previous written request date: ${formatDate(lastRequest)}. Urgency: ${urgencyLevel}.`,
    `Requested resolution: ${clean(input.desiredResolution, 'please return the pending amount / share a written deduction breakup with proof')}.`,
    `Notes: ${clean(input.userNotes, 'proof can be shared on request')}.`,
    '',
    'Please share a written response with the settlement calculation, reason for any deduction, and expected resolution date.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: selectedIssue.label,
    urgencyLevel,
    requestAgeDays,
    pendingAmount: pending,
    proofStrengthScore: Math.min(100, Math.round((proofInputs / 11) * 100)),
    proofChecklist,
    escalationPlan,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}: ${selectedIssue.label}. Keep agreement, payment proof, handover proof and written communication ready before escalation.`
  }
}
