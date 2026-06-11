export type InsuranceClaimInput = {
  claimType: string
  insurerName: string
  policyNumber: string
  claimAmount: string
  incidentDate: string
  policyStartDate: string
  policyEndDate: string
  claimSubmittedDate: string
  cityState: string
  incidentSummary: string
  rejectionReason: string
  desiredOutcome: string
  userNotes: string
}

export type InsuranceClaimType = 'vehicle' | 'health' | 'travel' | 'phone' | 'appliance' | 'life' | 'crop' | 'other'

export const insuranceClaimTypes: { id: InsuranceClaimType; label: string; proofFocus: string; caution: string }[] = [
  { id: 'vehicle', label: 'Vehicle insurance claim', proofFocus: 'policy copy, RC, driving licence, photos/videos, repair estimate, FIR/DDR if applicable and claim intimation proof', caution: 'Do not move/repair heavily damaged vehicle before insurer survey unless safety requires it.' },
  { id: 'health', label: 'Health insurance claim', proofFocus: 'policy copy, hospital bills, discharge summary, prescriptions, reports, TPA/insurer emails and payment receipts', caution: 'Do not share medical records publicly; send only to verified insurer/TPA channels.' },
  { id: 'travel', label: 'Travel insurance claim', proofFocus: 'policy copy, ticket/booking, cancellation/delay proof, bills, airline/hotel written confirmation and passport/visa copy if required', caution: 'Verify official insurer portal before uploading passport, visa or ticket details.' },
  { id: 'phone', label: 'Mobile/device protection claim', proofFocus: 'invoice, IMEI/device serial, photos, service-center report, policy certificate and claim intimation proof', caution: 'Backup and remove private data before device handover.' },
  { id: 'appliance', label: 'Appliance/extended warranty claim', proofFocus: 'invoice, warranty certificate, service report, photos/videos and technician visit notes', caution: 'Use authorised service channels only; avoid fake pickup/payment links.' },
  { id: 'life', label: 'Life/term insurance claim', proofFocus: 'policy copy, claim form, nominee identity, death certificate and insurer-required documents', caution: 'Sensitive case: verify official insurer requirements and consider help from a trusted expert.' },
  { id: 'crop', label: 'Crop/weather insurance claim', proofFocus: 'policy/enrolment proof, land/crop documents, loss photos, local authority/weather proof and bank details requested only by official channel', caution: 'Do not share bank OTP, UPI PIN or Aadhaar OTP with anyone claiming to process subsidy/claim.' },
  { id: 'other', label: 'Other insurance claim', proofFocus: 'policy copy, claim form, incident proof, bills/receipts, written communication and claim reference ID', caution: 'Use verified official insurer/TPA/customer-care channels only.' }
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

function daysBetween(from: Date | null, to = new Date()) {
  if (!from) return null
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

function daysUntil(date: Date | null) {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function claimConfig(claimType: string) {
  return insuranceClaimTypes.find((item) => item.id === claimType) || insuranceClaimTypes[0]
}

function urgency(claimType: string, amount: number | null, incidentAgeDays: number | null, submittedAgeDays: number | null, policyEndsInDays: number | null) {
  if (policyEndsInDays !== null && policyEndsInDays < 0) return 'POLICY EXPIRY REVIEW NEEDED'
  if (incidentAgeDays !== null && incidentAgeDays >= 7 && !submittedAgeDays) return 'INTIMATION DELAY RISK'
  if (submittedAgeDays !== null && submittedAgeDays >= 30) return 'ESCALATE CLAIM FOLLOW-UP'
  if (amount !== null && amount >= 50000) return 'HIGH VALUE CLAIM'
  if (claimType === 'health' || claimType === 'life') return 'SENSITIVE CLAIM REVIEW'
  return 'ORGANIZE CLAIM PROOF'
}

export function buildInsuranceClaimPlan(input: InsuranceClaimInput) {
  const selectedClaim = claimConfig(input.claimType)
  const claimAmount = money(input.claimAmount)
  const incidentDate = safeDate(input.incidentDate)
  const policyStart = safeDate(input.policyStartDate)
  const policyEnd = safeDate(input.policyEndDate)
  const submittedDate = safeDate(input.claimSubmittedDate)
  const incidentAgeDays = daysBetween(incidentDate)
  const submittedAgeDays = daysBetween(submittedDate)
  const policyEndsInDays = daysUntil(policyEnd)
  const urgencyLevel = urgency(selectedClaim.id, claimAmount, incidentAgeDays, submittedAgeDays, policyEndsInDays)

  const filled = [
    input.claimType,
    input.insurerName,
    input.policyNumber,
    input.claimAmount,
    input.incidentDate,
    input.policyStartDate,
    input.policyEndDate,
    input.claimSubmittedDate,
    input.cityState,
    input.incidentSummary,
    input.rejectionReason,
    input.desiredOutcome
  ].filter(Boolean).length

  const proofChecklist = [
    'Policy document/certificate with policy number, coverage period, insured name and claim terms.',
    `Claim-specific proof: ${selectedClaim.proofFocus}.`,
    'Claim intimation proof: claim number/reference ID, email/SMS acknowledgement or portal screenshot.',
    'Bills, invoices, estimates, receipts and payment proof related to the claim amount.',
    'Photos/videos/reports showing the incident, damage, hospitalization, delay or loss as applicable.',
    'Written rejection/short-settlement reason if the insurer/TPA has denied or reduced claim amount.',
    'Redacted sharing copy hiding phone, full address, policy number, account number, ID numbers, medical records and OTPs.'
  ]

  const escalationPlan = [
    { step: 'Step 1', target: 'Claim desk / TPA / insurer support', action: 'Submit missing documents and ask for written claim status with pending requirement list.' },
    { step: 'Step 2', target: 'Grievance officer', action: 'If delayed/rejected, send a concise written grievance with claim ID, policy ID and proof index.' },
    { step: 'Step 3', target: 'Official insurer grievance route', action: 'Use only official insurer portal/email/branch details from the policy or official website.' },
    { step: 'Step 4', target: 'Regulatory/ombudsman route check', action: 'For unresolved eligible insurance complaints, check official regulatory/ombudsman process and timelines.' },
    { step: 'Step 5', target: 'Expert help for high-risk cases', action: 'For life, health, large amount, rejected claim or legal notice situations, consult a qualified expert before final filing.' }
  ]

  const safetyWarnings = [
    'This is claim-organization guidance, not insurance/legal/medical advice. Policy terms and official insurer rules decide claim outcome.',
    selectedClaim.caution,
    'Never share OTP, UPI PIN, CVV, net-banking password, remote screen access or card details for claim/refund processing.',
    'Do not upload full policy number, ID proof, medical records, address or bank details to public posts. Redact before sharing.',
    'Use only official insurer/TPA/app/website/email/branch channels. Beware of fake claim settlement calls and refund links.'
  ]

  const copyReadyMessage = [
    `Subject: Request for insurance claim status / review - ${selectedClaim.label}`,
    '',
    `Dear ${clean(input.insurerName, 'Insurance Support Team')},`,
    '',
    `I am writing regarding my ${selectedClaim.label.toLowerCase()}.`,
    `Policy number/reference: ${clean(input.policyNumber, 'not provided')}. Claim amount: ₹${clean(input.claimAmount, 'not provided')}. City/State: ${clean(input.cityState, 'not provided')}.`,
    `Incident date: ${formatDate(incidentDate)}. Policy period: ${formatDate(policyStart)} to ${formatDate(policyEnd)}. Claim submitted date: ${formatDate(submittedDate)}.`,
    `Issue/incident summary: ${clean(input.incidentSummary, 'not provided')}.`,
    `Rejection/short-settlement/delay reason shared so far: ${clean(input.rejectionReason, 'not provided')}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'please share claim status, pending document list and expected resolution date')}.`,
    `Additional notes: ${clean(input.userNotes, 'documents can be shared through official channel')}.`,
    '',
    'Please provide a written update with claim status, exact pending documents if any, reason for delay/rejection/short settlement, and expected resolution timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    claimLabel: selectedClaim.label,
    urgencyLevel,
    claimAmount,
    incidentAgeDays,
    submittedAgeDays,
    policyEndsInDays,
    proofStrengthScore: Math.min(100, Math.round((filled / 12) * 100)),
    proofChecklist,
    escalationPlan,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}: ${selectedClaim.label}. Organize policy, claim ID, official communication, bills and incident proof before escalation.`
  }
}
