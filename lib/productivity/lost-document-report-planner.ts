export type LostDocumentReportInput = {
  documentType: string
  lossType: string
  cityOrState: string
  lostDate: string
  placeLost: string
  documentHolder: string
  documentNumberHint: string
  policeReportStatus: string
  misuseConcern: string
  desiredOutcome: string
}

export const lostDocumentTypes = [
  { id: 'aadhaar', label: 'Aadhaar / UIDAI document', route: 'UIDAI official help route and local police lost-report route when required', proof: 'masked Aadhaar copy/e-Aadhaar, identity proof, phone/email linked proof, lost report acknowledgement if made', riskBoost: 36 },
  { id: 'pan', label: 'PAN card', route: 'official PAN reprint/correction portal and local police lost-report route when required', proof: 'PAN copy/photo if available, Aadhaar/identity proof, payment/application acknowledgement and lost report if made', riskBoost: 32 },
  { id: 'passport', label: 'Passport', route: 'Passport Seva route, local police report and passport office instruction', proof: 'passport file number/copy if available, police report acknowledgement, identity/address proof and appointment/application receipt', riskBoost: 46 },
  { id: 'driving-license', label: 'Driving License / RC / vehicle document', route: 'official Parivahan/state transport route and local police lost-report route if required', proof: 'DL/RC copy if available, application number, identity/address proof, FIR/NC/lost report if required and payment receipt', riskBoost: 30 },
  { id: 'voter-id', label: 'Voter ID / EPIC', route: 'official voter services/electoral registration route and local authority guidance', proof: 'EPIC number/copy if available, identity/address proof and application acknowledgement', riskBoost: 24 },
  { id: 'bank-card-cheque', label: 'Bank card / cheque book / passbook', route: 'official bank app/branch/customer-care blocking route first, then police report if misuse risk exists', proof: 'masked account/customer ID, bank block request ID, branch acknowledgement, transaction screenshots and police report if relevant', riskBoost: 44 },
  { id: 'certificate', label: 'Income/caste/domicile/birth/education certificate', route: 'official issuing authority/e-district/college/board duplicate certificate route', proof: 'certificate copy/application ID, identity proof, old acknowledgement and lost report/affidavit if officially required', riskBoost: 26 },
  { id: 'sim-phone', label: 'SIM / phone with documents inside', route: 'block SIM through telecom provider, secure bank/UPI accounts, then police/cyber route if misuse risk exists', proof: 'IMEI if phone lost, SIM number, complaint number, bank/UPI block proof and police/cyber acknowledgement', riskBoost: 48 },
  { id: 'other', label: 'Other important document', route: 'official issuing authority route and local police lost-report route if needed', proof: 'copy/photo if available, identity proof, application/reference numbers and lost report/affidavit if required', riskBoost: 22 }
]

