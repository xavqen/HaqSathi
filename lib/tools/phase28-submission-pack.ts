import type { SubmissionPackInput, SubmissionPackResult } from '@/lib/validators/phase28'

function clean(value?: string) {
  return (value || '').trim()
}

function langName(code: string) {
  return code.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildSubmissionPack(input: SubmissionPackInput): SubmissionPackResult {
  const company = clean(input.companyName) || 'concerned company/authority'
  const reference = clean(input.referenceId) || 'not provided'
  const amount = clean(input.amount) || 'not specified'
  const date = clean(input.issueDate) || 'not specified'
  const resolution = clean(input.desiredResolution) || 'Please resolve this issue and share a written update.'
  const evidenceText = clean(input.evidence)
  const isUrgent = input.tone === 'URGENT' || input.issueType === 'CYBER_FRAUD' || input.issueType === 'UPI'
  const language = langName(input.language || 'ENGLISH')

  const title = `${company} ${input.issueType.toLowerCase().replaceAll('_', ' ')} submission pack`
  const caseSnapshot = `Issue: ${input.issueType.replaceAll('_', ' ')}\nCompany/authority: ${company}\nReference ID: ${reference}\nAmount: ${amount}\nIssue date: ${date}\nResolution wanted: ${resolution}`
  const firstLine = isUrgent ? 'This matter requires urgent attention.' : 'I request your support in resolving this issue.'
  const safeAsk = `Kindly investigate this matter, resolve it as per applicable policy, and share a written confirmation with ticket/status details.`

  const emailSubject = `${isUrgent ? 'Urgent: ' : ''}Request for resolution - ${company} - Ref ${reference}`
  const emailBody = `Dear Support Team,\n\n${firstLine}\n\n${caseSnapshot}\n\nProblem details:\n${input.problem.trim()}\n\nEvidence available:\n${evidenceText || 'I can provide order details, screenshots, payment proof, chat/email history and ID proof if required.'}\n\nRequested resolution:\n${resolution}\n\n${safeAsk}\n\nRegards,\n[Your Name]\n[Registered mobile/email]`

  const whatsappMessage = `${isUrgent ? 'URGENT: ' : ''}Hi, I need help with ${input.issueType.replaceAll('_', ' ')}. Company/authority: ${company}. Ref: ${reference}. Amount: ${amount}. Issue date: ${date}. Problem: ${input.problem.trim().slice(0, 450)}. Please resolve and share written status. Evidence available: ${evidenceText || 'screenshots/payment proof/chat history'}.`
  const supportChatMessage = `Please check my issue. Ref: ${reference}. Amount: ${amount}. Date: ${date}. Issue: ${input.problem.trim().slice(0, 500)}. I request written status and resolution. ${resolution}`
  const callOpeningScript = `Hello, my name is [Your Name]. I am calling about my ${input.issueType.replaceAll('_', ' ').toLowerCase()} issue with reference ${reference}. Amount is ${amount}, date is ${date}. I have already kept proof ready. Please register/check the complaint and give me a ticket number or written status.`
  const escalationMessage = `I have already requested resolution for this issue but it is still pending. ${caseSnapshot}\n\nPlease escalate this complaint to the appropriate grievance team and provide a written update with ticket number, expected resolution time, and reason for delay. This message is for record and follow-up.`
  const socialPostSafe = `I am facing an unresolved issue with ${company} related to ${input.issueType.replaceAll('_', ' ').toLowerCase()}. Reference: ${reference}. I request the official support team to help with a written status and resolution. Sharing this only to seek support, not to make any unverified allegation.`

  const attachmentOrder = [
    'Payment/order receipt or invoice',
    'Transaction ID / UTR / order ID screenshot',
    'Company/bank/app chat or email history',
    'Bank statement line if payment/debit issue',
    'Product/service photo or delivery proof if applicable',
    'Previous complaint/ticket number screenshot',
    'ID proof only if the official channel asks for it'
  ]

  const copySequence = [
    { label: '1. Chat support', text: supportChatMessage, whenToUse: 'Use first on app/website support chat.' },
    { label: '2. Formal email', text: emailBody, whenToUse: 'Use when chat does not solve or you need written proof.' },
    { label: '3. WhatsApp support', text: whatsappMessage, whenToUse: 'Use for official WhatsApp support only.' },
    { label: '4. Escalation', text: escalationMessage, whenToUse: 'Use after 3-7 days or when support gives no clear response.' },
    { label: '5. Social support', text: socialPostSafe, whenToUse: 'Use carefully; avoid personal data and unverified allegations.' }
  ]

  const mobileActionPlan = [
    { step: 'Step 1', action: 'Copy chat support message and send on official support channel.', time: 'Now' },
    { step: 'Step 2', action: 'Take screenshot of sent message/ticket number.', time: 'Immediately after sending' },
    { step: 'Step 3', action: 'Send formal email with evidence attachment order.', time: 'Same day' },
    { step: 'Step 4', action: 'Save reminder for follow-up/escalation.', time: isUrgent ? '24 hours' : '3 days' },
    { step: 'Step 5', action: 'Use escalation message if no clear written response.', time: isUrgent ? '24-48 hours' : '7 days' }
  ]

  const warnings = [
    'Never share OTP, PIN, password, full card number or CVV.',
    'Use only official support links/numbers and verify before sending documents.',
    'Do not post personal phone number, address, UTR or ID proof publicly.',
    ...(input.issueType === 'CYBER_FRAUD' ? ['For cyber fraud, contact official emergency channels immediately and inform your bank/payment app.'] : []),
    ...(!evidenceText ? ['Evidence field is empty. Add proof details before final submission.'] : [])
  ]

  return {
    title,
    caseSnapshot,
    recommendedChannel: input.recipientType,
    emailSubject,
    emailBody,
    whatsappMessage,
    supportChatMessage,
    callOpeningScript,
    escalationMessage,
    socialPostSafe,
    attachmentOrder,
    copySequence,
    mobileActionPlan,
    warnings,
    languageNote: `Primary output is in simple English. User selected ${language}; translate/adapt before sending if recipient prefers local language.`,
    disclaimer: 'This is preparation guidance, not legal advice or government service. Verify official links/channels before submission.'
  }
}
