export type JobSalaryDisputeInput = {
  issueType: string
  employerOrCompany: string
  roleOrJobTitle: string
  promisedAmount: string
  paidAmount: string
  joiningDate: string
  lastWorkDate: string
  salaryDueDate: string
  location: string
  communicationChannel: string
  issueSummary: string
  evidenceAvailable: string
  desiredOutcome: string
  extraNotes: string
}

export const jobSalaryIssueTypes = [
  { id: 'unpaid-salary', label: 'Salary not paid', proofFocus: 'appointment letter, salary slip, bank statement, attendance/work proof and HR messages', urgencyBoost: 25 },
  { id: 'partial-salary', label: 'Partial salary / wrong deduction', proofFocus: 'salary slip, agreed CTC/salary proof, deduction breakup and bank credit proof', urgencyBoost: 18 },
  { id: 'job-scam-fee', label: 'Job scam / registration fee taken', proofFocus: 'payment receipt, job ad, recruiter chats, offer letter, phone numbers and website link', urgencyBoost: 35 },
  { id: 'fake-offer', label: 'Fake offer letter / fake HR', proofFocus: 'offer letter PDF, sender email/domain, recruiter chat, demand for money or documents', urgencyBoost: 30 },
  { id: 'experience-letter', label: 'Experience/relieving letter not given', proofFocus: 'joining proof, resignation/exit mail, final work proof and HR follow-up messages', urgencyBoost: 14 },
  { id: 'freelance-payment', label: 'Freelance/client payment pending', proofFocus: 'scope of work, invoice, delivery proof, client approval, payment promise and chat/email trail', urgencyBoost: 20 },
  { id: 'other', label: 'Other job/work dispute', proofFocus: 'written agreement, payment proof, timeline and employer/client communication', urgencyBoost: 12 }
]

function clean(value: string | undefined, fallback = 'not provided') {
  const v = String(value || '').trim()
  return v || fallback
}

function numberFrom(value: string) {
  const n = Number(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function dateValue(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value: string) {
  const date = dateValue(value)
  if (!date) return clean(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysBetween(from: Date | null, to = new Date()) {
  if (!from) return null
  return Math.floor((to.getTime() - from.getTime()) / 86400000)
}

export function buildJobSalaryDisputePlan(input: JobSalaryDisputeInput) {
  const issue = jobSalaryIssueTypes.find((item) => item.id === input.issueType) || jobSalaryIssueTypes[0]
  const promised = numberFrom(input.promisedAmount)
  const paid = numberFrom(input.paidAmount)
  const pendingAmount = Math.max(0, promised - paid)
  const dueDate = dateValue(input.salaryDueDate)
  const overdueDays = daysBetween(dueDate)

  let riskScore = 30 + issue.urgencyBoost
  if (pendingAmount > 0) riskScore += 15
  if ((overdueDays ?? 0) > 7) riskScore += 10
  if ((overdueDays ?? 0) > 30) riskScore += 15
  if (/fee|security|registration|training|kit|upi|refund|fake|offer|threat|document/i.test(`${input.issueSummary} ${issue.label}`)) riskScore += 15
  if (String(input.evidenceAvailable || '').length > 90) riskScore += 5
  riskScore = Math.min(100, riskScore)

  const urgencyLevel = riskScore >= 80 ? 'High urgency - preserve proof and escalate in writing' : riskScore >= 60 ? 'Medium urgency - collect proof and send written follow-up' : 'Normal urgency - organize evidence and request written resolution'

  const proofChecklist = [
    `Issue-specific proof: ${issue.proofFocus}.`,
    'Offer letter, appointment letter, contract, joining confirmation, project scope or any written salary/payment promise.',
    'Attendance, work proof, timesheets, delivered files, Git commits, support tickets, screenshots or task approval proof.',
    'Salary slip, invoice, bank statement credit proof, UPI/payment proof, pending amount calculation and due date proof.',
    'HR/recruiter/client messages, emails, call logs and any written promise to pay or resolve.',
    'If money was paid for job/registration/training/security kit, preserve payment receipt, receiver details, job ad and demand message.',
    'Redact Aadhaar/PAN, full bank account, salary account number, home address, phone numbers and personal documents before public sharing.'
  ]

  const escalationPlan = [
    { step: 'Step 1', target: 'Organize facts', action: 'Write promised amount, paid amount, pending amount, dates, work period and exact issue in one timeline.' },
    { step: 'Step 2', target: 'Ask in writing', action: 'Send a calm written message requesting payment breakup, expected resolution date and official reply.' },
    { step: 'Step 3', target: 'Preserve proof', action: 'Save offer/contract, attendance/work proof, bank proof, HR/client messages and call logs in a single evidence folder.' },
    { step: 'Step 4', target: 'Escalate safely', action: 'Use official HR/grievance/client/company/legal-consultation/labour-style channels as applicable. Do not threaten or post private data publicly.' },
    { step: 'Step 5', target: 'Scam safety', action: 'If job fee/fake offer/recruiter fraud is involved, avoid further payment and preserve payment receiver, website/domain and chat evidence.' }
  ]

  const safetyWarnings = [
    'Guidance only. This is not legal advice and does not guarantee salary recovery or job scam refund.',
    'Never pay registration, security, training, kit, laptop, document verification or interview fee without verifying the employer through official channels.',
    'Do not share OTP, UPI PIN, CVV, passwords, screen-sharing access, full Aadhaar/PAN, full bank details or private documents with recruiters/callers.',
    'Do not publicly post private employee data, manager numbers, personal addresses, salary account details or unredacted documents.',
    'If threats, blackmail, identity misuse or financial fraud is involved, use trusted people and official local/cyber/consumer/labour-style channels quickly.'
  ]

  const copyReadyMessage = [
    `Subject: Request for written resolution - ${issue.label}`,
    '',
    `Dear ${clean(input.employerOrCompany, 'Employer / HR / Client Team')},`,
    '',
    `I am writing regarding ${issue.label.toLowerCase()}.`,
    `Company/Client: ${clean(input.employerOrCompany)}. Role/Work: ${clean(input.roleOrJobTitle)}. Location: ${clean(input.location)}. Communication channel: ${clean(input.communicationChannel)}.`,
    `Joining/start date: ${formatDate(input.joiningDate)}. Last work date: ${formatDate(input.lastWorkDate)}. Salary/payment due date: ${formatDate(input.salaryDueDate)}.`,
    `Promised amount: ₹${clean(input.promisedAmount)}. Paid amount: ₹${clean(input.paidAmount)}. Pending/difference estimate: ₹${pendingAmount}.`,
    `Issue summary: ${clean(input.issueSummary)}.`,
    `Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please share written payment/status update, pending amount breakup and expected resolution date')}.`,
    `Extra notes: ${clean(input.extraNotes)}.`,
    '',
    'Please provide a written response with the payment/salary breakup, reason for delay/deduction if any, and the expected resolution date. I request that all further communication be kept factual and in writing.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: issue.label,
    urgencyLevel,
    riskScore,
    promised,
    paid,
    pendingAmount,
    overdueDays,
    proofChecklist,
    escalationPlan,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Keep written proof, avoid job-fee traps and escalate through official employer/client/authority routes if needed.`
  }
}
