export type DeadlineAppealIssueType = 'refund' | 'banking' | 'scheme' | 'certificate' | 'service' | 'cyber' | 'education' | 'other'

export type DeadlineAppealInput = {
  caseTitle: string
  issueType: string
  authorityOrCompany: string
  referenceId: string
  lastActionDate: string
  replyOrOrderDate: string
  finalDeadlineDate: string
  currentStatus: string
}

export const deadlineAppealIssueTypes: { id: DeadlineAppealIssueType; label: string; defaultWindowDays: number; lane: string }[] = [
  { id: 'refund', label: 'Refund / wrong item / cancellation', defaultWindowDays: 7, lane: 'Company support → grievance/escalation → consumer route' },
  { id: 'banking', label: 'Bank / UPI / card dispute', defaultWindowDays: 30, lane: 'Bank support → nodal officer → ombudsman-ready escalation' },
  { id: 'scheme', label: 'Scheme / scholarship / benefit', defaultWindowDays: 15, lane: 'Portal helpdesk → department office → grievance route' },
  { id: 'certificate', label: 'Certificate / document application', defaultWindowDays: 10, lane: 'Office counter → service portal → district/department escalation' },
  { id: 'service', label: 'Warranty / service center / repair', defaultWindowDays: 7, lane: 'Service center → brand support → consumer route' },
  { id: 'cyber', label: 'Cyber fraud / suspicious transaction', defaultWindowDays: 1, lane: 'Bank/payment app → cyber portal/helpline → written follow-up' },
  { id: 'education', label: 'Admission / exam / college form', defaultWindowDays: 3, lane: 'Portal helpdesk → institute/exam authority → written appeal' },
  { id: 'other', label: 'Other deadline-based issue', defaultWindowDays: 7, lane: 'Support/office → escalation authority → written appeal' }
]

function safeDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date: Date | null) {
  if (!date) return 'Not provided'
  return date.toISOString().slice(0, 10)
}

function daysBetween(start: Date, end: Date) {
  const startDay = new Date(start.toISOString().slice(0, 10)).getTime()
  const endDay = new Date(end.toISOString().slice(0, 10)).getTime()
  return Math.ceil((endDay - startDay) / 86400000)
}

function cleanToken(value: string, fallback: string) {
  return (value || fallback).trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 42) || fallback
}

function issueConfig(issueType: string) {
  return deadlineAppealIssueTypes.find((item) => item.id === issueType) || deadlineAppealIssueTypes.at(-1)!
}

function statusToAction(status: string) {
  const lower = status.toLowerCase()
  if (lower.includes('rejected') || lower.includes('denied')) return 'Prepare appeal/review request with reason, proof and correction note.'
  if (lower.includes('pending') || lower.includes('no reply')) return 'Send written follow-up and ask for status, expected timeline and escalation reference.'
  if (lower.includes('approved') || lower.includes('resolved')) return 'Save acknowledgement, payment/proof and closure screenshot for future reference.'
  if (lower.includes('document') || lower.includes('missing')) return 'Attach corrected document list and ask the office/portal to reopen or recheck the case.'
  return 'Send a polite status request and keep every acknowledgement in the proof folder.'
}

function urgencyFrom(daysLeft: number | null) {
  if (daysLeft === null) return 'UNKNOWN'
  if (daysLeft < 0) return 'OVERDUE'
  if (daysLeft <= 2) return 'CRITICAL'
  if (daysLeft <= 7) return 'SOON'
  return 'NORMAL'
}

