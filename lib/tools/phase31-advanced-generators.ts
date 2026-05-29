import type { ChargebackHelperInput, FamilyCaseSwitchboardInput, ProofQualityScannerInput, ServiceCenterLocatorInput } from '@/lib/validators/phase31'

const proofKeywords = ['invoice', 'receipt', 'utr', 'order', 'transaction', 'ticket', 'email', 'screenshot', 'date', 'amount', 'refund', 'chat', 'reference', 'complaint']

function money(value?: number) {
  if (!value && value !== 0) return 'amount not provided'
  return `₹${value.toLocaleString('en-IN')}`
}

function clean(value?: string) {
  return value?.trim() || 'Not provided'
}

export function buildChargebackHelper(input: ChargebackHelperInput) {
  const evidence = (input.evidenceAvailable || '').toLowerCase()
  const hasTxn = Boolean(input.transactionId)
  const hasDate = Boolean(input.transactionDate)
  const hasProof = proofKeywords.some((k) => evidence.includes(k))
  const readinessScore = Math.max(25, Math.min(100, 35 + (hasTxn ? 18 : 0) + (hasDate ? 14 : 0) + (hasProof ? 20 : 0) + (input.amount ? 8 : 0)))
  const reasonMap: Record<string, string> = {
    UNAUTHORIZED: 'unauthorized transaction / customer did not authorize this payment',
    PRODUCT_NOT_RECEIVED: 'goods or service not received after successful payment',
    REFUND_NOT_CREDITED: 'merchant confirmed/refund promised but amount not credited',
    DUPLICATE_DEBIT: 'duplicate debit / double charge for same order',
    SERVICE_NOT_PROVIDED: 'paid service was not delivered as promised',
    WRONG_AMOUNT: 'wrong amount charged compared to invoice/order value',
    MERCHANT_DENIED: 'merchant denied resolution after payment proof was shared',
    OTHER: 'payment dispute requiring bank/merchant investigation'
  }
  const bank = clean(input.bankName)
  const merchant = clean(input.merchantName)
  const amount = money(input.amount)
  const subject = `Payment dispute / chargeback request - ${merchant} - ${clean(input.transactionId)}`
  const bankMessage = `Subject: ${subject}\n\nDear ${bank} Team,\n\nI request your help to investigate this payment dispute.\n\nPayment mode: ${input.paymentMode}\nIssue type: ${input.issueType}\nMerchant: ${merchant}\nAmount: ${amount}\nTransaction date: ${clean(input.transactionDate)}\nTransaction ID/UTR: ${clean(input.transactionId)}\nReason: ${reasonMap[input.issueType]}\n\nWhat happened:\n${input.whatHappened}\n\nEvidence available:\n${clean(input.evidenceAvailable)}\n\nRequest: Please register this dispute/chargeback request, provide a complaint/ticket number, and share the expected resolution timeline in writing.\n\nRegards,\n[Your Name]\n[Registered mobile/email]`
  return {
    title: 'Chargeback / payment dispute helper',
    readinessScore,
    disputeReason: reasonMap[input.issueType],
    urgency: input.issueType === 'UNAUTHORIZED' ? 'URGENT - contact bank immediately and block payment instrument if needed.' : 'NORMAL - submit written dispute with evidence.',
    requiredProof: ['Bank statement entry', 'Payment screenshot/UTR', 'Order invoice or booking ID', 'Merchant chat/email', 'Refund promise or cancellation proof', 'Your written complaint copy'],
    missingSignals: [!hasTxn && 'Transaction ID/UTR missing', !hasDate && 'Transaction date missing', !hasProof && 'Evidence details look weak'].filter(Boolean),
    bankMessage,
    merchantMessage: `Hi ${merchant}, my payment dispute is unresolved. Amount: ${amount}, Txn/UTR: ${clean(input.transactionId)}. Please provide written status, refund reference, and expected credit date.`,
    escalationPlan: ['Send written complaint to merchant/support first.', 'If unresolved, raise dispute with bank/card issuer/payment app.', 'Ask for ticket number and TAT in writing.', 'Keep all evidence in one PDF/folder.', 'Escalate to proper regulator/ombudsman route only after official response/wait period.'],
    disclaimer: 'This is general payment dispute guidance, not legal/financial advice. Follow your bank/payment app official process.'
  }
}

export function buildProofQualityScan(input: ProofQualityScannerInput) {
  const lower = input.proofText.toLowerCase()
  const present = proofKeywords.filter((k) => lower.includes(k))
  const missingCore = ['date', 'amount', 'transaction', 'ticket', 'screenshot'].filter((k) => !lower.includes(k))
  const hasChronology = /\b(then|after|before|on\s+\d|date|day|time)\b/i.test(input.proofText)
  const hasOutcome = Boolean(input.expectedOutcome)
  const score = Math.max(20, Math.min(100, 30 + present.length * 6 + (hasChronology ? 14 : 0) + (hasOutcome ? 12 : 0) - missingCore.length * 4))
  return {
    title: 'Proof quality scanner',
    score,
    grade: score >= 80 ? 'STRONG' : score >= 60 ? 'GOOD_BUT_IMPROVE' : score >= 40 ? 'WEAK' : 'VERY_WEAK',
    presentSignals: present,
    missingCore,
    recommendedFileOrder: ['01-payment-proof', '02-order-invoice', '03-support-chat', '04-refund-status', '05-final-complaint-draft'],
    rewriteEvidenceSummary: `I am raising this ${input.issueType.toLowerCase().replaceAll('_',' ')} issue through ${input.channel.toLowerCase().replaceAll('_',' ')}. The proof includes: ${present.length ? present.join(', ') : 'basic issue details'}. Requested outcome: ${input.expectedOutcome || 'written status and resolution timeline'}.`,
    improvementTasks: ['Add exact date/time.', 'Add amount and reference ID.', 'Attach screenshots in chronological order.', 'Write desired resolution in one line.', 'Keep private IDs hidden for public channels.'],
    disclaimer: 'Proof quality score is preparation help. Official authority may require different documents.'
  }
}

