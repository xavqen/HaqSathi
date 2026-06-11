export type IdentityDocumentCorrectionInput = {
  documentType: string
  correctionType: string
  currentValue: string
  correctValue: string
  stateOrAuthority: string
  applicationNumber: string
  deadlineDate: string
  proofAvailable: string
  submissionStatus: string
  desiredOutcome: string
}

export const identityDocumentTypes = [
  { id: 'aadhaar', label: 'Aadhaar / UIDAI record', route: 'UIDAI update route or official Aadhaar Seva Kendra', proof: 'Aadhaar copy, proof of identity/address/date of birth as applicable, update request slip if already submitted', riskBoost: 34 },
  { id: 'pan', label: 'PAN card / income tax record', route: 'official PAN correction route through authorised portal/service provider', proof: 'PAN copy, Aadhaar/identity proof, name/DOB proof and application acknowledgement', riskBoost: 32 },
  { id: 'voter-id', label: 'Voter ID / electoral roll', route: 'official voter services/electoral registration route', proof: 'EPIC/Voter ID, address proof, age/name proof and form acknowledgement', riskBoost: 24 },
  { id: 'passport', label: 'Passport record', route: 'official Passport Seva route or passport office instruction', proof: 'passport file number, old/new proof, appointment/application acknowledgement and police verification status if relevant', riskBoost: 36 },
  { id: 'driving-license', label: 'Driving License / transport record', route: 'official Parivahan/state transport route', proof: 'DL copy, application number, identity/address/DOB proof and payment/application receipt', riskBoost: 26 },
  { id: 'ration-card', label: 'Ration card / family record', route: 'official state food/civil supplies route', proof: 'ration card copy, family member proof, address proof and application acknowledgement', riskBoost: 22 },
  { id: 'certificate', label: 'Income/caste/domicile/birth certificate', route: 'official state e-district/CSC/tehsil/municipality route', proof: 'certificate copy/application ID, supporting documents and correction reason proof', riskBoost: 28 },
  { id: 'bank-kyc', label: 'Bank KYC record', route: 'official bank branch/netbanking/app support route only', proof: 'masked account/customer ID, KYC document, branch acknowledgement and update request proof', riskBoost: 30 },
  { id: 'other', label: 'Other identity/document record', route: 'official issuing authority route only', proof: 'current document copy, correction proof, application acknowledgement and written support response', riskBoost: 18 }
]

