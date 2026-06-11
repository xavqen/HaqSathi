export type WarrantyClaimProductType = 'mobile' | 'laptop' | 'appliance' | 'vehicle' | 'electronics' | 'furniture' | 'service' | 'other'

export type WarrantyClaimInput = {
  productName: string
  productType: string
  brandOrSeller: string
  purchaseDate: string
  warrantyEndDate: string
  invoiceNumber: string
  issueDate: string
  issueDescription: string
  previousServiceVisit: string
  desiredResolution: string
}

export const warrantyClaimProductTypes: { id: WarrantyClaimProductType; label: string; defaultWarrantyDays: number; route: string }[] = [
  { id: 'mobile', label: 'Mobile / tablet', defaultWarrantyDays: 365, route: 'Brand service center → brand support → consumer escalation' },
  { id: 'laptop', label: 'Laptop / computer', defaultWarrantyDays: 365, route: 'Authorized service center → brand support → written escalation' },
  { id: 'appliance', label: 'Home appliance', defaultWarrantyDays: 365, route: 'Brand service request → technician visit → escalation desk' },
  { id: 'vehicle', label: 'Vehicle / EV accessory', defaultWarrantyDays: 365, route: 'Dealer/service center → manufacturer support → written complaint' },
  { id: 'electronics', label: 'Electronics / accessory', defaultWarrantyDays: 180, route: 'Seller support → brand support → marketplace escalation' },
  { id: 'furniture', label: 'Furniture / home item', defaultWarrantyDays: 180, route: 'Seller support → warranty desk → written replacement request' },
  { id: 'service', label: 'Paid repair / service', defaultWarrantyDays: 30, route: 'Service provider → manager/escalation → refund/rework request' },
  { id: 'other', label: 'Other product/service', defaultWarrantyDays: 90, route: 'Seller/brand support → written escalation → consumer route' }
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
  const a = new Date(start.toISOString().slice(0, 10)).getTime()
  const b = new Date(end.toISOString().slice(0, 10)).getTime()
  return Math.ceil((b - a) / 86400000)
}

function typeConfig(productType: string) {
  return warrantyClaimProductTypes.find((item) => item.id === productType) || warrantyClaimProductTypes.at(-1)!
}

function urgency(daysLeft: number | null) {
  if (daysLeft === null) return 'UNKNOWN'
  if (daysLeft < 0) return 'EXPIRED / NEED PROOF REVIEW'
  if (daysLeft <= 7) return 'URGENT'
  if (daysLeft <= 30) return 'SOON'
  return 'ACTIVE'
}

function clean(value: string, fallback: string) {
  return (value || fallback).trim().replace(/\s+/g, ' ')
}

export function buildWarrantyClaimPlan(input: WarrantyClaimInput) {
  const config = typeConfig(input.productType)
  const purchaseDate = safeDate(input.purchaseDate)
  const explicitWarrantyEnd = safeDate(input.warrantyEndDate)
  const issueDate = safeDate(input.issueDate)
  const warrantyEnd = explicitWarrantyEnd || (purchaseDate ? addDays(purchaseDate, config.defaultWarrantyDays) : null)
  const today = new Date()
  const daysLeft = warrantyEnd ? daysBetween(today, warrantyEnd) : null
  const claimUrgency = urgency(daysLeft)
  const warrantyStatus = daysLeft === null ? 'Warranty date unknown' : daysLeft >= 0 ? 'Likely within warranty window' : 'Warranty may be expired; check invoice, extended warranty and service history'

  const claimStrength = [
    input.productName,
    input.brandOrSeller,
    input.invoiceNumber,
    input.issueDescription,
    purchaseDate,
    issueDate
  ].filter(Boolean).length

  const proofChecklist = [
    'Invoice/bill screenshot or PDF with product, date, amount and seller/brand visible.',
    'Warranty card, extended warranty proof or product registration screenshot if available.',
    'Clear photos/videos showing the defect, serial number/IMEI/model number and condition.',
    'Service center job sheet, technician note or previous repair receipt if any.',
    'Support chat/email/call log with date, person name and ticket/reference ID.',
    'Box/label/accessory photos only if the brand/seller asks for them.'
  ]

  const serviceVisitQuestions = [
    'What is the exact diagnosis and is it covered under warranty?',
    'Please provide job sheet/service request number in writing.',
    'What is the expected repair/replacement timeline?',
    'If denied, please mention the exact denial reason in writing.',
    'Will data be erased? What backup/removal steps should I take before handover?'
  ]

  const escalationPlan = [
    { step: 'Step 1', action: 'Raise ticket with seller/brand/service center and save acknowledgement.', target: 'Same day' },
    { step: 'Step 2', action: 'Visit authorized service center or request technician only through official channel.', target: 'Within 1-3 days' },
    { step: 'Step 3', action: 'Ask for written diagnosis/job sheet and expected resolution date.', target: 'During visit/call' },
    { step: 'Step 4', action: 'If delayed/denied, send escalation note with invoice, photos, job sheet and timeline.', target: 'After 3-7 days or denial' },
    { step: 'Step 5', action: 'Prepare consumer-route evidence pack if brand/seller gives no proper written resolution.', target: 'After written follow-up' }
  ]

  const privacyWarnings = [
    'Before handing over phone/laptop, back up data and remove/lock private accounts where possible.',
    'Do not share OTP, passwords, screen lock PIN, UPI PIN, CVV or full bank/card details with technicians.',
    'Use authorized service channels only; avoid random links, fake pickup calls and unofficial payment requests.',
    'Ask for written job sheet, denial reason or delivery receipt before leaving the product.'
  ]

  const copyReadyClaim = [
    `Subject: Warranty claim / service request - ${clean(input.productName, 'Product')} (${clean(input.invoiceNumber, 'invoice/reference not provided')})`,
    '',
    `Dear ${clean(input.brandOrSeller, 'Brand/Seller/Service Team')},`,
    '',
    `I purchased ${clean(input.productName, 'the product')} on ${formatDate(purchaseDate)}. The product is facing this issue: ${clean(input.issueDescription, 'issue details attached')}.`,
    `Invoice/Reference: ${clean(input.invoiceNumber, 'not provided')}`,
    `Issue noticed on: ${formatDate(issueDate)}`,
    `Warranty end date: ${formatDate(warrantyEnd)}`,
    `Previous service visit/ticket: ${clean(input.previousServiceVisit, 'none / not provided')}`,
    '',
    `Requested resolution: ${clean(input.desiredResolution, 'repair / replacement / refund as per policy')}.`,
    '',
    'Please register this warranty/service request, provide a written job sheet/ticket number, and confirm the expected resolution timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    productLabel: config.label,
    route: config.route,
    warrantyStatus,
    warrantyEnd: formatDate(warrantyEnd),
    daysLeft,
    claimUrgency,
    claimStrengthScore: Math.min(100, Math.round((claimStrength / 6) * 100)),
    proofChecklist,
    serviceVisitQuestions,
    escalationPlan,
    privacyWarnings,
    copyReadyClaim,
    summary: `${claimUrgency}: ${warrantyStatus}. Suggested route: ${config.route}.`
  }
}
