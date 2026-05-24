import type { BankEscalationInput, ConsumerForumPackInput, EvidencePackInput, LegalNoticeInput, OmbudsmanPlannerInput, RtiHelperInput } from '@/lib/validators/advanced-tools'

const disclaimer = 'Disclaimer: Ye draft guidance ke liye hai, legal advice nahi. Submit karne se pehle facts, dates, official portal/rules aur professional advice verify karein.'

function rupee(amount?: string) {
  return amount?.trim() ? `₹${amount.trim()}` : 'Not specified'
}

function line(value?: string, fallback = 'Not specified') {
  return value?.trim() || fallback
}

export function buildLegalNoticeDraft(input: LegalNoticeInput) {
  const days = input.responseDays?.trim() || '15'
  const subject = `Notice-style draft regarding ${input.issueType}`
  const draft = `To,\n${input.recipientName}\n${line(input.recipientAddress)}\n\nSubject: ${subject}\n\nDear Sir/Madam,\n\nI, ${input.senderName}, am recording this grievance regarding ${input.issueType}. Reference ID: ${line(input.referenceId)}. Amount involved: ${rupee(input.amount)}. Issue date: ${line(input.issueDate)}.\n\nFacts of the matter:\n${input.facts}\n\nRequested resolution:\n${input.demand}\n\nYou are requested to review the matter and provide a written response within ${days} days. If the issue remains unresolved, I may use the appropriate grievance redressal mechanism after verifying the correct official process.\n\nRegards,\n${input.senderName}\n${line(input.senderAddress, '')}\n\n${disclaimer}`
  return {
    title: subject,
    draft,
    checklist: ['Invoice/payment proof', 'Order/transaction/reference ID', 'Support chat/email screenshots', 'Date-wise timeline', 'Identity/contact proof only if required by official channel'],
    nextSteps: ['Verify recipient/grievance email from official website', 'Attach only relevant proof', `Set follow-up reminder after ${days} days`, 'Do not share OTP/password/PIN in any complaint'],
    disclaimer
  }
}

export function buildRtiDraft(input: RtiHelperInput) {
  const questions = input.questions.split('\n').map((q) => q.trim()).filter(Boolean)
  const questionLines = questions.length ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n') : `1. Please provide information regarding ${input.topic}.`
  const draft = `To,\nThe Public Information Officer,\n${input.department}\n${input.state ? `${input.state}\n` : ''}\nSubject: Application under RTI Act for information regarding ${input.topic}\n\nSir/Madam,\n\nI, ${input.applicantName}, request the following information${input.period ? ` for the period ${input.period}` : ''}:\n\n${questionLines}\n\nApplicant details:\nName: ${input.applicantName}\nAddress: ${line(input.applicantAddress)}\n\nI request that the information be provided as per applicable RTI rules.\n\nRegards,\n${input.applicantName}\n\n${disclaimer}`
  return {
    title: `RTI draft for ${input.topic}`,
    draft,
    checklist: ['Applicant name and address', 'Clear department/PIO name if available', 'Specific questions only', 'Fee/payment mode as per official portal', 'ID proof only if required'],
    nextSteps: ['Keep questions factual, not arguments', 'Submit through correct central/state RTI portal or office', 'Save acknowledgement number', 'Track reply deadline as per applicable rules'],
    disclaimer
  }
}

export function buildConsumerForumPack(input: ConsumerForumPackInput) {
  const summary = `Complainant: ${input.complainantName}\nOpposite Party: ${input.oppositeParty}\nProduct/Service: ${input.productOrService}\nAmount: ${rupee(input.amount)}\nPurchase Date: ${line(input.purchaseDate)}\n\nIssue Summary:\n${input.issueSummary}\n\nRelief Requested:\n${input.reliefRequested}`
  const affidavitSkeleton = `I, ${input.complainantName}, state that the facts mentioned in my complaint summary are true to the best of my knowledge and based on available records.\n\nPlace: ______\nDate: ______\nSignature: ______\n\n${disclaimer}`
  return {
    title: `Consumer complaint pack - ${input.oppositeParty}`,
    complaintSummary: summary,
    affidavitSkeleton,
    evidenceIndex: [
      'Annexure A: Invoice/order receipt/payment proof',
      'Annexure B: Product/service screenshots/photos',
      'Annexure C: Support chat/email/call logs',
      'Annexure D: Refund/return/complaint acknowledgement',
      'Annexure E: Bank statement or UPI receipt if payment dispute'
    ],
    nextSteps: ['Verify jurisdiction and official filing process', 'Number every evidence file', 'Keep one-page timeline', 'Avoid exaggerated claims; write facts clearly'],
    disclaimer
  }
}

