export type VehicleChallanPlannerInput = {
  issueType: string
  vehicleType: string
  stateOrCity: string
  challanNumber: string
  challanDate: string
  amount: string
  violationClaim: string
  paymentStatus: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const vehicleChallanIssueTypes = [
  { id: 'wrong-vehicle', label: 'Wrong vehicle / number plate mismatch', focus: 'challan screenshot, vehicle RC, number plate photo, location/time mismatch proof', urgencyBoost: 34 },
  { id: 'paid-but-pending', label: 'Paid but challan still pending', focus: 'payment receipt, UTR/reference ID, challan number and portal pending screenshot', urgencyBoost: 30 },
  { id: 'duplicate-challan', label: 'Duplicate challan for same incident', focus: 'both challan numbers, dates, location, violation description and payment/status proof', urgencyBoost: 28 },
  { id: 'incorrect-violation', label: 'Incorrect violation claim', focus: 'photo/video evidence, GPS/location proof, dashcam/CCTV if available and challan details', urgencyBoost: 25 },
  { id: 'vehicle-sold', label: 'Vehicle sold but challan came to old owner', focus: 'sale transfer proof, delivery note, RC transfer status, buyer details if legally safe', urgencyBoost: 26 },
  { id: 'late-fee-issue', label: 'Late fee / penalty dispute', focus: 'notice date, portal screenshot, payment attempt proof and original challan timeline', urgencyBoost: 20 },
  { id: 'towing-seizure', label: 'Towing / seizure / impound issue', focus: 'receipt, police/traffic station details, photos, location and release/payment proof', urgencyBoost: 36 },
  { id: 'other', label: 'Other traffic challan issue', focus: 'challan screenshot, vehicle RC, payment proof, location/time evidence and official complaint ID', urgencyBoost: 18 }
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
  return Math.floor((Date.now() - date.getTime()) / 86400000)
}

function formatDate(value: string) {
  const date = dateValue(value)
  if (!date) return clean(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildVehicleChallanPlan(input: VehicleChallanPlannerInput) {
  const issue = vehicleChallanIssueTypes.find((item) => item.id === input.issueType) || vehicleChallanIssueTypes[0]
  const amount = money(input.amount)
  const daysOpen = daysSince(input.challanDate)

  let urgencyScore = 20 + issue.urgencyBoost
  if (amount >= 500) urgencyScore += 4
  if (amount >= 2000) urgencyScore += 8
  if (amount >= 10000) urgencyScore += 12
  if (daysOpen !== null && daysOpen >= 7) urgencyScore += 4
  if (daysOpen !== null && daysOpen >= 30) urgencyScore += 8
  if (/towing|seizure|impound|court|license|blacklist|blocked|urgent/i.test(`${issue.label} ${input.violationClaim} ${input.paymentStatus}`)) urgencyScore += 10
  if (/paid|receipt|utr|deducted/i.test(input.paymentStatus || '')) urgencyScore += 5
  if ((input.evidenceAvailable || '').length > 80) urgencyScore += 3
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 82 ? 'High urgency - preserve proof and use official traffic/e-challan escalation quickly' : urgencyScore >= 62 ? 'Medium urgency - submit a written dispute with proof and track status' : 'Normal urgency - collect proof, verify official portal, then dispute calmly if needed'

  const proofChecklist = [
    `Issue-specific proof: ${issue.focus}.`,
    'Challan proof: challan number, date, vehicle number masked if sharing publicly, violation description and amount screenshot from official portal/app.',
    'Vehicle proof: RC, ownership/transfer proof, number plate photo or relevant vehicle photo with sensitive details redacted.',
    'Payment proof if paid: receipt, UTR/reference ID, bank/app debit screenshot and portal still-pending screenshot.',
    'Location/time proof: GPS history, parking receipt, toll receipt, CCTV/dashcam/photo or travel proof if it supports your case.',
    'Communication proof: traffic helpline emails, portal complaint ID, visit notes and officer/desk reference if officially shared.',
    'Safety copy: hide full address, phone number, engine/chassis number, full ID number, card/CVV/PIN/OTP and unrelated personal data.'
  ]

  const escalationRoute = [
    { step: 'Step 1', title: 'Verify on official portal', action: 'Open only the official e-challan/traffic police/state portal yourself and verify challan number, amount, vehicle number, violation and current payment status.' },
    { step: 'Step 2', title: 'Create proof pack', action: 'Save challan screenshot, RC/ownership proof, payment receipt if paid, and evidence proving mismatch/duplicate/payment/status issue.' },
    { step: 'Step 3', title: 'Submit written dispute', action: 'Use official online grievance, traffic police email/desk or authorised traffic office route. Ask for written correction, cancellation, update or refund review.' },
    { step: 'Step 4', title: 'Track complaint ID', action: 'Keep the acknowledgement number and follow up after the portal/office timeline with the same proof pack.' },
    { step: 'Step 5', title: 'Escalate if unresolved', action: 'If unresolved, escalate to higher traffic authority/grievance channel with earlier complaint ID and proof index. Avoid agents promising challan removal.' }
  ]

  const safetyWarnings = [
    'Use only official traffic/e-challan/state police/transport portals. Do not click random payment or challan-removal links.',
    'Never share OTP, card PIN, CVV, UPI PIN, netbanking password or remote screen access for challan payment/dispute.',
    'Do not pay agents claiming they can delete challans unofficially. Ask for official receipt and status update only.',
    'Redact home address, phone, full ID, engine/chassis number and unrelated vehicle documents before sharing.',
    'This is guidance only. Final action must be verified with official traffic/transport authority or qualified expert.'
  ]

  const copyReadyMessage = [
    `Subject: Request for review/correction of traffic challan - ${issue.label}`,
    '',
    'Dear Traffic/E-Challan Support Team,',
    '',
    `I request review of a traffic challan issue. Issue type: ${issue.label}. Vehicle type: ${clean(input.vehicleType)}. State/city: ${clean(input.stateOrCity)}.`,
    `Challan number: ${clean(input.challanNumber)}. Challan date: ${formatDate(input.challanDate)}. Amount: ₹${amount || clean(input.amount)}. Violation shown: ${clean(input.violationClaim)}.`,
    `Payment/status: ${clean(input.paymentStatus)}. Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please verify the challan and update/correct/cancel/refund as applicable with written status')}.`,
    '',
    'I can share redacted challan screenshot, RC/ownership proof, payment receipt, location/time proof and earlier complaint ID through official channels. Please provide written status, pending action and expected resolution timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    issueLabel: issue.label,
    amount,
    daysOpen,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    escalationRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Estimated amount involved: ₹${amount}. Preserve ${issue.focus} and avoid OTP/PIN/CVV/password/random challan links.`
  }
}
