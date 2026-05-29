import type { CaseCoachInput, DocumentReaderInput, FollowUpAutomationInput } from '@/lib/validators/phase24'
import { buildLanguageInstruction, getLanguageLabel } from '@/lib/i18n/languages'

const day = 24 * 60 * 60 * 1000
const disclaimer = 'Guidance only. Ye legal/financial advice nahi hai. Official portal, bank/company terms aur latest rules verify karein. OTP/PIN/password kabhi share na karein.'

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim().replace(/[.,;:]+$/, '')
  }
  return ''
}

function boolScore(value?: string | null, points = 10) {
  return value?.trim() ? points : 0
}

function hasAny(text: string, words: string[]) {
  const lower = text.toLowerCase()
  return words.some((word) => lower.includes(word.toLowerCase()))
}

export function parseDocumentText(input: DocumentReaderInput) {
  const raw = input.rawText.replace(/\s+/g, ' ').trim()
  const amount = firstMatch(raw, [/₹\s?([0-9,]+(?:\.\d{1,2})?)/i, /(?:amount|paid|debit|deducted|total)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.\d{1,2})?)/i])
  const transactionId = firstMatch(raw, [/(?:utr|upi ref|txn id|transaction id|order id|reference id|ref no|rrn)\s*[:#\-]?\s*([A-Z0-9\-_/]{6,})/i, /\b([A-Z0-9]{10,22})\b/])
  const date = firstMatch(raw, [/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/, /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/, /(?:date)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i])
  const companyName = firstMatch(raw, [/(?:paid to|merchant|seller|company|bank|from)\s*[:\-]?\s*([A-Za-z0-9 &._-]{3,45})/i, /(Amazon|Flipkart|Paytm|PhonePe|Google Pay|GPay|SBI|HDFC|ICICI|Axis|Airtel|Jio|Myntra|Meesho)/i])
  const email = firstMatch(raw, [/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i])
  const phone = firstMatch(raw, [/(?:\+91[-\s]?)?([6-9]\d{9})/])
  const isFraud = hasAny(raw, ['fraud', 'scam', 'unauthorised', 'unauthorized', 'phishing', 'otp', 'unknown transaction'])
  const isRefund = hasAny(raw, ['refund', 'returned', 'cancelled', 'failed', 'not received'])
  const confidenceScore = [amount, transactionId, date, companyName, email || phone].filter(Boolean).length * 18 + (isFraud || isRefund ? 10 : 0)
  const warnings = [
    !transactionId && 'Transaction/order/reference ID detect nahi hua. Complaint se pehle manually add karein.',
    !amount && 'Amount detect nahi hua. Exact amount add karna case ko strong banata hai.',
    !date && 'Date detect nahi hui. Issue date add karein.',
    isFraud && 'Fraud keywords detected. Bank/cyber emergency official channel ko priority dein.',
    /otp|pin|password/i.test(raw) && 'Sensitive OTP/PIN/password words detected. Screenshot share karne se pehle sensitive data hide karein.'
  ].filter(Boolean)

  return {
    title: `${input.documentType} reader result`,
    extractedFields: {
      companyName: companyName || 'Not detected',
      transactionId: transactionId || 'Not detected',
      amount: amount || 'Not detected',
      issueDate: date || 'Not detected',
      email: email || 'Not detected',
      phone: phone || 'Not detected',
      likelyIssue: isFraud ? 'Possible fraud/unauthorised transaction' : isRefund ? 'Refund/payment failure issue' : 'General complaint/support issue'
    },
    confidenceScore: Math.min(100, confidenceScore),
    autoFillHint: `Use company: ${companyName || 'manual'}, amount: ${amount || 'manual'}, reference: ${transactionId || 'manual'}, date: ${date || 'manual'}.`,
    nextSteps: [
      'Detected fields ko manually verify karo.',
      'Complaint generator me amount, date, reference ID aur issue description paste karo.',
      'Sensitive data like OTP/PIN/password blur/hide karo.',
      isFraud ? 'Fraud case hai to bank block/freeze + official cyber report immediately.' : 'Written complaint send karke acknowledgement save karo.'
    ],
    warnings,
    languageInstruction: buildLanguageInstruction(input.language),
    disclaimer
  }
}

export function buildCaseCoachReport(input: CaseCoachInput) {
  const text = `${input.caseType} ${input.complaintDraft} ${input.evidenceAvailable || ''} ${input.previousReply || ''}`
  const isFraud = hasAny(text, ['fraud', 'scam', 'otp', 'unauthorized', 'unauthorised'])
  const hasTimeline = /\d{1,2}[\/\-]\d{1,2}|day|date|timeline|on\s+\d/i.test(text) || Boolean(input.issueDate)
  const hasEvidence = Boolean(input.evidenceAvailable?.trim()) || hasAny(text, ['screenshot', 'invoice', 'receipt', 'utr', 'ticket', 'email', 'chat'])
  const hasGoal = Boolean(input.goal?.trim()) || hasAny(text, ['refund', 'replacement', 'reverse', 'compensation', 'resolve'])
  const hasReference = Boolean(input.transactionId?.trim()) || hasAny(text, ['order id', 'transaction id', 'utr', 'ticket', 'reference'])
  const hasAmount = Boolean(input.amount?.trim()) || /₹|rs\.?|inr|amount/i.test(text)
  let score = 20 + boolScore(input.companyName, 10) + (hasReference ? 15 : 0) + (hasAmount ? 10 : 0) + (hasTimeline ? 15 : 0) + (hasEvidence ? 15 : 0) + (hasGoal ? 15 : 0)
  if (isFraud && !hasAny(text, ['bank block', 'cyber', '1930', 'freeze'])) score -= 10
  score = Math.max(0, Math.min(100, score))
  const grade = score >= 85 ? 'Strong and action-ready' : score >= 65 ? 'Good, but improve before sending' : score >= 45 ? 'Weak-medium, add key proof' : 'Weak, rebuild before escalation'
  const missing = [
    !input.companyName?.trim() && 'Company/bank/authority name',
    !hasReference && 'Order ID / UTR / ticket / reference number',
    !hasAmount && 'Exact amount involved',
    !hasTimeline && 'Date-wise timeline',
    !hasEvidence && 'Evidence list: invoice, screenshot, chat/email, bank SMS',
    !hasGoal && 'Clear resolution: refund, reversal, replacement or written response',
    isFraud && !hasAny(text, ['cyber', '1930']) && 'Fraud emergency report acknowledgement'
  ].filter(Boolean)
  const strengths = [
    input.companyName?.trim() && 'Authority/company name present',
    hasReference && 'Reference/transaction details present',
    hasEvidence && 'Evidence mentioned',
    hasGoal && 'Resolution demand clear',
    hasTimeline && 'Timeline/date details present'
  ].filter(Boolean)
  const nextBestActions = isFraud
    ? ['Bank channel block/freeze request immediately.', 'Official cyber fraud channel acknowledgement save karo.', 'All evidence ko date-wise folder me rakho.', 'Follow-up in writing within 24-48 hours.']
    : score >= 75
      ? ['Formal complaint send karo.', '3 din ka reminder set karo.', 'No response par escalation draft use karo.', 'Evidence pack ready rakho.']
      : ['Missing details add karo.', 'Document reader se invoice/SMS text parse karo.', 'Complaint strength checker se re-check karo.', 'Then formal complaint send karo.']
  const improvedOpening = `Subject: Request for resolution regarding ${input.caseType}${input.transactionId ? ` - Ref ${input.transactionId}` : ''}\n\nDear Team,\n\nI am raising this written complaint regarding ${input.caseType}${input.companyName ? ` with ${input.companyName}` : ''}. Amount involved: ${input.amount || 'please verify from attached proof'}. Issue date: ${input.issueDate || 'mentioned in attached records'}.\n\nMy requested resolution is: ${input.goal || 'refund/reversal/written resolution as applicable'}.\n\nI request a written response with complaint/reference acknowledgement and expected resolution timeline.`
  return {
    title: 'AI Case Coach report',
    score,
    grade,
    language: getLanguageLabel(input.language || 'ENGLISH'),
    strengths,
    missing,
    nextBestActions,
    improvedOpening,
    escalationReadiness: score >= 80 ? 'Ready for written complaint/escalation' : score >= 60 ? 'Almost ready, add missing evidence first' : 'Not ready, rebuild facts and proof first',
    safeWarnings: [
      'Never include OTP/PIN/password/full card number.',
      'Do not make false claims; write facts only.',
      'Official timelines and grievance paths can change; verify before submission.'
    ],
    disclaimer
  }
}

export function buildFollowUpAutomation(input: FollowUpAutomationInput) {
  const start = new Date(input.startDate)
  const fraud = input.urgency === 'FRAUD'
  const offsets = fraud ? [0, 1, 3, 7, 14] : input.urgency === 'HIGH' ? [0, 2, 5, 10, 15] : [0, 3, 7, 14, 30]
  const labels = fraud
    ? ['Emergency report', 'Bank written follow-up', 'Evidence freeze check', 'Nodal/grievance escalation', 'Regulator-ready review']
    : ['Initial complaint', 'First follow-up', 'Escalation reminder', 'Final written follow-up', 'Official route review']
  const plan = offsets.map((offset, index) => {
    const due = new Date(start.getTime() + offset * day)
    const subject = `${labels[index]}: ${input.caseTitle}`
    const message = index === 0
      ? `Hello, I am raising ${input.caseType} regarding ${input.caseTitle}. Reference: ${input.referenceId || 'not yet available'}. Please acknowledge and share resolution timeline.`
      : `Hello, this is a follow-up for ${input.caseTitle}. Reference: ${input.referenceId || 'not yet available'}. Previous response/resolution is still pending. Please share written status and next step.`
    return {
      step: index + 1,
      label: labels[index],
      dueDate: due.toISOString().slice(0, 10),
      channel: input.channel,
      subject,
      message,
      status: index === 0 ? 'READY' : 'SCHEDULED'
    }
  })
  return {
    title: `Follow-up automation plan for ${input.caseTitle}`,
    plan,
    copyPack: plan.map((item) => `${item.dueDate} - ${item.subject}\n${item.message}`).join('\n\n'),
    remindersToCreate: plan.filter((item) => item.step > 1).map((item) => ({ title: item.label, dueDate: item.dueDate })),
    languageInstruction: buildLanguageInstruction(input.preferredLanguage),
    disclaimer
  }
}