export function buildDeadlineAppealPlan(input: DeadlineAppealInput) {
  const config = issueConfig(input.issueType)
  const now = new Date()
  const lastActionDate = safeDate(input.lastActionDate)
  const replyOrOrderDate = safeDate(input.replyOrOrderDate)
  const explicitDeadline = safeDate(input.finalDeadlineDate)
  const calculatedDeadline = explicitDeadline || (replyOrOrderDate ? addDays(replyOrOrderDate, config.defaultWindowDays) : (lastActionDate ? addDays(lastActionDate, config.defaultWindowDays) : null))
  const daysLeft = calculatedDeadline ? daysBetween(now, calculatedDeadline) : null
  const urgency = urgencyFrom(daysLeft)
  const caseCode = `${cleanToken(input.issueType, 'case').toUpperCase()}-${cleanToken(input.referenceId || input.caseTitle, 'REF').toUpperCase().slice(0, 18)}`
  const firstReminder = calculatedDeadline ? addDays(calculatedDeadline, -3) : null
  const finalReminder = calculatedDeadline ? addDays(calculatedDeadline, -1) : null
  const escalationDate = calculatedDeadline ? addDays(calculatedDeadline, urgency === 'OVERDUE' ? 1 : 0) : (lastActionDate ? addDays(lastActionDate, config.defaultWindowDays) : null)
  const todayIso = formatDate(now)
  const deadlineIso = formatDate(calculatedDeadline)
  const statusAction = statusToAction(input.currentStatus || '')

  const timeline = [
    { label: 'Last action / submission', date: formatDate(lastActionDate), note: 'Keep acknowledgement, email, SMS or receipt proof.' },
    { label: 'Reply / rejection / order date', date: formatDate(replyOrOrderDate), note: 'Use this date when an appeal window starts from a decision/reply.' },
    { label: 'Reminder checkpoint', date: formatDate(firstReminder), note: 'Send short status reminder before the final date.' },
    { label: 'Final reminder', date: formatDate(finalReminder), note: 'Ask for written status and escalation reference.' },
    { label: 'Appeal / escalation target', date: deadlineIso, note: explicitDeadline ? 'User-provided deadline used.' : `Estimated using ${config.defaultWindowDays}-day default window.` }
  ]

  const nextActions = [
    statusAction,
    urgency === 'OVERDUE' ? 'Mark this as overdue and send escalation/appeal immediately with delay reason.' : 'Prepare appeal draft before the final date so you are not late.',
    'Keep proof in date order: submission, payment, rejection/reply, follow-ups and acknowledgement.',
    'Use only official portals, verified email IDs or written office acknowledgement for final submission.'
  ]

  const proofChecklist = [
    'Application/order/complaint/reference ID screenshot or receipt.',
    'Payment proof or fee receipt if money is involved.',
    'Reply/rejection/order screenshot or PDF if received.',
    'Previous follow-up email/chat/call/visit log.',
    'Corrected document/photo/signature/proof file, if the issue is document-related.',
    'Copy of final appeal/escalation message with date and recipient.'
  ]

  const safetyWarnings = [
    'Do not paste OTP, password, UPI PIN, CVV or full card/bank details in appeals.',
    'Do not publish private names, phone numbers, addresses or document numbers publicly.',
    'This is a planning helper, not legal advice. Verify exact limitation/deadline from official source.',
    'For cyber fraud or banking fraud, report urgently to official channels and bank/payment app first.'
  ]

  const copyReadyAppealNote = [
    `Subject: Request for status/review/appeal - ${input.caseTitle || 'Pending case'} (${input.referenceId || 'reference not provided'})`,
    '',
    `Dear ${input.authorityOrCompany || 'Support/Authority'} Team,`,
    '',
    `I am requesting a written update/review for my case: ${input.caseTitle || 'pending issue'}.`,
    `Reference ID: ${input.referenceId || 'not provided'}`,
    `Last action date: ${formatDate(lastActionDate)}`,
    `Reply/order date: ${formatDate(replyOrOrderDate)}`,
    `Target deadline/appeal date: ${deadlineIso}`,
    '',
    `Current status: ${input.currentStatus || 'pending / not clearly updated'}.`,
    '',
    'Please check the attached proof and provide either resolution, corrected status, or the proper appeal/escalation route in writing.',
    '',
    'Regards,'
  ].join('\n')

  return {
    caseCode,
    issueLabel: config.label,
    routeLane: config.lane,
    today: todayIso,
    targetDeadline: deadlineIso,
    daysLeft,
    urgency,
    escalationDate: formatDate(escalationDate),
    timeline,
    nextActions,
    proofChecklist,
    safetyWarnings,
    copyReadyAppealNote,
    summary: calculatedDeadline
      ? `${urgency} deadline status. Target date: ${deadlineIso}${daysLeft === null ? '' : ` (${daysLeft} day${Math.abs(daysLeft) === 1 ? '' : 's'} left/overdue count)`}.`
      : 'Deadline not detected. Add reply/order date or final deadline for a stronger plan.'
  }
}
