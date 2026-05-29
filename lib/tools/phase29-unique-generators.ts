import type { AuthorityRouterInput, IssueTrendInput, RefundNegotiationInput, RightsExplainerInput, ScamRadarInput } from '@/lib/validators/phase29'

const redFlags = [
  'otp', 'pin', 'cvv', 'password', 'screen share', 'anydesk', 'quick support', 'refund link', 'kyc update', 'verify account',
  'urgent', 'limited time', 'lottery', 'reward', 'cashback', 'investment double', 'crypto profit', 'job fee', 'processing fee'
]

function has(input: string, word: string) {
  return input.toLowerCase().includes(word.toLowerCase())
}

function riskLabel(score: number) {
  if (score >= 80) return 'URGENT'
  if (score >= 55) return 'HIGH'
  if (score >= 30) return 'MEDIUM'
  return 'LOW'
}

export function buildScamRadarReport(input: ScamRadarInput) {
  const text = input.messageText.toLowerCase()
  const matched = redFlags.filter((flag) => has(text, flag))
  let score = Math.min(95, matched.length * 13)
  if (input.channel === 'CALL' || input.channel === 'WHATSAPP') score += 8
  if (input.amount && /\d/.test(input.amount)) score += 6
  if (has(text, 'bank') && (has(text, 'block') || has(text, 'kyc'))) score += 12
  if (has(text, 'refund') && (has(text, 'link') || has(text, 'otp'))) score += 18
  score = Math.min(100, score)
  const riskLevel = riskLabel(score)
  const immediateSteps = riskLevel === 'URGENT' || riskLevel === 'HIGH'
    ? ['Do not click any link or share OTP/PIN/password.', 'Block/report the number or account after taking screenshots.', 'If money is lost, contact bank/payment app and official cyber fraud channel immediately.', 'Save transaction IDs, screenshots, caller ID, UPI ID and chat history.']
    : ['Verify sender through official website/app only.', 'Do not share sensitive details.', 'Ask for written support ticket from official channel.', 'Keep screenshots before deleting anything.']
  return {
    title: `${riskLevel} scam risk detected`,
    score,
    riskLevel,
    matchedRedFlags: matched,
    suspiciousSignals: matched.length ? matched.map((x) => `Message mentions “${x}”, which is commonly abused in scams.`) : ['No major keyword red flag found, but still verify channel before acting.'],
    immediateSteps,
    safeReply: 'I will only communicate through official support channels. I will not share OTP, PIN, password, CVV, screen access or pay any extra fee for refund/verification.',
    evidenceChecklist: ['Screenshot of message/call log', 'Phone number/email/UPI ID/website URL', 'Payment proof if money was sent', 'Bank/app complaint ticket number', 'Timeline of events'],
    disclaimer: 'This is risk guidance, not official fraud investigation. For cyber fraud or money loss, contact official emergency channels and your bank immediately.'
  }
}

export function buildRightsExplainer(input: RightsExplainerInput) {
  const issue = input.issueType.replaceAll('_', ' ').toLowerCase()
  const state = input.state || 'your state'
  const baseRights = [
    'You can ask for a written complaint/ticket number.',
    'You can keep copies of payment proof, invoice, chat/email history and status screenshots.',
    'You can follow up politely and escalate if no clear response comes within a reasonable time.',
    'You should verify official rules/portal before submitting documents or personal details.'
  ]
  const issueRights: Record<string, string[]> = {
    REFUND: ['Ask for refund timeline in writing.', 'Ask for reason if refund is rejected/delayed.', 'Use invoice/order/payment proof while escalating.'],
    BANK: ['Ask bank for complaint number and resolution timeline.', 'Keep statement line, UTR/reference number and SMS proof.', 'Escalate through bank grievance process if response is unclear.'],
    UPI: ['Report wrong/fraud transaction quickly to bank/payment app.', 'Keep UPI transaction ID/UTR and recipient details.', 'For fraud, act urgently and use official cyber fraud channels.'],
    CYBER_FRAUD: ['Do not negotiate with scammer.', 'Contact bank/payment app immediately.', 'Use official cyber fraud reporting channels and preserve evidence.'],
    GOVERNMENT_SERVICE: ['Ask for application status/reference number.', 'Check official portal instructions.', 'Use RTI/appeal route only when appropriate.']
  }
  return {
    title: `Simple rights explainer for ${issue}`,
    summary: `Based on your question, your main focus should be written proof, correct authority, evidence and timely follow-up in ${state}.`,
    rights: [...baseRights, ...(issueRights[input.issueType] || ['Ask for official written status and keep all proof organized.'])],
    whatToAsk: ['What is my complaint/application/ticket number?', 'What is the exact reason for delay/rejection?', 'What documents are missing?', 'What is the expected resolution date?', 'Which authority/team handles escalation?'],
    nextSteps: ['Prepare evidence pack.', 'Send short written complaint.', 'Save reminder for follow-up.', 'Escalate only with proof and previous ticket details.'],
    safeWords: ['Please share written status.', 'Please provide complaint/ticket number.', 'Please explain the reason for delay/rejection.', 'Please tell the next official step.'],
    warning: 'This is simple guidance, not legal advice or official government confirmation. Verify final rules on official portal/notice.'
  }
}

