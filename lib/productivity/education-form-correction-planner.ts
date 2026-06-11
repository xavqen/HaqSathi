export type EducationFormCorrectionInput = {
  formType: string
  institutionOrPortal: string
  applicantName: string
  applicationId: string
  examOrCourse: string
  mistakeType: string
  wrongValue: string
  correctValue: string
  lastDate: string
  correctionWindow: string
  contactChannel: string
  issueSummary: string
  evidenceAvailable: string
  desiredOutcome: string
}

export const educationFormTypes = [
  { id: 'exam-form', label: 'Exam form', proofFocus: 'application printout, fee receipt, admit card if issued and correction notice', urgencyBoost: 24 },
  { id: 'scholarship-form', label: 'Scholarship form', proofFocus: 'application copy, bank/KYC proof, income/caste/domicile certificate and portal screenshot', urgencyBoost: 22 },
  { id: 'admission-form', label: 'Admission form', proofFocus: 'submitted form, payment receipt, admission notice, marksheet and identity proof', urgencyBoost: 18 },
  { id: 'certificate-form', label: 'Certificate / document form', proofFocus: 'submitted form, acknowledgement, supporting certificate and official receipt', urgencyBoost: 16 },
  { id: 'college-university-form', label: 'College / university form', proofFocus: 'student ID, form copy, fee proof, department notice and email trail', urgencyBoost: 14 },
  { id: 'government-education-form', label: 'Government education form', proofFocus: 'acknowledgement, portal screenshot, official guideline and supporting documents', urgencyBoost: 20 },
  { id: 'other', label: 'Other education form', proofFocus: 'submitted form, payment proof, official notice and correction proof', urgencyBoost: 12 }
]

export const educationMistakeTypes = [
  'Name spelling mistake',
  'Date of birth mistake',
  'Category / caste / reservation detail mistake',
  'Gender mistake',
  'Photo / signature issue',
  'Subject / course / exam center mistake',
  'Bank / scholarship detail mistake',
  'Marks / qualification detail mistake',
  'Address / contact detail mistake',
  'Payment done but form not updated',
  'Other form mistake'
]

function clean(value: string | undefined, fallback = 'not provided') {
  const v = String(value || '').trim()
  return v || fallback
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

function daysLeft(value: string) {
  const date = dateValue(value)
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

export function buildEducationFormCorrectionPlan(input: EducationFormCorrectionInput) {
  const form = educationFormTypes.find((item) => item.id === input.formType) || educationFormTypes[0]
  const daysRemaining = daysLeft(input.lastDate)
  const hasCorrectionWindow = /yes|open|available|portal|window|correction/i.test(input.correctionWindow || '')

  let urgencyScore = 35 + form.urgencyBoost
  if (daysRemaining !== null && daysRemaining <= 7) urgencyScore += 20
  if (daysRemaining !== null && daysRemaining <= 2) urgencyScore += 20
  if (!hasCorrectionWindow) urgencyScore += 12
  if (/dob|date of birth|category|caste|reservation|bank|payment|photo|signature|center/i.test(`${input.mistakeType} ${input.issueSummary}`)) urgencyScore += 12
  if (String(input.evidenceAvailable || '').length > 70) urgencyScore += 4
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 80 ? 'High urgency - act today and use official correction route first' : urgencyScore >= 60 ? 'Medium urgency - collect proof and request written correction quickly' : 'Normal urgency - organize proof and follow official instructions'

  const proofChecklist = [
    `Form-specific proof: ${form.proofFocus}.`,
    'Submitted application form / acknowledgement / registration slip / application number screenshot.',
    'Fee payment receipt, transaction ID, bank debit proof or payment success screenshot if payment is involved.',
    'Official correction notice, portal instruction, deadline screenshot and helpline/contact details from official source.',
    'Correct document proof for the correction: marksheet, Aadhaar-style ID, school record, caste/income/domicile certificate, bank proof or photo/signature file as applicable.',
    'Before/after screenshots: wrong value visible, correct proof visible, correction submission proof if available.',
    'Keep originals safe and share only redacted copies. Hide full Aadhaar/PAN, full bank account, OTP, password and private contact details.'
  ]

  const nextSteps = [
    { step: 'Step 1', title: 'Check official correction window', action: 'Open only the official portal/notice and confirm whether correction is allowed, deadline, fee and allowed fields.' },
    { step: 'Step 2', title: 'Prepare clean proof pack', action: 'Put application copy, payment proof, official notice, wrong field screenshot and correct document proof in one folder.' },
    { step: 'Step 3', title: 'Submit through official route', action: 'Use portal correction option first. If no option exists, send a calm written request to official email/helpdesk with proof.' },
    { step: 'Step 4', title: 'Save acknowledgement', action: 'After correction request, save ticket number, email sent proof, screenshot, date/time and support reply.' },
    { step: 'Step 5', title: 'Follow up safely', action: 'If deadline is close, call official helpline and send one written follow-up. Do not share OTP/password or pay unofficial agents.' }
  ]

  const safetyWarnings = [
    'Guidance only. Final correction depends on official portal/institution rules and deadline.',
    'Use only official website, official email, school/college office, exam authority or verified helpline. Avoid agents promising guaranteed correction.',
    'Never share OTP, password, UPI PIN, CVV, full Aadhaar/PAN, full bank account number or login access with anyone.',
    'For category/caste/reservation, DOB, name and bank errors, use exact document proof and do not create false documents.',
    'If deadline is over, ask for written exception/appeal route politely instead of submitting repeated duplicate forms without instructions.'
  ]

  const copyReadyMessage = [
    `Subject: Correction request for ${form.label} - ${clean(input.applicationId, 'Application ID not provided')}`,
    '',
    `Dear ${clean(input.institutionOrPortal, 'Official Support Team')},`,
    '',
    `I request your help for a correction in my ${form.label.toLowerCase()}.`,
    `Applicant name: ${clean(input.applicantName)}. Application/Registration ID: ${clean(input.applicationId)}. Exam/Course/Form: ${clean(input.examOrCourse)}.`,
    `Mistake type: ${clean(input.mistakeType)}. Wrong value submitted: ${clean(input.wrongValue)}. Correct value: ${clean(input.correctValue)}.`,
    `Last date/deadline: ${formatDate(input.lastDate)}. Correction window/status: ${clean(input.correctionWindow)}. Contact channel used: ${clean(input.contactChannel)}.`,
    `Issue summary: ${clean(input.issueSummary)}.`,
    `Evidence attached/available: ${clean(input.evidenceAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please allow correction or guide me to the official correction process and confirm the next step in writing')}.`,
    '',
    'I confirm that the correction request is genuine and I can provide supporting documents if required. Please share the official process, deadline and expected resolution timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    formLabel: form.label,
    urgencyScore,
    urgencyLevel,
    daysRemaining,
    hasCorrectionWindow,
    proofChecklist,
    nextSteps,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Use official correction route first, preserve proof and never share secrets with unofficial agents.`
  }
}