export function buildServiceCenterLocator(input: ServiceCenterLocatorInput) {
  const onlineFirst = input.onlinePreferred || input.urgency === 'EMERGENCY'
  const routeByIssue: Record<string, string[]> = {
    BANK: ['Bank branch/helpdesk', 'Bank nodal officer/escalation desk', 'Banking ombudsman route after required wait period'],
    UPI: ['Payment app support', 'Linked bank support', 'NPCI/bank dispute route'],
    CYBER_FRAUD: ['Emergency cyber reporting channel', 'Bank freeze/block request', 'Police/cyber cell if required'],
    ECOMMERCE: ['Company support ticket', 'Grievance/nodal officer', 'Consumer helpline/forum route'],
    DOCUMENT: ['Local CSC/Seva Kendra', 'Block/tehsil/municipal office', 'State portal helpdesk'],
    SCHEME: ['Official scheme portal/helpdesk', 'District welfare/scholarship office', 'School/college verification desk'],
    TELECOM: ['Operator support', 'Appellate authority', 'Consumer route if unresolved'],
    ELECTRICITY: ['DISCOM complaint center', 'Local subdivision office', 'Consumer grievance forum route'],
    EDUCATION: ['Institution accounts/admin office', 'University/board grievance cell', 'Education department route'],
    INSURANCE: ['Insurer support', 'Grievance officer', 'Insurance ombudsman route'],
    TRAVEL: ['Booking platform/airline/hotel support', 'Nodal/grievance desk', 'Consumer route'],
    OTHER: ['Company/department support', 'Nodal officer', 'Consumer/public grievance route']
  }
  const routes = routeByIssue[input.issueType] || routeByIssue.OTHER
  return {
    title: 'Service center / authority route plan',
    location: `${input.city}, ${input.state}`,
    firstMode: onlineFirst ? 'Online-first: raise ticket and keep written proof.' : 'Offline-ready: carry evidence and ask for written receipt/ticket.',
    recommendedRoutes: routes.map((name, index) => ({ step: index + 1, name, action: index === 0 ? 'Start here first.' : 'Use if previous stage gives no clear response.' })),
    visitChecklist: ['Government ID', 'Payment/order proof', 'Complaint draft', 'Reference ID/UTR/ticket number', 'Previous chat/email screenshots', 'One-page summary'],
    questionsToAsk: ['What is my complaint/ticket number?', 'What is the expected resolution date?', 'Which document is missing?', 'Can I get this response in writing?', 'What is the next escalation stage?'],
    safetyRules: input.issueType === 'CYBER_FRAUD' ? ['Do not share OTP/PIN/CVV.', 'Block/freeze impacted instrument quickly.', 'Use official cyber/bank channels only.'] : ['Do not pay unofficial fees.', 'Keep receipt of any official payment.', 'Verify official portal/office before sharing documents.'],
    disclaimer: 'This is a route planner, not a verified live location directory. Confirm official address/link before visiting.'
  }
}

export function buildFamilyCaseSwitchboard(input: FamilyCaseSwitchboardInput) {
  const priorityDays: Record<string, number> = { LOW: 14, MEDIUM: 7, HIGH: 3, URGENT: 1 }
  const dueWindow = priorityDays[input.priority] || 7
  return {
    title: 'Family case switchboard plan',
    familyName: input.familyName || 'Family',
    caseOwner: input.responsiblePerson || input.memberName,
    priority: input.priority,
    caseCard: {
      member: input.memberName,
      issueType: input.issueType,
      summary: input.caseSummary,
      dueDate: input.dueDate || `Within ${dueWindow} day(s)`
    },
    rolePlan: [
      { role: 'Case owner', person: input.responsiblePerson || input.memberName, job: 'Send complaint and track ticket.' },
      { role: 'Document helper', person: 'Family member 2', job: 'Collect invoice, screenshots and IDs.' },
      { role: 'Follow-up helper', person: 'Family member 3', job: 'Call/support follow-up on due date.' }
    ],
    familyChecklist: ['One shared folder for proof', 'One complaint draft', 'One status tracker', 'One responsible person', 'No duplicate complaints without reference'],
    nextActions: ['Create complaint draft.', 'Attach proof in order.', 'Send through official channel.', `Follow up ${input.priority === 'URGENT' ? 'tomorrow' : 'on due date'}.`, 'Escalate only with ticket/reference proof.'],
    reminderText: `Reminder: ${input.memberName} ka ${input.issueType.toLowerCase().replaceAll('_',' ')} case follow-up due hai. Case owner: ${input.responsiblePerson || input.memberName}. Summary: ${input.caseSummary.slice(0, 180)}`,
    disclaimer: 'Family switchboard is an organization helper. Keep sensitive documents private and share only with trusted people.'
  }
}