export function buildRefundNegotiationPlan(input: RefundNegotiationInput) {
  const company = input.companyName || 'the company'
  const amount = input.amount || 'the paid amount'
  const delay = input.daysPending > 0 ? `${input.daysPending} days` : 'some time'
  const strength = (input.evidence ? 25 : 0) + (input.previousResponse ? 20 : 0) + Math.min(35, input.daysPending * 2) + (input.amount ? 10 : 0)
  const score = Math.min(100, 35 + strength)
  return {
    title: `${company} refund negotiation plan`,
    negotiationScore: score,
    position: score >= 75 ? 'Strong follow-up position' : score >= 55 ? 'Medium position, add more proof' : 'Weak position, collect proof first',
    messageLadder: [
      { day: 'Today', channel: 'Support chat/app', text: `Hi, my refund of ${amount} is pending for ${delay}. Please share refund status, expected date, and ticket number.` },
      { day: 'Day 3', channel: 'Email', text: `I have already raised this refund issue with ${company}. Please resolve it or provide written reason for delay. Amount: ${amount}.` },
      { day: 'Day 7', channel: 'Escalation', text: `This refund is still unresolved despite follow-up. Please escalate to grievance/refund team and share written resolution timeline.` },
      { day: 'Day 15', channel: 'Higher authority', text: `I request final written response with reason for delay/rejection and next official escalation route.` }
    ],
    proofToAttach: ['Invoice/order receipt', 'Payment proof/transaction ID', 'Cancellation/refund confirmation', 'Support chat/email history', 'Bank statement line if needed'],
    negotiationRules: ['Stay firm but factual.', 'Do not threaten in first message.', 'Ask for written status.', 'Never share OTP/PIN/CVV.', 'Avoid public post until official support route is tried.'],
    finalAsk: `Please refund ${amount} or give a written reason with policy reference and next escalation route.`,
    disclaimer: 'This is negotiation assistance, not legal guarantee.'
  }
}

export function buildAuthorityRouter(input: AuthorityRouterInput) {
  const urgent = input.urgency === 'URGENT' || input.issueType === 'CYBER_FRAUD'
  const routeMap: Record<string, string[]> = {
    BANK: ['Bank app/branch complaint', 'Bank grievance officer/nodal officer', 'Banking ombudsman-style escalation if eligible'],
    PAYMENT_APP: ['Payment app support', 'Linked bank complaint', 'NPCI/bank escalation route if appropriate'],
    MARKETPLACE: ['Marketplace support', 'Seller/company grievance', 'Consumer helpline/forum prep if unresolved'],
    GOVERNMENT_OFFICE: ['Official portal/office counter', 'Department grievance portal', 'RTI/appeal route where applicable'],
    COLLEGE_SCHOOL: ['Institution office/admin', 'Principal/registrar escalation', 'Education department/regulator guidance where applicable'],
    INSURANCE_COMPANY: ['Insurer support', 'Grievance officer', 'Insurance ombudsman-style escalation if eligible'],
    TELECOM: ['Telecom support', 'Appellate authority', 'Consumer route if unresolved'],
    PRIVATE_COMPANY: ['Company support', 'Grievance email/nodal contact', 'Consumer route if unresolved']
  }
  const route = routeMap[input.companyType] || ['Official support', 'Written escalation', 'Relevant grievance authority']
  return {
    title: `Best authority route for ${input.issueType.replaceAll('_', ' ')}`,
    urgency: input.urgency,
    recommendedRoute: route,
    firstMessage: `Please register my complaint and provide a ticket/reference number. Issue: ${input.problem.slice(0, 400)}. I request written status and expected resolution timeline.`,
    escalationTrigger: urgent ? 'Immediate/within 24 hours if money loss or fraud risk is involved.' : 'After 3-7 days if no clear response or ticket number is given.',
    documentsNeeded: ['Complaint summary', 'Reference/order/transaction ID', 'Payment/invoice proof', 'Screenshots of previous communication', 'Identity proof only if official channel asks'],
    doNotDo: ['Do not use unverified phone numbers from random search results.', 'Do not share OTP/PIN/password.', 'Do not submit original documents unless officially required.', 'Do not make public allegations without proof.'],
    disclaimer: 'Authority routing is guidance only. Verify official portal/contact before filing.'
  }
}

export function summarizeTrend(input: IssueTrendInput) {
  return {
    title: `${input.issueType} trend signal saved`,
    publicSafeSummary: input.summary.slice(0, 220),
    tags: [input.issueType, input.companyName || 'UNKNOWN_COMPANY', input.state || 'UNKNOWN_STATE', input.severity],
    value: 'This signal helps identify repeated complaints and high-risk issue patterns without exposing private data.',
    privacyNote: 'Do not include OTP, full phone number, address, UTR, ID proof or personal details in public trend summaries.'
  }
}
