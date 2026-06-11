export type ReturnPickupInput = {
  platformName: string
  productName: string
  orderId: string
  deliveryDate: string
  returnWindowDays: string
  issueType: string
  itemValue: string
  pickupStatus: string
  packageCondition: string
  sellerResponse: string
  desiredResolution: string
}

export type ReturnIssueType = 'wrong_item' | 'damaged' | 'missing_item' | 'quality_issue' | 'late_delivery' | 'refund_delay' | 'pickup_failed' | 'other'

export const returnPickupIssueTypes: { id: ReturnIssueType; label: string; proofFocus: string }[] = [
  { id: 'wrong_item', label: 'Wrong item received', proofFocus: 'unboxing video, item label, invoice and wrong product photos' },
  { id: 'damaged', label: 'Damaged / defective item', proofFocus: 'damage photos, delivery packaging photo and short defect video' },
  { id: 'missing_item', label: 'Missing item / empty package', proofFocus: 'unboxing video, package weight label and delivery proof' },
  { id: 'quality_issue', label: 'Quality / not as described', proofFocus: 'product photos, listing screenshot and comparison notes' },
  { id: 'late_delivery', label: 'Late delivery / delivery issue', proofFocus: 'delivery tracking screenshot and promised date screenshot' },
  { id: 'refund_delay', label: 'Refund delayed after return', proofFocus: 'return accepted proof, pickup receipt and refund timeline screenshot' },
  { id: 'pickup_failed', label: 'Pickup repeatedly failed', proofFocus: 'pickup attempts, call logs and reschedule screenshots' },
  { id: 'other', label: 'Other online order issue', proofFocus: 'order proof, support chat and clear issue photos' }
]

function safeDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function formatDate(date: Date | null) {
  if (!date) return 'Not provided'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function clean(value: string, fallback: string) {
  return (value || fallback).trim().replace(/\s+/g, ' ')
}

function issueConfig(issueType: string) {
  return returnPickupIssueTypes.find((item) => item.id === issueType) || returnPickupIssueTypes[returnPickupIssueTypes.length - 1]
}

function parseWindow(value: string) {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return 7
  return Math.min(parsed, 90)
}

function urgency(daysLeft: number | null, issueType: string) {
  if (issueType === 'refund_delay') return 'REFUND FOLLOW-UP'
  if (daysLeft === null) return 'WINDOW UNKNOWN'
  if (daysLeft < 0) return 'RETURN WINDOW MAY BE CLOSED'
  if (daysLeft <= 1) return 'URGENT - ACT TODAY'
  if (daysLeft <= 3) return 'HIGH PRIORITY'
  return 'WITHIN WINDOW'
}

export function buildReturnPickupPlan(input: ReturnPickupInput) {
  const deliveryDate = safeDate(input.deliveryDate)
  const returnWindowDays = parseWindow(input.returnWindowDays)
  const returnDeadline = deliveryDate ? addDays(deliveryDate, returnWindowDays) : null
  const daysLeft = returnDeadline ? daysBetween(new Date(), returnDeadline) : null
  const selectedIssue = issueConfig(input.issueType)
  const urgencyLevel = urgency(daysLeft, selectedIssue.id)
  const pickupStatus = clean(input.pickupStatus, 'pickup not scheduled / not provided')
  const issueLabel = selectedIssue.label

  const strengthPoints = [
    input.platformName,
    input.productName,
    input.orderId,
    input.deliveryDate,
    input.issueType,
    input.packageCondition,
    input.sellerResponse
  ].filter(Boolean).length

  const proofChecklist = [
    'Order/invoice screenshot with order ID, item name, amount and date visible.',
    `Issue proof: ${selectedIssue.proofFocus}.`,
    'Product photos from multiple angles plus packaging/label photos where relevant.',
    'Support chat/email/call log showing complaint, pickup schedule or refund promise.',
    'Pickup receipt, return tracking ID or courier acknowledgement after pickup.',
    'Bank/payment refund screenshot only after hiding full account/card/UPI details.'
  ]

  const pickupChecklist = [
    'Keep item, original packaging, accessories and invoice ready before pickup.',
    'Take photos/video of product condition and packed box before handing over.',
    'Ask pickup agent for pickup receipt, OTP policy and tracking/reference ID in writing/app.',
    'Do not share UPI PIN, card CVV, bank OTP, password or screen-sharing access for refund.',
    'If pickup fails, save missed-call log, agent message and app reschedule screenshot.'
  ]

  const escalationPlan = [
    { step: 'Step 1', target: 'Marketplace support', action: 'Raise return/refund issue inside official app/website and save ticket ID.' },
    { step: 'Step 2', target: 'Pickup/courier proof', action: 'Collect pickup receipt or failed pickup proof with date/time screenshots.' },
    { step: 'Step 3', target: 'Seller/brand support', action: 'Escalate with order ID, photos, timeline and requested resolution.' },
    { step: 'Step 4', target: 'Payment dispute route', action: 'For non-delivery/refund delay, prepare payment/bank dispute proof after platform response.' },
    { step: 'Step 5', target: 'Consumer escalation pack', action: 'If no resolution, prepare concise timeline and evidence index before official consumer route.' }
  ]

  const safetyWarnings = [
    'Use only the official marketplace app/website or verified support channel for return/refund action.',
    'Never share OTP, UPI PIN, card CVV, password, full bank details or screen-sharing access for refund.',
    'Do not hand over product without pickup receipt/tracking proof inside the official app or written acknowledgement.',
    'Redact phone, address, full order ID and payment details before sharing screenshots publicly.'
  ]

  const copyReadyMessage = [
    `Subject: Return / pickup / refund help needed - ${clean(input.productName, 'Product')} (${clean(input.orderId, 'Order ID not provided')})`,
    '',
    `Dear ${clean(input.platformName, 'Support Team')},`,
    '',
    `I need help with my order: ${clean(input.orderId, 'not provided')}. Product: ${clean(input.productName, 'not provided')}.`,
    `Issue type: ${issueLabel}.`,
    `Delivery date: ${formatDate(deliveryDate)}. Return deadline estimate: ${formatDate(returnDeadline)} (${urgencyLevel}).`,
    `Current pickup/refund status: ${pickupStatus}.`,
    `Package/product condition: ${clean(input.packageCondition, 'details attached')}.`,
    `Previous seller/support response: ${clean(input.sellerResponse, 'not provided')}.`,
    `Requested resolution: ${clean(input.desiredResolution, 'return pickup and refund/replacement as per policy')}.`,
    '',
    'Please register this issue, confirm the pickup/refund timeline in writing, and share the official ticket/reference number.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel,
    returnDeadline: formatDate(returnDeadline),
    daysLeft,
    urgencyLevel,
    proofStrengthScore: Math.min(100, Math.round((strengthPoints / 7) * 100)),
    returnWindowDays,
    proofChecklist,
    pickupChecklist,
    escalationPlan,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}: ${issueLabel}. Keep official app proof, pickup receipt and refund timeline screenshots ready.`
  }
}
