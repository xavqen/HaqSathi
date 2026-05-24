export type TimelineInput = {
  category: string
  createdAt?: Date | string | null
  amount?: string | number | null
  companyName?: string | null
  description?: string | null
}

const day = 24 * 60 * 60 * 1000

export function buildEscalationPlan(input: TimelineInput) {
  const created = input.createdAt ? new Date(input.createdAt) : new Date()
  const type = input.category.toLowerCase()
  const isFraud = type.includes('fraud') || type.includes('scam') || input.description?.toLowerCase().includes('fraud')
  const isBank = type.includes('bank') || type.includes('upi') || type.includes('payment')
  const steps = isFraud
    ? [
        { dayOffset: 0, title: 'Immediate fraud report', action: 'Bank app/card block + cybercrime portal/1930 par urgent report karo.', channel: 'Emergency' },
        { dayOffset: 1, title: 'Written bank complaint', action: 'Bank ko transaction ID ke sath written complaint bhejo.', channel: 'Bank support' },
        { dayOffset: 3, title: 'Evidence bundle ready', action: 'Screenshots, SMS, UTR, chat, phone number aur timeline ek folder me rakho.', channel: 'Self checklist' },
        { dayOffset: 7, title: 'Escalate to nodal officer', action: 'Bank response nahi aaye to nodal/grievance officer ko follow-up bhejo.', channel: 'Bank grievance' }
      ]
    : isBank
      ? [
          { dayOffset: 0, title: 'Raise bank ticket', action: 'Transaction ID, amount, date aur issue ke sath complaint raise karo.', channel: 'Bank support' },
          { dayOffset: 3, title: 'First follow-up', action: 'Ticket number ke sath written follow-up bhejo.', channel: 'Email/app' },
          { dayOffset: 7, title: 'Escalate inside bank', action: 'Branch manager/nodal officer ko concise complaint bhejo.', channel: 'Nodal officer' },
          { dayOffset: 15, title: 'Regulator-ready record', action: 'Agar response nahi mile, official grievance portal ke liye evidence prepare karo.', channel: 'Official verification' }
        ]
      : [
          { dayOffset: 0, title: 'Send formal complaint', action: `${input.companyName || 'Company'} support ko order/transaction ID ke sath complaint bhejo.`, channel: 'Company support' },
          { dayOffset: 3, title: 'Follow-up message', action: 'Short follow-up bhejo aur resolution deadline pucho.', channel: 'Email/chat' },
          { dayOffset: 7, title: 'Escalate to grievance team', action: 'Company grievance/nodal email par previous communication attach karo.', channel: 'Company grievance' },
          { dayOffset: 14, title: 'Consumer forum draft ready', action: 'Consumer helpline complaint format ready rakho. Official portal par details verify karo.', channel: 'Consumer help' }
        ]

  return steps.map((step, index) => ({
    ...step,
    order: index + 1,
    dueDate: new Date(created.getTime() + step.dayOffset * day).toISOString(),
    status: index === 0 ? 'READY' : 'PLANNED'
  }))
}

export function calculateDeadline(issueDate: string, category: string) {
  const start = issueDate ? new Date(issueDate) : new Date()
  const type = category.toLowerCase()
  const days = type.includes('fraud') ? [0, 1, 3, 7] : type.includes('upi') || type.includes('bank') ? [0, 3, 7, 15, 30] : [0, 3, 7, 14, 30]
  return days.map((d, i) => ({
    label: ['Start complaint', 'First follow-up', 'Escalation', 'Final warning', 'Long follow-up'][i] || `Step ${i + 1}`,
    date: new Date(start.getTime() + d * day).toISOString().slice(0, 10),
    dayOffset: d
  }))
}

export function scoreComplaint(input: { companyName?: string; transactionId?: string; amount?: string; issueDate?: string; description?: string; desiredResolution?: string; previousCommunication?: string }) {
  const checks = [
    { key: 'companyName', label: 'Company/bank name added', points: 15 },
    { key: 'transactionId', label: 'Order/transaction ID added', points: 20 },
    { key: 'amount', label: 'Amount added', points: 10 },
    { key: 'issueDate', label: 'Date added', points: 10 },
    { key: 'description', label: 'Clear issue description', points: 20 },
    { key: 'desiredResolution', label: 'Expected resolution clear', points: 15 },
    { key: 'previousCommunication', label: 'Previous communication mentioned', points: 10 }
  ]
  const results = checks.map((check) => ({ ...check, ok: Boolean((input as any)[check.key]?.toString().trim()) }))
  const score = results.filter((r) => r.ok).reduce((sum, r) => sum + r.points, 0)
  const missing = results.filter((r) => !r.ok).map((r) => r.label)
  return {
    score,
    grade: score >= 85 ? 'Strong' : score >= 60 ? 'Good but improve' : 'Weak',
    missing,
    tips: missing.length ? missing.map((m) => `${m} zaroor add karo.`) : ['Draft strong hai. Evidence attach karna mat bhoolna.']
  }
}

export function buildEvidenceChecklist(category: string) {
  const base = ['Order ID / UTR / Transaction ID', 'Payment screenshot/SMS', 'Date and amount proof', 'Company/bank support conversation', 'Your written complaint copy']
  const type = category.toLowerCase()
  const extra = type.includes('fraud') || type.includes('scam')
    ? ['Fraudster phone/UPI ID/link screenshot', 'Call log screenshot', 'Cyber complaint acknowledgement', 'Bank freeze/block acknowledgement']
    : type.includes('scheme') || type.includes('scholarship')
      ? ['Aadhaar copy', 'Income/caste/domicile if applicable', 'Bank passbook', 'Application acknowledgement']
      : type.includes('document')
        ? ['Identity proof', 'Address proof', 'Old certificate/card copy', 'Application receipt']
        : ['Product photos/videos if damaged', 'Invoice copy', 'Return pickup proof', 'Refund promise screenshot']
  return { required: base, categorySpecific: extra, note: 'Sensitive IDs ko public chat/social media par share mat karo.' }
}

export function assessRisk(input: { issueType: string; amount?: string; daysPassed?: string; hasFraud?: string; bankResponded?: string }) {
  const amount = Number(input.amount || 0)
  const days = Number(input.daysPassed || 0)
  let points = 0
  if (input.hasFraud === 'yes' || input.issueType.toLowerCase().includes('fraud')) points += 50
  if (amount >= 10000) points += 20
  if (amount >= 50000) points += 20
  if (days >= 7) points += 10
  if (days >= 30) points += 15
  if (input.bankResponded === 'no') points += 10
  const level = points >= 75 ? 'URGENT' : points >= 45 ? 'HIGH' : points >= 20 ? 'MEDIUM' : 'LOW'
  const actions = level === 'URGENT'
    ? ['Bank block/freeze request immediately', 'Official cyber fraud channel par report karo', 'All evidence same day collect karo']
    : level === 'HIGH'
      ? ['Written complaint + ticket number lo', '3 din me follow-up reminder set karo', 'Escalation draft ready rakho']
      : ['Complaint draft send karo', 'Evidence checklist complete karo', 'Follow-up date note karo']
  return { level, points, actions, disclaimer: 'Yeh legal/financial advice nahi hai. Official portal/bank se verify karo.' }
}
