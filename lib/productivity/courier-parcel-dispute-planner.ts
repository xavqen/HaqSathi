export type CourierParcelDisputeInput = {
  issueType: string
  courierOrPlatform: string
  sellerName: string
  trackingId: string
  orderId: string
  orderValue: string
  bookingDate: string
  promisedDeliveryDate: string
  currentStatus: string
  complaintId: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const courierIssueTypes = [
  { id: 'parcel-lost', label: 'Parcel lost / not traceable', focus: 'tracking screenshots, last scan location, booking receipt, item value proof and delivery promise', urgencyBoost: 28 },
  { id: 'marked-delivered-not-received', label: 'Marked delivered but not received', focus: 'delivery OTP status, address proof, call logs, CCTV/guard note and delivery timestamp', urgencyBoost: 30 },
  { id: 'damaged-parcel', label: 'Damaged parcel / broken item', focus: 'unboxing photos/video, outer package photos, invoice, AWB label and damage report timeline', urgencyBoost: 24 },
  { id: 'wrong-item', label: 'Wrong item received', focus: 'unboxing proof, item photos, invoice, product page screenshot and return request ID', urgencyBoost: 22 },
  { id: 'delayed-delivery', label: 'Delivery delayed beyond promise', focus: 'promised delivery date, tracking delay screenshots, support chats and need/urgency proof', urgencyBoost: 16 },
  { id: 'pickup-not-done', label: 'Pickup not done / return stuck', focus: 'pickup slot screenshots, failed pickup message, package-ready proof and return ID', urgencyBoost: 18 },
  { id: 'cod-payment-issue', label: 'COD / payment collection issue', focus: 'cash/UPI receipt, delivery agent details, order amount, invoice and payment confirmation', urgencyBoost: 26 },
  { id: 'address-rto-issue', label: 'Address/RTO issue', focus: 'correct address proof, call attempt logs, RTO status, support response and ID proof redaction', urgencyBoost: 18 },
  { id: 'fake-courier-scam', label: 'Fake courier/customs scam message', focus: 'SMS/WhatsApp screenshot, sender number/link, payment demand proof and redacted tracking ID', urgencyBoost: 32 },
  { id: 'other', label: 'Other courier/parcel issue', focus: 'tracking proof, invoice, delivery/pickup proof, support response and timeline', urgencyBoost: 14 }
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

export function buildCourierParcelDisputePlan(input: CourierParcelDisputeInput) {
  const issue = courierIssueTypes.find((item) => item.id === input.issueType) || courierIssueTypes[0]
  const value = money(input.orderValue)
  const bookingAge = daysBetween(input.bookingDate)
  const promisedAge = daysBetween(input.promisedDeliveryDate)

  let urgencyScore = 24 + issue.urgencyBoost
  if (value >= 500) urgencyScore += 6
  if (value >= 2000) urgencyScore += 8
  if (value >= 10000) urgencyScore += 10
  if (bookingAge !== null && bookingAge >= 7) urgencyScore += 5
  if (promisedAge !== null && promisedAge >= 1) urgencyScore += 7
  if (promisedAge !== null && promisedAge >= 5) urgencyScore += 8
  if (/lost|delivered|not received|damaged|broken|fake|scam|customs|otp|cod|cash|rto/i.test(`${issue.label} ${input.currentStatus} ${input.evidenceAvailable}`)) urgencyScore += 8
  if (String(input.evidenceAvailable || '').length > 80) urgencyScore += 3
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 82 ? 'High urgency - preserve proof and escalate through official courier/platform route quickly' : urgencyScore >= 62 ? 'Medium urgency - send a written complaint with tracking proof and support timeline' : 'Normal urgency - verify tracking and keep a clear written support record'

  const proofChecklist = [
    `Issue-specific proof: ${issue.focus}.`,
    'Order proof: order ID, invoice, seller/platform name, item value, booking date and promised delivery date.',
    'Courier proof: tracking/AWB ID, tracking screenshots, last scan location, delivery/pickup attempt messages and support ticket ID.',
    'Condition proof: package photos, AWB label photos, unboxing video/photos, damage photos, wrong-item photos or pickup-ready photos where relevant.',
    'Communication proof: support chat/email, customer-care call log, delivery agent call details, store/seller response and promised timeline.',
    'Safety copy: hide full address, full phone number, OTP, payment card details, UPI PIN, ID numbers and private home/location details before sharing publicly.',
    'Use official courier/platform app, website, helpline or seller support only. Avoid random customs/refund/reschedule links from SMS/WhatsApp.'
  ]

  const escalationRoute = [
    { step: 'Step 1', title: 'Freeze proof immediately', action: 'Save tracking page screenshots, invoice, AWB label, package photos and all support messages before status changes.' },
    { step: 'Step 2', title: 'Send written complaint', action: 'Use the copy-ready message with tracking ID, order ID, issue date, promised date, value and proof list.' },
    { step: 'Step 3', title: 'Ask for written outcome', action: 'Request trace result, delivery proof/POD, refund/replacement timeline or rejection reason in writing.' },
    { step: 'Step 4', title: 'Escalate to platform/courier grievance desk', action: 'If first support fails, escalate with proof pack, complaint ID and timeline. Keep all responses.' },
    { step: 'Step 5', title: 'Payment route when valid', action: 'For paid order/refund failure, keep courier/platform response and ask bank/payment app about dispute route if needed.' }
  ]

  const safetyWarnings = [
    'Never share delivery OTP, UPI PIN, CVV, card PIN, account password, full ID number or remote screen access.',
    'Do not click random customs, reschedule, KYC, refund or delivery links from unknown SMS/WhatsApp messages.',
    'For marked-delivered-but-not-received, ask for POD/delivery proof and preserve call logs/CCTV/guard notes if available.',
    'For damaged/wrong items, do not throw away packaging until the claim/return path is clear.',
    'This tool gives guidance only; verify final action through official courier, platform, seller, bank/payment app or relevant authority.'
  ]

  const copyReadyMessage = [
    `Subject: Courier/parcel complaint - ${issue.label}`,
    '',
    `Dear ${clean(input.courierOrPlatform, 'Support Team')},`,
    '',
    `I request written resolution for my parcel issue. Courier/platform: ${clean(input.courierOrPlatform)}. Seller/merchant: ${clean(input.sellerName)}. Issue type: ${issue.label}.`,
    `Tracking/AWB ID: ${clean(input.trackingId)}. Order ID: ${clean(input.orderId)}. Order value: ₹${value || clean(input.orderValue)}. Booking/order date: ${formatDate(input.bookingDate)}. Promised delivery date: ${formatDate(input.promisedDeliveryDate)}.`,
    `Current status shown: ${clean(input.currentStatus)}. Existing complaint/ticket ID: ${clean(input.complaintId)}. Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please trace the parcel and provide refund/replacement/delivery correction timeline if applicable')}.`,
    '',
    'Please share the official status, delivery proof/POD or investigation result, and expected resolution timeline in writing. I can share redacted invoice, tracking screenshots, package photos and support proof if required.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: issue.label,
    orderValue: value,
    bookingAge,
    promisedAge,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    escalationRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Estimated value at risk: ₹${value}. Preserve ${issue.focus} and use official courier/platform routes only.`
  }
}
