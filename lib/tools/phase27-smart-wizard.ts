import type { SmartComplaintWizardInput, SmartComplaintWizardResult } from '@/lib/validators/phase27'
import { buildLanguageInstruction, getLanguageLabel } from '@/lib/i18n/languages'

const disclaimer = 'Guidance only. HaqSathi AI legal/financial/government authority nahi hai. Official portal, bank/company terms aur latest rules verify karein. Fraud case me official emergency channels ko priority dein. OTP/PIN/password kabhi share na karein.'

function hasAny(text: string, words: string[]) {
  const lower = text.toLowerCase()
  return words.some((word) => lower.includes(word.toLowerCase()))
}

function line(value?: string) {
  return value?.trim() || 'Not provided'
}

function scorePart(ok: boolean, points: number) {
  return ok ? points : 0
}

export function buildSmartComplaintPlan(input: SmartComplaintWizardInput): SmartComplaintWizardResult {
  const merged = `${input.issueType} ${input.companyName || ''} ${input.referenceId || ''} ${input.amount || ''} ${input.issueDate || ''} ${input.userStory} ${input.evidence || ''} ${input.previousResponse || ''} ${input.desiredResolution || ''}`
  const fraud = input.urgency === 'FRAUD_EMERGENCY' || input.issueType === 'UPI_FRAUD' || hasAny(merged, ['fraud', 'scam', 'otp', 'unauthorised', 'unauthorized', 'phishing'])
  const hasTimeline = Boolean(input.issueDate?.trim()) || /\d{1,2}[\/\-]\d{1,2}|date|today|yesterday|days?|week/i.test(merged)
  const hasEvidence = Boolean(input.evidence?.trim()) || hasAny(merged, ['screenshot', 'invoice', 'receipt', 'utr', 'chat', 'email', 'statement', 'sms', 'ticket'])
  const hasReference = Boolean(input.referenceId?.trim()) || hasAny(merged, ['order id', 'transaction id', 'utr', 'ticket', 'reference', 'rrn'])
  const hasAmount = Boolean(input.amount?.trim()) || /₹|rs\.?|inr|amount|paid|deducted/i.test(merged)
  const hasGoal = Boolean(input.desiredResolution?.trim()) || hasAny(merged, ['refund', 'replacement', 'reverse', 'compensation', 'resolve', 'status'])
  let score = 20
    + scorePart(Boolean(input.companyName?.trim()), 10)
    + scorePart(hasReference, 15)
    + scorePart(hasAmount, 10)
    + scorePart(hasTimeline, 15)
    + scorePart(hasEvidence, 20)
    + scorePart(hasGoal, 10)
  if (fraud && !hasAny(merged, ['1930', 'cyber', 'bank block', 'freeze', 'complaint acknowledgement'])) score -= 10
  score = Math.max(0, Math.min(100, score))

  const grade = score >= 85 ? 'Launch-ready complaint pack' : score >= 70 ? 'Strong, minor gaps left' : score >= 50 ? 'Medium, add proof before escalation' : 'Weak, rebuild facts first'
  const missingFields = [
    !input.companyName?.trim() && 'Company/bank/authority name',
    !hasReference && 'Order ID / UTR / ticket / reference number',
    !hasAmount && 'Exact amount',
    !hasTimeline && 'Issue date and short timeline',
    !hasEvidence && 'Evidence list: screenshot, invoice, chat/email, bank SMS, receipt',
    !hasGoal && 'Clear desired resolution: refund, reversal, replacement, written status',
    fraud && !hasAny(merged, ['1930', 'cyber']) && 'Fraud emergency acknowledgement/reference if available'
  ].filter(Boolean) as string[]

  const evidenceChecklist = fraud
    ? ['Bank SMS/statement entry', 'UPI app screenshot with UTR/RRN', 'Fraud chat/call screenshot if available', 'Cyber complaint acknowledgement', 'Bank block/freeze request acknowledgement', 'Your written follow-up email/message']
    : ['Invoice/order screenshot', 'Payment proof/UPI/bank transaction screenshot', 'Company support chat/email', 'Return/cancellation proof if any', 'Previous complaint/ticket number', 'Timeline note with dates']

  const actionPlan = fraud
    ? [
        { day: 'Now', title: 'Emergency safety', action: 'Bank/app support ko fraud report karo, account/payment method block/freeze request do.', channel: 'Official bank/app channel' },
        { day: 'Today', title: 'Official cyber report', action: 'Official cyber fraud route par complaint acknowledgement save karo.', channel: 'Official emergency portal/helpline' },
        { day: '24 hours', title: 'Written follow-up', action: 'Bank ko written follow-up with UTR, amount, date and evidence bhejo.', channel: 'Email/support ticket' },
        { day: '3 days', title: 'Escalation review', action: 'No response par grievance/nodal escalation draft ready rakho.', channel: 'Nodal/grievance channel' }
      ]
    : [
        { day: 'Today', title: 'Send formal complaint', action: 'Complaint draft ko company/bank support email/ticket me bhejo and acknowledgement save karo.', channel: 'Email/support ticket' },
        { day: '3 days', title: 'First follow-up', action: 'Status pending ho to polite follow-up message bhejo.', channel: 'Email/WhatsApp/support chat' },
        { day: '7 days', title: 'Escalation', action: 'Evidence pack ke saath higher support/nodal/grievance channel me escalate karo.', channel: 'Escalation channel' },
        { day: '15 days', title: 'Official route review', action: 'Still pending ho to correct official grievance route verify karo.', channel: 'Official route' }
      ]

  const requested = line(input.desiredResolution) === 'Not provided' ? (fraud ? 'unauthorised amount reversal and written investigation status' : 'refund/reversal/written resolution') : line(input.desiredResolution)
  const subject = `${input.issueType.replaceAll('_', ' ')} complaint${input.referenceId ? ` - Ref ${input.referenceId}` : ''}`
  const complaintDraft = `Subject: ${subject}\n\nDear Team,\n\nI am raising a written complaint regarding ${input.issueType.replaceAll('_', ' ').toLowerCase()}${input.companyName ? ` with ${input.companyName}` : ''}.\n\nReference/Order/Transaction ID: ${line(input.referenceId)}\nAmount: ${line(input.amount)}\nIssue date: ${line(input.issueDate)}\n\nIssue summary:\n${input.userStory.trim()}\n\nEvidence available:\n${line(input.evidence)}\n\nPrevious response/communication:\n${line(input.previousResponse)}\n\nRequested resolution:\n${requested}\n\nPlease acknowledge this complaint in writing and share the expected resolution timeline.\n\nRegards`
  const followUpDraft = `Hello, this is a follow-up for my complaint${input.referenceId ? ` ref ${input.referenceId}` : ''}. The issue is still pending. Please share written status, complaint acknowledgement and expected resolution timeline. Amount: ${line(input.amount)}. Requested resolution: ${requested}.`
  const whatsappMessage = `Hi, I need help with ${input.issueType.replaceAll('_', ' ').toLowerCase()}${input.companyName ? ` at ${input.companyName}` : ''}. Ref: ${line(input.referenceId)}. Amount: ${line(input.amount)}. Issue: ${input.userStory.slice(0, 220)}. Please acknowledge and share resolution timeline.`
  const callScript = `Namaste, mera naam [Your Name] hai. Main ${input.issueType.replaceAll('_', ' ').toLowerCase()} ke regarding call kar raha/rahi hoon. Reference ID ${line(input.referenceId)}, amount ${line(input.amount)}, issue date ${line(input.issueDate)}. Kripya complaint acknowledge karke written resolution timeline share karein. Main evidence screenshot/invoice/support chat provide kar sakta/sakti hoon.`

  const riskWarnings = [
    fraud && 'Fraud/unauthorised transaction keywords detected. Delay na karein; official emergency channel priority hai.',
    !hasEvidence && 'Evidence missing hai. Screenshot/invoice/chat proof add karne se case stronger hoga.',
    !hasReference && 'Reference ID missing hai. Support ko trace karne me problem ho sakti hai.',
    /otp|pin|password/i.test(merged) && 'Sensitive OTP/PIN/password text detected. Public share se pehle hide/blur karein.',
    input.userStory.length < 80 && 'Story short hai. What happened, when, amount, and requested resolution clearly add karein.'
  ].filter(Boolean) as string[]

  return {
    readinessScore: score,
    grade,
    caseSummary: `${input.issueType.replaceAll('_', ' ')} case for ${line(input.companyName)}. Ref: ${line(input.referenceId)}. Amount: ${line(input.amount)}.`,
    missingFields,
    evidenceChecklist,
    actionPlan,
    complaintDraft,
    followUpDraft,
    whatsappMessage,
    callScript,
    riskWarnings,
    dashboardSuggestion: score >= 70 ? 'Complaint bhejo, follow-up automation enable karo aur evidence pack save karo.' : 'Pehle missing fields/evidence add karo, phir complaint bhejo.',
    languageNote: `${getLanguageLabel(input.language)} selected. ${buildLanguageInstruction(input.language)}`,
    disclaimer
  }
}
