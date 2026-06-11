export type DocumentUrgency = 'EXPIRED' | 'URGENT' | 'SOON' | 'SAFE' | 'NO_EXPIRY'

export type DocumentExpiryType = {
  id: string
  label: string
  category: 'Identity' | 'Vehicle' | 'Education' | 'Money' | 'Family' | 'Other'
  renewalLeadDays: number
  defaultValidityYears?: number
  officialRoute: string
  warning: string
  checklist: string[]
}

export type DocumentRenewalPlan = {
  type: DocumentExpiryType
  expiryDate: string
  daysLeft: number
  urgency: DocumentUrgency
  renewalStartDate: string
  firstReminderDate: string
  secondReminderDate: string
  finalReminderDate: string
  headline: string
  nextActions: string[]
  privacyWarnings: string[]
}

export const documentExpiryTypes: DocumentExpiryType[] = [
  {
    id: 'passport',
    label: 'Passport',
    category: 'Identity',
    renewalLeadDays: 270,
    defaultValidityYears: 10,
    officialRoute: 'Passport Seva / official passport portal only',
    warning: 'Do not share passport scan, file number, date of birth or address publicly. Use official portal for renewal slots and police verification updates.',
    checklist: ['Old passport', 'Address proof if changed', 'Identity proof', 'Photo/signature as portal requires', 'Appointment/payment receipt']
  },
  {
    id: 'driving-license',
    label: 'Driving License',
    category: 'Vehicle',
    renewalLeadDays: 180,
    defaultValidityYears: 20,
    officialRoute: 'Parivahan / state transport department portal',
    warning: 'Avoid agents asking for OTP, password, full Aadhaar/PAN scan on WhatsApp or extra unofficial fees.',
    checklist: ['Old driving license', 'Age/address proof', 'Medical certificate if required', 'Photo/signature', 'Official fee receipt']
  },
  {
    id: 'vehicle-insurance',
    label: 'Vehicle Insurance',
    category: 'Vehicle',
    renewalLeadDays: 30,
    defaultValidityYears: 1,
    officialRoute: 'Insurer app/site or verified policy platform',
    warning: 'Verify policy number, insurer domain and payment receipt. Never buy policy from unknown links sent by SMS/WhatsApp.',
    checklist: ['Existing policy number', 'Vehicle RC', 'Previous claim details', 'Inspection photos if asked officially', 'Payment receipt']
  },
  {
    id: 'pollution-certificate',
    label: 'PUC / Pollution Certificate',
    category: 'Vehicle',
    renewalLeadDays: 15,
    defaultValidityYears: 1,
    officialRoute: 'Authorized PUC center / transport system',
    warning: 'Use authorized centers and keep the receipt/certificate copy safely.',
    checklist: ['Vehicle number', 'RC copy if asked', 'Old PUC certificate', 'Fee receipt']
  },
  {
    id: 'income-certificate',
    label: 'Income Certificate',
    category: 'Education',
    renewalLeadDays: 45,
    defaultValidityYears: 1,
    officialRoute: 'State e-district / service plus / official local portal',
    warning: 'Certificate validity differs by scheme/state. Confirm current form rules before upload.',
    checklist: ['Applicant ID proof', 'Parent/guardian income proof', 'Residence proof', 'Photo', 'Previous certificate if available']
  },
  {
    id: 'caste-certificate',
    label: 'Caste / Category Certificate',
    category: 'Education',
    renewalLeadDays: 90,
    officialRoute: 'State e-district / local authority portal',
    warning: 'Some certificates do not expire but forms may demand recent verification. Check official form instructions.',
    checklist: ['Applicant ID proof', 'Family caste proof if needed', 'Residence proof', 'Photo', 'Application acknowledgement']
  },
  {
    id: 'domicile-certificate',
    label: 'Domicile / Residence Certificate',
    category: 'Education',
    renewalLeadDays: 60,
    officialRoute: 'State e-district / local authority portal',
    warning: 'Do not upload private document scans to unknown sites. Use official portals or verified CSC only.',
    checklist: ['Residence proof', 'Applicant ID proof', 'Guardian proof if minor', 'Photo', 'Old certificate if available']
  },
  {
    id: 'bank-kyc',
    label: 'Bank KYC Review',
    category: 'Money',
    renewalLeadDays: 30,
    officialRoute: 'Bank branch, official bank app or official bank website',
    warning: 'Bank never needs UPI PIN, OTP, CVV or full password for KYC. Beware of KYC update scam links.',
    checklist: ['Official bank notice', 'PAN/Aadhaar as bank requires', 'Address proof if changed', 'Branch/app acknowledgement']
  },
  {
    id: 'scholarship-docs',
    label: 'Scholarship Document Set',
    category: 'Education',
    renewalLeadDays: 45,
    defaultValidityYears: 1,
    officialRoute: 'Scholarship portal / school-college notice / official scheme page',
    warning: 'Scholarship deadlines can close early. Keep income/caste/domicile, bank and marksheet files ready before portal rush.',
    checklist: ['Income certificate', 'Caste/category certificate if applicable', 'Domicile/residence proof', 'Bank passbook', 'Marksheet', 'Photo/signature']
  }
]

