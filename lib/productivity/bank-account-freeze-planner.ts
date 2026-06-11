export type BankAccountFreezePlannerInput = {
  issueType: string
  bankName: string
  accountType: string
  amountBlocked: string
  freezeDate: string
  noticeSource: string
  transactionReference: string
  complaintId: string
  currentStatus: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const bankFreezeIssueTypes = [
  { id: 'account-freeze', label: 'Bank account frozen / debit freeze', focus: 'bank freeze notice, SMS/email, branch response, account statement and written reason request', urgencyBoost: 34 },
  { id: 'lien-hold', label: 'Lien / hold on account balance', focus: 'lien amount screenshot, transaction reference, bank statement and official written reason', urgencyBoost: 30 },
  { id: 'upi-dispute-hold', label: 'UPI dispute / cyber complaint hold', focus: 'UPI transaction ID, cyber complaint acknowledgement, bank ticket and payer/payee details redacted', urgencyBoost: 32 },
  { id: 'kyc-freeze', label: 'KYC / document-related freeze', focus: 'KYC request, submitted documents acknowledgement, branch ticket and official pending item list', urgencyBoost: 22 },
  { id: 'wrong-debit-hold', label: 'Wrong debit / reversal pending', focus: 'statement entry, UTR/reference ID, merchant/bank response and reversal timeline', urgencyBoost: 26 },
  { id: 'atm-cash-not-dispensed', label: 'ATM cash not dispensed but debited', focus: 'ATM location/time, failed receipt/SMS, statement entry and complaint number', urgencyBoost: 28 },
  { id: 'salary-pension-hold', label: 'Salary/pension/benefit amount blocked', focus: 'credit proof, account statement, branch response and urgency proof', urgencyBoost: 30 },
  { id: 'suspicious-activity-hold', label: 'Suspicious activity / risk review hold', focus: 'bank notice, recent transaction list, identity/KYC proof and written clarification request', urgencyBoost: 28 },
  { id: 'other', label: 'Other account hold/freeze issue', focus: 'bank notice, statement proof, complaint ID, branch response and timeline', urgencyBoost: 18 }
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

function daysBetween(from: string, to = new Date()) {
  const date = dateValue(from)
  if (!date) return null
  return Math.floor((to.getTime() - date.getTime()) / 86400000)
}

function formatDate(value: string) {
  const date = dateValue(value)
  if (!date) return clean(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildBankAccountFreezePlan(input: BankAccountFreezePlannerInput) {
  const issue = bankFreezeIssueTypes.find((item) => item.id === input.issueType) || bankFreezeIssueTypes[0]
  const amount = money(input.amountBlocked)
  const daysOpen = daysBetween(input.freezeDate)

  let urgencyScore = 20 + issue.urgencyBoost
  if (amount >= 1000) urgencyScore += 6
  if (amount >= 10000) urgencyScore += 9
  if (amount >= 100000) urgencyScore += 12
  if (daysOpen !== null && daysOpen >= 2) urgencyScore += 5
  if (daysOpen !== null && daysOpen >= 7) urgencyScore += 8
  if (/salary|pension|benefit|emergency|medical|rent|loan|emi|school|fees/i.test(`${issue.label} ${input.currentStatus} ${input.evidenceAvailable}`)) urgencyScore += 8
  if (/cyber|police|fraud|upi|hold|freeze|lien/i.test(`${issue.label} ${input.noticeSource} ${input.currentStatus}`)) urgencyScore += 6
  if (String(input.evidenceAvailable || '').length > 80) urgencyScore += 3
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 84 ? 'High urgency - ask bank for written freeze reason and escalation timeline immediately' : urgencyScore >= 64 ? 'Medium urgency - create a written bank complaint with proof and follow up in fixed intervals' : 'Normal urgency - collect written status, proof and official resolution route before escalation'

  const proofChecklist = [
    `Issue-specific proof: ${issue.focus}.`,
    'Bank proof: passbook/statement screenshot with only relevant entries visible, masked account number, bank branch name and official complaint/ticket number.',
    'Notice proof: SMS/email/app notification/branch letter that mentions freeze, lien, hold, debit block, KYC issue or dispute reference.',
    'Transaction proof: UTR/reference ID, date, amount, sender/receiver names only where necessary and sensitive numbers redacted.',
    'Communication proof: branch visit notes, call logs, support emails, escalation IDs and names/designations of bank staff if shared officially.',
    'Urgency proof: salary/pension/benefit/rent/medical/fee/EMI need proof if the blocked amount is urgent.',
    'Safety copy: hide full account number, debit card, CVV, PIN, OTP, password, full Aadhaar/PAN and internet banking details before sharing.'
  ]

  const escalationRoute = [
    { step: 'Step 1', title: 'Ask for written reason', action: 'Request the bank to provide official freeze/lien/hold reason, reference number, authority/source and expected resolution timeline in writing.' },
    { step: 'Step 2', title: 'Submit proof pack', action: 'Share only redacted statement, transaction reference, complaint ID and KYC/status proof through official bank channel.' },
    { step: 'Step 3', title: 'Get ticket and timeline', action: 'Collect service request number and ask for exact pending action from your side and bank side.' },
    { step: 'Step 4', title: 'Escalate inside bank', action: 'If unresolved, escalate to branch manager/grievance desk/nodal officer with previous complaint IDs and proof index.' },
    { step: 'Step 5', title: 'Use official regulator/authority route if needed', action: 'For eligible banking complaints, use official banking grievance/ombudsman or cyber portal route only after bank response timeline is clear.' }
  ]

  const safetyWarnings = [
    'Never share OTP, UPI PIN, ATM PIN, card CVV, internet banking password, remote screen access or full account/card number.',
    'Do not pay any random person to unfreeze an account or remove lien. Use only official bank branch/app/website/grievance channels.',
    'If the freeze is linked to cyber complaint or police request, ask bank for official reference and follow verified official authority route only.',
    'Do not publicly post full statement, Aadhaar/PAN, account number, phone number or home address.',
    'This is guidance only, not legal/financial advice. Final action should be verified with your bank, official authority or qualified expert.'
  ]

  const copyReadyMessage = [
    `Subject: Request for written status and resolution - ${issue.label}`,
    '',
    `Dear ${clean(input.bankName, 'Bank Support Team')},`,
    '',
    `I request written clarification and resolution for my bank account issue. Bank: ${clean(input.bankName)}. Account type: ${clean(input.accountType)}. Issue type: ${issue.label}.`,
    `Amount blocked/affected: ₹${amount || clean(input.amountBlocked)}. Freeze/hold noticed on: ${formatDate(input.freezeDate)}. Notice/source: ${clean(input.noticeSource)}. Transaction/reference ID: ${clean(input.transactionReference)}.`,
    `Existing complaint/ticket ID: ${clean(input.complaintId)}. Current status shared by bank/support: ${clean(input.currentStatus)}. Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please provide written reason, pending action, resolution timeline and escalation path')}.`,
    '',
    'Please provide the official reason/reference for the freeze/lien/hold, the pending action required from my side, and the expected resolution timeline in writing. I can share redacted statement, transaction proof and KYC/status documents through official bank channels if required.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: issue.label,
    amountBlocked: amount,
    daysOpen,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    escalationRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Estimated affected amount: ₹${amount}. Preserve ${issue.focus} and avoid sharing OTP/PIN/CVV/password/full account details.`
  }
}
