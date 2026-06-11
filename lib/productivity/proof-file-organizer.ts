export type ProofIssueType = 'refund' | 'upi-fraud' | 'bank-dispute' | 'service-center' | 'scheme-form' | 'general-complaint'

export type ProofOrganizerInput = {
  caseTitle: string
  issueType: ProofIssueType | string
  authorityOrCompany: string
  referenceId: string
  incidentDate: string
  proofNotes: string
}

export type ProofOrganizerPlan = {
  caseCode: string
  folderName: string
  urgency: 'LOW' | 'NORMAL' | 'HIGH'
  folderStructure: string[]
  fileNameExamples: string[]
  requiredProof: string[]
  missingProof: string[]
  sharePack: string[]
  redactionWarnings: string[]
  summaryNote: string
  copyReadyIndex: string
}

export const proofIssueTypes = [
  { id: 'refund', label: 'Refund / wrong item', proofs: ['Order invoice', 'Payment proof', 'Refund promise screenshot', 'Delivery/product photo', 'Support chat/email'] },
  { id: 'upi-fraud', label: 'UPI fraud / wrong transfer', proofs: ['Transaction screenshot', 'Bank statement line', 'UPI reference ID', 'Cyber/bank complaint acknowledgement', 'Call/SMS screenshot if any'] },
  { id: 'bank-dispute', label: 'Bank debit / card dispute', proofs: ['Debit message', 'Statement line', 'Merchant/support response', 'Complaint number', 'Bank branch/email acknowledgement'] },
  { id: 'service-center', label: 'Service center / warranty', proofs: ['Job sheet', 'Warranty card/invoice', 'Device/item photos', 'Repair estimate', 'Delivery promise or refusal note'] },
  { id: 'scheme-form', label: 'Scheme / form / certificate', proofs: ['Application acknowledgement', 'Submitted form PDF/photo', 'Required documents', 'Payment receipt if any', 'Office visit/call log'] },
  { id: 'general-complaint', label: 'General complaint', proofs: ['Complaint draft', 'Proof screenshots', 'Reference IDs', 'Timeline notes', 'Follow-up messages'] }
] as const

const safeSlug = (value: string) =>
  (value || 'case')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 52) || 'case'

const compactDate = (value: string) => {
  const date = value && !Number.isNaN(Date.parse(value)) ? new Date(value) : new Date()
  return date.toISOString().slice(0, 10).replaceAll('-', '')
}

function selectedType(issueType: string) {
  return proofIssueTypes.find((item) => item.id === issueType) || proofIssueTypes[proofIssueTypes.length - 1]
}

function detectMissing(required: string[], notes: string) {
  const lower = notes.toLowerCase()
  return required.filter((item) => {
    const words = item.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3)
    return !words.some((word) => lower.includes(word))
  })
}

export function buildProofFileOrganizerPlan(input: ProofOrganizerInput): ProofOrganizerPlan {
  const type = selectedType(String(input.issueType || 'general-complaint'))
  const dateCode = compactDate(input.incidentDate)
  const titleSlug = safeSlug(input.caseTitle)
  const companySlug = safeSlug(input.authorityOrCompany)
  const referenceSlug = safeSlug(input.referenceId || 'no-ref')
  const caseCode = `${dateCode}-${companySlug}-${referenceSlug}`.slice(0, 80)
  const folderName = `${dateCode}_${titleSlug}_${companySlug}`.slice(0, 96)
  const missingProof = detectMissing([...type.proofs], input.proofNotes || '')
  const urgency: ProofOrganizerPlan['urgency'] = missingProof.length >= 3 ? 'HIGH' : missingProof.length >= 1 ? 'NORMAL' : 'LOW'
  const folderStructure = [
    `${folderName}/01_originals_keep_safe`,
    `${folderName}/02_redacted_for_sharing`,
    `${folderName}/03_payment_and_invoice`,
    `${folderName}/04_chat_email_call_logs`,
    `${folderName}/05_final_submission_pack`
  ]
  const prefix = `${dateCode}_${companySlug}`
  const fileNameExamples = [
    `${prefix}_01_invoice-or-application.pdf`,
    `${prefix}_02_payment-proof-redacted.png`,
    `${prefix}_03_support-chat-screenshot-redacted.png`,
    `${prefix}_04_complaint-acknowledgement.pdf`,
    `${prefix}_05_follow-up-message.txt`
  ]
  const sharePack = [
    'Use redacted copies only; keep originals private.',
    'Add one-page case summary before attachments.',
    'Sort files by date and number so support/admin can understand quickly.',
    'Attach only relevant proof; do not send raw private documents unless official portal asks.'
  ]
  const redactionWarnings = [
    'Hide OTP, password, UPI PIN, CVV and full card/bank details.',
    'Mask Aadhaar/PAN except last 4 characters unless an official portal requires full document.',
    'Blur private address, phone, email and unrelated faces before public sharing.',
    'Do not rename files with secrets like full account number, password or phone number.'
  ]
  const requiredProof = [...type.proofs]
  const summaryNote = `Case ${caseCode}: ${input.caseTitle || 'User complaint'} against ${input.authorityOrCompany || 'company/authority'} for ${type.label}. Keep originals private, share only redacted copies, and attach proof in numbered order.`
  const copyReadyIndex = [
    `Proof index for: ${input.caseTitle || 'Case'}`,
    `Company/Authority: ${input.authorityOrCompany || 'Not added'}`,
    `Reference ID: ${input.referenceId || 'Not available'}`,
    `Incident date: ${input.incidentDate || 'Not added'}`,
    '',
    'Suggested attachment order:',
    ...fileNameExamples.map((name, index) => `${index + 1}. ${name}`),
    '',
    'Safety: I have redacted OTP/password/UPI PIN/CVV/full bank/card details/private IDs before sharing.'
  ].join('\n')

  return { caseCode, folderName, urgency, folderStructure, fileNameExamples, requiredProof, missingProof, sharePack, redactionWarnings, summaryNote, copyReadyIndex }
}
