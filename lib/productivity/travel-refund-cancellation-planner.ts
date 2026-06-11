export type TravelRefundPlannerInput = {
  bookingType: string
  issueType: string
  platformOrProvider: string
  passengerOrGuestName: string
  bookingId: string
  journeyOrStayDate: string
  cancellationDate: string
  amountPaid: string
  refundReceived: string
  promisedRefundDate: string
  cancellationReason: string
  providerResponse: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const travelBookingTypes = [
  { id: 'train', label: 'Train ticket', proofFocus: 'PNR/ticket, cancellation screenshot, refund rule screenshot and bank/UPI statement', urgencyBoost: 16 },
  { id: 'flight', label: 'Flight ticket', proofFocus: 'PNR/e-ticket, airline/app cancellation proof, fare rules, refund status screenshot and payment proof', urgencyBoost: 24 },
  { id: 'bus', label: 'Bus ticket', proofFocus: 'ticket ID, operator/app cancellation proof, boarding point/time proof and payment proof', urgencyBoost: 14 },
  { id: 'hotel', label: 'Hotel booking', proofFocus: 'booking voucher, cancellation policy screenshot, hotel/app chat and payment proof', urgencyBoost: 18 },
  { id: 'cab', label: 'Cab / taxi booking', proofFocus: 'trip receipt, cancellation/no-show charge screenshot, route/time proof and payment proof', urgencyBoost: 12 },
  { id: 'package', label: 'Travel package / tour', proofFocus: 'invoice, itinerary, cancellation terms, chat/email trail and payment proof', urgencyBoost: 22 },
  { id: 'visa-service', label: 'Visa / travel service', proofFocus: 'service invoice, application acknowledgement, promised timeline and communication trail', urgencyBoost: 20 },
  { id: 'other', label: 'Other travel booking', proofFocus: 'booking receipt, cancellation terms, payment proof and written support trail', urgencyBoost: 12 }
]

export const travelIssueTypes = [
  'Refund delayed after cancellation',
  'Refund less than expected',
  'Booking cancelled by provider',
  'Wrong cancellation charge applied',
  'No-show charge disputed',
  'Duplicate booking/payment',
  'Service not provided',
  'Wrong date/name/route issue',
  'Hotel denied check-in',
  'Flight/train/bus delay or cancellation',
  'Other travel refund issue'
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
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
}

function daysUntil(value: string) {
  const date = dateValue(value)
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

function formatDate(value: string) {
  const date = dateValue(value)
  if (!date) return clean(value)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildTravelRefundCancellationPlan(input: TravelRefundPlannerInput) {
  const booking = travelBookingTypes.find((item) => item.id === input.bookingType) || travelBookingTypes[0]
  const paid = money(input.amountPaid)
  const received = money(input.refundReceived)
  const pending = Math.max(0, paid - received)
  const daysAfterCancellation = daysSince(input.cancellationDate)
  const daysToPromisedRefund = daysUntil(input.promisedRefundDate)

  let urgencyScore = 30 + booking.urgencyBoost
  if (pending >= 1000) urgencyScore += 10
  if (pending >= 10000) urgencyScore += 12
  if (daysAfterCancellation !== null && daysAfterCancellation >= 7) urgencyScore += 10
  if (daysAfterCancellation !== null && daysAfterCancellation >= 15) urgencyScore += 12
  if (daysToPromisedRefund !== null && daysToPromisedRefund < 0) urgencyScore += 12
  if (/duplicate|denied|cancelled by provider|service not provided|less than expected|wrong charge|no-show/i.test(`${input.issueType} ${input.cancellationReason} ${input.providerResponse}`)) urgencyScore += 12
  if (String(input.evidenceAvailable || '').length > 80) urgencyScore += 4
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 80 ? 'High urgency - ask for written refund timeline and escalate with proof' : urgencyScore >= 60 ? 'Medium urgency - organize proof and send a clear refund follow-up' : 'Normal urgency - verify policy and keep written records'

  const proofChecklist = [
    `Booking proof: ${booking.proofFocus}.`,
    'Payment proof: transaction ID, UPI/bank/card statement, invoice/receipt and payment success screenshot.',
    'Cancellation/refund proof: cancellation confirmation, refund status screenshot, cancellation charge calculation and promised refund date.',
    'Policy proof: fare rules, cancellation policy, refund timeline, app terms or provider email/notice valid at booking time.',
    'Communication proof: support chat, email, call log, complaint ticket number, hotel/airline/operator response and dates.',
    'Service issue proof where applicable: denied check-in proof, delay/cancellation notice, no-show dispute proof, duplicate booking screenshots or route/date mismatch proof.',
    'Redacted sharing copy: hide full card number, CVV, OTP, full bank account, login access, passport full number and unnecessary personal details.'
  ]

  const escalationRoute = [
    { step: 'Step 1', title: 'Verify refund policy', action: 'Compare the booking/cancellation date with the official refund/cancellation policy and promised timeline.' },
    { step: 'Step 2', title: 'Send written refund follow-up', action: 'Send the copy-ready message with booking ID, amount paid, refund received, pending amount and proof list.' },
    { step: 'Step 3', title: 'Ask for written calculation', action: 'If refund is less, ask for exact breakup: base fare, tax, convenience fee, cancellation fee and payment gateway refund status.' },
    { step: 'Step 4', title: 'Escalate to provider/app nodal route', action: 'If no response, escalate through app grievance/email/helpdesk with ticket number and proof pack.' },
    { step: 'Step 5', title: 'Bank/payment dispute only when valid', action: 'For duplicate payment, no service, wrong debit or failed refund, ask bank/payment app about dispute/chargeback route with proof.' }
  ]

  const safetyWarnings = [
    'Guidance only. Final refund depends on provider policy, booking terms, official rules and payment status.',
    'Never share OTP, CVV, card PIN, UPI PIN, password, full bank account, passport scan or screen-share access for refund.',
    'Do not pay extra fee to unofficial agents for faster refund, ticket cancellation or travel compensation.',
    'For travel documents/passport/visa details, share only required redacted copies with official provider channels.',
    'Keep tone factual and calm. False claims can weaken your case and may violate provider terms.'
  ]

  const copyReadyMessage = [
    `Subject: Refund/cancellation follow-up for ${booking.label} - ${clean(input.bookingId, 'Booking ID not provided')}`,
    '',
    `Dear ${clean(input.platformOrProvider, 'Support Team')},`,
    '',
    `I request a written update and resolution for my ${booking.label.toLowerCase()} refund/cancellation issue.`,
    `Passenger/guest/name on booking: ${clean(input.passengerOrGuestName)}. Booking/PNR/Trip ID: ${clean(input.bookingId)}.`,
    `Issue type: ${clean(input.issueType)}. Journey/stay/service date: ${formatDate(input.journeyOrStayDate)}. Cancellation/request date: ${formatDate(input.cancellationDate)}.`,
    `Amount paid: ₹${paid || clean(input.amountPaid)}. Refund received so far: ₹${received || clean(input.refundReceived, '0')}. Pending/ disputed amount: ₹${pending}.`,
    `Promised refund date/timeline: ${formatDate(input.promisedRefundDate)}.`,
    `Reason/context: ${clean(input.cancellationReason)}. Provider response so far: ${clean(input.providerResponse)}.`,
    `Evidence available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please process the pending refund or share the exact refund calculation and expected resolution timeline in writing')}.`,
    '',
    'Please confirm the refund status, breakup of deductions if any, and the expected date of credit. I am attaching/ready to share relevant booking, cancellation and payment proof.',
    '',
    'Regards,'
  ].join('\n')

  return {
    bookingLabel: booking.label,
    pendingAmount: pending,
    daysAfterCancellation,
    daysToPromisedRefund,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    escalationRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Pending/disputed amount estimate: ₹${pending}. Preserve booking, cancellation, policy and payment proof.`
  }
}