export const lostDocumentIssueTypes = [
  { id: 'lost', label: 'Lost somewhere', boost: 18 },
  { id: 'stolen', label: 'Stolen / theft suspected', boost: 34 },
  { id: 'misplaced-home', label: 'Misplaced at home/office', boost: 10 },
  { id: 'wallet-lost', label: 'Wallet/bag lost with multiple documents', boost: 32 },
  { id: 'phone-lost', label: 'Phone/SIM lost with document access', boost: 36 },
  { id: 'misuse-suspected', label: 'Misuse/fraud already suspected', boost: 44 },
  { id: 'duplicate-needed', label: 'Duplicate/reissue needed urgently', boost: 24 },
  { id: 'other', label: 'Other lost document issue', boost: 14 }
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

function maskedHint(value: string) {
  const safe = clean(value, 'not provided')
  if (safe === 'not provided') return safe
  if (safe.length <= 4) return 'provided, keep masked while sharing'
  return `${safe.slice(0, 2)}***${safe.slice(-2)} (share full number only on official channel if required)`
}

export function buildLostDocumentReportPlan(input: LostDocumentReportInput) {
  const document = lostDocumentTypes.find((item) => item.id === input.documentType) || lostDocumentTypes[0]
  const issue = lostDocumentIssueTypes.find((item) => item.id === input.lossType) || lostDocumentIssueTypes[0]
  const ageInDays = daysSince(input.lostDate)

  let urgencyScore = 18 + document.riskBoost + issue.boost
  if (ageInDays !== null && ageInDays <= 1) urgencyScore += 10
  if (ageInDays !== null && ageInDays >= 7) urgencyScore += 5
  if (/misuse|fraud|loan|bank|upi|sim|passport|stolen|theft|transaction|unknown/i.test(`${input.misuseConcern} ${input.policeReportStatus}`)) urgencyScore += 16
  if (/urgent|exam|travel|job|bank|loan|verification|deadline/i.test(input.desiredOutcome || '')) urgencyScore += 8
  urgencyScore = Math.min(100, urgencyScore)

  const urgencyLevel = urgencyScore >= 85 ? 'High urgency - block misuse routes and make official report/follow-up immediately' : urgencyScore >= 65 ? 'Medium urgency - create lost report proof and start duplicate/reissue route' : 'Normal urgency - document the loss and prepare official duplicate/reissue request'

  const proofChecklist = [
    `Document-specific proof: ${document.proof}.`,
    'Loss details: date, approximate time, place, route travelled, bag/wallet/phone details and any witness/CCTV/helpdesk note if available.',
    'Identity proof: keep one alternate ID proof for official duplicate/reissue application.',
    'Report proof: police e-FIR/NC/lost report/GD diary acknowledgement if required by your state/authority.',
    'Misuse protection proof: bank/card/SIM/UPI block request ID, cyber complaint ID or support ticket if misuse risk exists.',
    'Replacement proof: duplicate/reissue application acknowledgement, payment receipt and appointment/reference number.',
    'Safe sharing copy: mask full document number, QR/barcode, address, phone/email, account/card numbers and family data when sharing outside official channels.'
  ]

  const actionRoute = [
    { step: 'Step 1', title: 'Secure misuse risk first', action: 'If document/card/SIM/phone can be misused, block SIM/cards/accounts/access through official provider apps, helplines or branch before public follow-up.' },
    { step: 'Step 2', title: 'Create loss record', action: 'Write exact date, place, document name, holder name and any document number hint. Keep full numbers private except on official forms.' },
    { step: 'Step 3', title: 'File report if required', action: 'Use official police/e-FIR/NC/lost-report route where required. Keep acknowledgement number and screenshot/PDF safely.' },
    { step: 'Step 4', title: 'Start duplicate/reissue', action: `Use ${document.route}. Follow only official portal/office/branch instructions for duplicate, reprint or replacement.` },
    { step: 'Step 5', title: 'Track and follow up', action: 'If duplicate/reissue is delayed, send a written follow-up with report acknowledgement, application ID and proof index.' }
  ]

  const safetyWarnings = [
    'Do not post full Aadhaar, PAN, passport, bank account, card, DL/RC, QR/barcode or certificate number publicly.',
    'Never share OTP, password, UPI PIN, CVV, remote screen access or SIM swap codes with anyone claiming to help recover documents.',
    'If phone/SIM/bank card is lost, block access first through official provider routes before waiting for replies.',
    'Avoid random agents, WhatsApp numbers, sponsored duplicate-document links and unofficial payment links.',
    'This is guidance only. Police report, affidavit, duplicate fee and required proof depend on the official authority and local rules.'
  ]

  const copyReadyMessage = [
    `Subject: Lost document report and duplicate/reissue request for ${document.label}`,
    '',
    'Dear Support/Helpdesk Team,',
    '',
    `I request guidance/status for lost document duplicate/reissue. Document type: ${document.label}. Issue type: ${issue.label}.`,
    `Document holder: ${clean(input.documentHolder)}. City/state: ${clean(input.cityOrState)}. Date lost: ${formatDate(input.lostDate)}. Place lost: ${clean(input.placeLost)}.`,
    `Document number hint: ${maskedHint(input.documentNumberHint)}. Police/lost report status: ${clean(input.policeReportStatus)}.`,
    `Misuse concern/action already taken: ${clean(input.misuseConcern)}. Requested outcome: ${clean(input.desiredOutcome, 'Please share the exact duplicate/reissue process, missing proof if any, and expected timeline in writing')}.`,
    '',
    'I can share redacted proof, report acknowledgement, block request ID, application receipt and identity proof only through the official channel. Please confirm the next official step and expected timeline.',
    '',
    'Regards,'
  ].join('\n')

  return {
    documentLabel: document.label,
    issueLabel: issue.label,
    ageInDays,
    urgencyScore,
    urgencyLevel,
    proofChecklist,
    actionRoute,
    safetyWarnings,
    copyReadyMessage,
    summary: `${urgencyLevel}. Use ${document.route}. Keep full document numbers private and block SIM/card/bank access first if misuse risk exists.`
  }
}