export const identityCorrectionTypes = [
  { id: 'name-spelling', label: 'Name spelling / order mismatch', boost: 20 },
  { id: 'dob-age', label: 'Date of birth / age mismatch', boost: 28 },
  { id: 'address', label: 'Address correction', boost: 16 },
  { id: 'gender', label: 'Gender correction', boost: 18 },
  { id: 'mobile-email', label: 'Mobile/email update issue', boost: 22 },
  { id: 'photo-signature', label: 'Photo/signature mismatch', boost: 18 },
  { id: 'father-mother-spouse', label: 'Father/mother/spouse name mismatch', boost: 22 },
  { id: 'application-stuck', label: 'Correction submitted but stuck/rejected', boost: 26 },
  { id: 'other', label: 'Other correction issue', boost: 14 }
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

export function buildIdentityDocumentCorrectionPlan(input: IdentityDocumentCorrectionInput) {
  const document = identityDocumentTypes.find((item) => item.id === input.documentType) || identityDocumentTypes[0]
  const correction = identityCorrectionTypes.find((item) => item.id === input.correctionType) || identityCorrectionTypes[0]
  const daysLeft = daysUntil(input.deadlineDate)

  let urgencyScore = 18 + document.riskBoost + correction.boost
  if (daysLeft !== null && daysLeft <= 30) urgencyScore += 8
  if (daysLeft !== null && daysLeft <= 10) urgencyScore += 14
  if (daysLeft !== null && daysLeft < 0) urgencyScore += 18
  if (/rejected|stuck|urgent|exam|scholarship|passport|bank|kyc|deadline|blocked/i.test(`${input.submissionStatus} ${input.desiredOutcome}`)) urgencyScore += 10
  if ((input.proofAvailable || '').length > 80) urgencyScore += 3
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 82 ? 'High urgency - verify official correction route and submit/follow up quickly' : urgencyScore >= 62 ? 'Medium urgency - prepare proof pack and submit written correction request' : 'Normal urgency - collect proof, compare records and use official correction route'

  const proofChecklist = [
    `Document-specific proof: ${document.proof}.`,
    `Correction proof: clear proof for ${correction.label}, such as school certificate, birth certificate, passport, Aadhaar/PAN, address proof, gazette/affidavit if officially required, or authority-issued record.`,
    'Current document copy: keep a clear copy of the record showing the wrong value, with full ID numbers redacted when sharing outside official channel.',
    'Correct value proof: keep the document showing the exact correct spelling/date/address/detail. Avoid mixing different spellings across proofs.',
    'Application proof: acknowledgement number, application/reference ID, payment receipt and rejection/status screenshot if already submitted.',
    'Communication proof: official support email/SMS, branch/office visit note, helpdesk ticket or correction centre acknowledgement.',
    'Safety copy: hide OTP, password, full Aadhaar/PAN/passport/account number, QR code, barcode, full address and unrelated family data before sharing publicly.'
  ]

  const officialRoute = [
    { step: 'Step 1', title: 'Compare records carefully', action: 'Write the current wrong value and exact correct value. Confirm spelling, date format and address order from official proof documents.' },
    { step: 'Step 2', title: 'Use official route only', action: `Use ${document.route}. Do not use agents, random WhatsApp numbers or sponsored correction links.` },
    { step: 'Step 3', title: 'Submit proof pack', action: 'Upload/share only documents required by the official route. Keep acknowledgement number, payment receipt and status screenshot.' },
    { step: 'Step 4', title: 'Track and follow up', action: 'If status is pending/rejected, send a written request with application number, correction reason and proof index.' },
    { step: 'Step 5', title: 'Escalate safely', action: 'If unresolved after the official timeline, escalate to the issuing authority grievance/helpdesk with earlier acknowledgement details.' }
  ]

  const safetyWarnings = [
    'Use only official portals, official centres, bank branch/app or issuing authority channels for identity corrections.',
    'Never share OTP, password, full Aadhaar/PAN/passport/account number, CVV, UPI PIN or remote screen access for document correction.',
    'Do not send full identity documents to random WhatsApp/Telegram agents promising instant correction.',
    'Redact QR codes, barcodes, full ID numbers, full address and unrelated family details before sharing samples publicly.',
    'This tool gives guidance only. Final correction rules, documents, fees and timelines must be verified with the official issuing authority.'
  ]

  const copyReadyMessage = [
    `Subject: Request for correction/update in ${document.label}`,
    '',
    'Dear Support/Helpdesk Team,',
    '',
    `I request correction/update in my ${document.label}. Correction type: ${correction.label}. Authority/state/office: ${clean(input.stateOrAuthority)}.`,
    `Application/reference number: ${clean(input.applicationNumber)}. Deadline/required-by date: ${formatDate(input.deadlineDate)}.`,
    `Current value shown: ${clean(input.currentValue)}. Correct value requested: ${clean(input.correctValue)}.`,
    `Submission/status details: ${clean(input.submissionStatus)}. Proof available: ${clean(input.proofAvailable)}.`,
    `Requested outcome: ${clean(input.desiredOutcome, 'Please verify the proof documents and update/correct the record or share the exact missing requirement in writing')}.`,
    '',
    'I can share redacted copies of the current document, correct proof document, acknowledgement/payment receipt and earlier status screenshot through the official channel. Please provide written status, missing requirement if any, and expected resolution timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    documentLabel: document.label,
    correctionLabel: correction.label,
    daysLeft,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    officialRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Use ${document.route}. Keep proof for ${correction.label} and never share OTP/password/full ID details with agents or random links.`
  }
}