export function buildBankEscalationPlan(input: BankEscalationInput) {
  const days = Number(input.daysPending || '0') || 0
  const urgent = /fraud|unauthori|upi|scam/i.test(input.issueType + ' ' + input.issueSummary)
  const stage = urgent ? 'URGENT_BANK_AND_CYBER_FIRST' : days >= 30 ? 'ESCALATE_TO_GRIEVANCE_OR_OMBUDSMAN_READY' : days >= 7 ? 'FOLLOW_UP_WITH_BANK_GRIEVANCE' : 'WAIT_AND_DOCUMENT'
  const draft = `Subject: Escalation request for ${input.issueType}\n\nDear ${input.bankName} Team,\n\nI am escalating my issue regarding ${input.issueType}. Complaint/Reference ID: ${line(input.complaintId)}. Account hint: ${line(input.accountHint)}. Amount: ${rupee(input.amount)}. Pending days: ${days || 'Not specified'}.\n\nIssue summary:\n${input.issueSummary}\n\nPrevious response from bank:\n${line(input.bankResponse, 'No satisfactory written response received.')}\n\nPlease investigate and provide a written response with resolution timeline.\n\n${urgent ? 'Since this may involve fraud/unauthorised transaction, please block/secure affected channels as per official process and share acknowledgement immediately.\n\n' : ''}Regards,\nCustomer\n\n${disclaimer}`
  return {
    stage,
    draft,
    actions: urgent
      ? ['Contact bank emergency support immediately', 'Block card/UPI/netbanking if needed', 'Report cyber fraud through official emergency channel', 'Save acknowledgement numbers']
      : ['Send written escalation to bank grievance channel', 'Attach complaint ID and proof', 'Wait official response timeline', 'Escalate only through official regulator/ombudsman channel after eligibility'],
    checklist: ['Bank statement', 'Transaction proof', 'Complaint acknowledgement', 'Screenshots of app/support response', 'Date-wise timeline'],
    disclaimer
  }
}

export function buildEvidencePack(input: EvidencePackInput) {
  const rawEvidence = input.evidenceList?.split('\n').map((x) => x.trim()).filter(Boolean) || []
  const evidence = rawEvidence.length ? rawEvidence : ['Payment/order proof', 'Support communication screenshots', 'ID/reference number', 'Timeline notes']
  const coverNote = `Case: ${input.caseTitle}\nCategory: ${input.category}\nReference ID: ${line(input.referenceId)}\nAmount: ${rupee(input.amount)}\n\nTimeline:\n${line(input.timeline)}\n\nNotes:\n${line(input.notes)}\n\nEvidence Index:\n${evidence.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n${disclaimer}`
  return {
    coverNote,
    evidenceIndex: evidence.map((name, index) => ({ number: index + 1, name, fileNameSuggestion: `Annexure-${String(index + 1).padStart(2, '0')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'proof'}` })),
    folderStructure: ['01-cover-note.txt', '02-timeline.txt', '03-payment-proof', '04-support-communication', '05-other-evidence'],
    nextSteps: ['Rename files according to annexure number', 'Keep originals unchanged', 'Make PDF copies for upload', 'Never upload OTP/PIN/password screenshots'],
    disclaimer
  }
}


export function buildOmbudsmanPlanner(input: OmbudsmanPlannerInput) {
  const hasOldComplaint = Boolean(input.complaintId?.trim())
  const draft = `Subject: Request for escalation/ombudsman review regarding ${input.issueType}

Dear Sir/Madam,

I request guidance/escalation for my complaint against ${input.institutionName} regarding ${input.issueType}.

Complaint/reference ID: ${line(input.complaintId)}
Original complaint date: ${line(input.complaintDate)}
Amount involved: ${rupee(input.amount)}

Current status:
${input.currentStatus}

Relief requested:
${input.reliefRequested}

Documents/evidence available:
${line(input.documentsAvailable)}

I request a written response and next steps as per the applicable grievance redressal mechanism.

${disclaimer}`

  return {
    title: `Ombudsman/escalation plan - ${input.institutionName}`,
    eligibilityCheck: [
      hasOldComplaint ? 'Existing complaint/reference ID available.' : 'First submit written complaint to company/bank/grievance channel and save acknowledgement.',
      'Check official ombudsman/regulator eligibility and waiting period before filing.',
      'Use only official portals or verified addresses.'
    ],
    draft,
    checklist: ['Original complaint acknowledgement', 'Transaction/order/account reference', 'All written replies', 'Evidence screenshots/PDFs', 'One-page timeline', 'Relief amount/calculation if money claim'],
    timelinePlan: ['Day 0: Submit/verify primary complaint acknowledgement', 'Day 7-15: Follow up in writing', 'After official waiting period: escalate through correct ombudsman/regulator portal', 'Keep every acknowledgement number saved'],
    safeWarnings: ['Do not share OTP, PIN, password or full card number.', 'Do not pay agents claiming guaranteed refund.', 'Official eligibility/timelines can change; verify before submission.'],
    disclaimer
  }
}