const dayMs = 24 * 60 * 60 * 1000

export function formatPlannerDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function clampReminder(expiry: Date, daysBefore: number) {
  return addDays(expiry, -Math.max(daysBefore, 0))
}

export function findDocumentExpiryType(id: string) {
  return documentExpiryTypes.find((item) => item.id === id) || documentExpiryTypes[0]
}

export function getDocumentUrgency(daysLeft: number, leadDays: number): DocumentUrgency {
  if (daysLeft < 0) return 'EXPIRED'
  if (daysLeft <= 15) return 'URGENT'
  if (daysLeft <= leadDays) return 'SOON'
  return 'SAFE'
}

export function buildDocumentRenewalPlan(typeId: string, expiryInput: string, now = new Date()): DocumentRenewalPlan | null {
  const type = findDocumentExpiryType(typeId)
  const expiry = new Date(`${expiryInput}T00:00:00`)
  if (!expiryInput || Number.isNaN(expiry.getTime())) return null

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysLeft = Math.ceil((expiry.getTime() - startOfToday.getTime()) / dayMs)
  const urgency = getDocumentUrgency(daysLeft, type.renewalLeadDays)
  const renewalStart = clampReminder(expiry, type.renewalLeadDays)
  const firstReminder = clampReminder(expiry, Math.min(type.renewalLeadDays, 90))
  const secondReminder = clampReminder(expiry, Math.min(type.renewalLeadDays, 30))
  const finalReminder = clampReminder(expiry, 7)

  const headline = urgency === 'EXPIRED'
    ? `${type.label} already expired ${Math.abs(daysLeft)} day(s) ago.`
    : urgency === 'URGENT'
      ? `${type.label} expires in ${daysLeft} day(s). Treat this as urgent.`
      : urgency === 'SOON'
        ? `${type.label} renewal window is active. ${daysLeft} day(s) left.`
        : `${type.label} looks safe for now. ${daysLeft} day(s) left.`

  const nextActions = [
    `Open only: ${type.officialRoute}.`,
    `Start collecting: ${type.checklist.slice(0, 3).join(', ')}${type.checklist.length > 3 ? '...' : ''}`,
    `Save proof: application acknowledgement, payment receipt and official status screenshot.`,
    `Set reminders on ${formatPlannerDate(firstReminder)}, ${formatPlannerDate(secondReminder)} and ${formatPlannerDate(finalReminder)}.`
  ]

  return {
    type,
    expiryDate: formatPlannerDate(expiry),
    daysLeft,
    urgency,
    renewalStartDate: formatPlannerDate(renewalStart),
    firstReminderDate: formatPlannerDate(firstReminder),
    secondReminderDate: formatPlannerDate(secondReminder),
    finalReminderDate: formatPlannerDate(finalReminder),
    headline,
    nextActions,
    privacyWarnings: [
      type.warning,
      'Never share OTP, password, UPI PIN, CVV, full card/bank details or raw ID documents with unknown agents.',
      'This planner gives reminders and checklist only. Always verify latest rules on the official portal.'
    ]
  }
}
