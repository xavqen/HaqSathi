import type { AgentRevenueSimulatorInput, EvidenceTimelineInput, PrivacyRedactorInput, PublicPostSafetyInput } from '@/lib/validators/phase30'

const piiPatterns = [
  { label: 'email', regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, token: '[EMAIL_REDACTED]' },
  { label: 'phone', regex: /(?:\+91[-\s]?)?[6-9]\d{9}\b/g, token: '[PHONE_REDACTED]' },
  { label: 'aadhaar-like number', regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, token: '[ID_REDACTED]' },
  { label: 'card-like number', regex: /\b(?:\d[ -]*?){13,16}\b/g, token: '[CARD_REDACTED]' },
  { label: 'upi id', regex: /\b[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}\b/g, token: '[UPI_REDACTED]' },
  { label: 'otp', regex: /\b(?:otp|one time password)\s*[:\-]?\s*\d{4,8}\b/gi, token: '[OTP_REDACTED]' },
  { label: 'account number', regex: /\b(?:a\/c|account|acct)\s*(?:no\.?|number)?\s*[:\-]?\s*\d{6,18}\b/gi, token: '[ACCOUNT_REDACTED]' },
  { label: 'address clue', regex: /\b(?:house no\.?|flat no\.?|ward no\.?|near|landmark)\s*[:\-]?\s*[^,.\n]{4,80}/gi, token: '[ADDRESS_DETAIL_REDACTED]' }
]

export function buildPrivacyRedaction(input: PrivacyRedactorInput) {
  let safe = input.text
  const hits: Record<string, number> = {}
  for (const p of piiPatterns) {
    safe = safe.replace(p.regex, (m) => {
      if (input.keepReferenceIds && /\b(?:UTR|order|ticket|complaint|reference|txn|transaction)\b/i.test(m)) return m
      hits[p.label] = (hits[p.label] || 0) + 1
      return p.token
    })
  }
  if (input.publicShareMode) {
    safe = safe.replace(/\b(?:fraud|chor|scammer|criminal|loot|cheat)\b/gi, '[STRONG_ALLEGATION_REVIEW]')
  }
  const riskScore = Math.min(100, Object.values(hits).reduce((a,b)=>a+b,0)*12 + (input.publicShareMode ? 15 : 0))
  return {
    title: 'Privacy-safe redacted draft',
    riskScore,
    detectedItems: Object.entries(hits).map(([label,count]) => ({ label, count })),
    safeText: safe,
    publicSharingRules: ['Never post OTP/PIN/CVV/password.', 'Hide phone, address, UPI ID, account/card numbers.', 'Use “I request status/resolution” instead of unproven accusations.', 'Keep full evidence private for official channel only.'],
    disclaimer: 'Automatic redaction can miss context. Review once before public posting or sending.'
  }
}

function lineItems(text: string) {
  return text.split(/\n|;|\|/).map(x=>x.trim()).filter(Boolean).slice(0, 20)
}

export function buildEvidenceTimeline(input: EvidenceTimelineInput) {
  const events = lineItems(input.eventsText)
  const evidence = lineItems(input.evidenceText || '')
  const required = ['Payment proof / invoice', 'Order or transaction ID', 'Support chat/email history', 'Current status screenshot', 'Written resolution requested']
  const lowerEvidence = evidence.join(' ').toLowerCase()
  const missing = required.filter(item => !lowerEvidence.includes(item.split(' ')[0].toLowerCase()))
  const score = Math.max(20, Math.min(100, 45 + evidence.length*8 + events.length*4 - missing.length*9))
  return {
    title: `${input.issueType.replaceAll('_',' ')} evidence timeline`,
    readinessScore: score,
    timeline: events.map((event, i) => ({ step: i+1, event, proofNeeded: i === 0 ? 'Payment/order proof' : 'Screenshot/email/ticket proof', note: 'Keep date and channel clear.' })),
    evidenceIndex: evidence.map((item, i) => ({ no: i+1, fileNameSuggestion: `proof-${String(i+1).padStart(2,'0')}-${input.issueType.toLowerCase()}.pdf`, description: item })),
    missingEvidence: missing,
    nextBestAction: score >= 75 ? 'Send escalation with attached evidence index.' : 'Collect missing proof first, then send short written complaint.',
    targetOutcome: input.targetOutcome || 'Written status + resolution timeline',
    disclaimer: 'Timeline is preparation help. Actual authority requirements may differ.'
  }
}

const riskyWords = ['fraud', 'scam', 'chor', 'criminal', 'loot', 'fake', 'boycott', 'destroy', 'cheater']

export function buildPublicPostSafety(input: PublicPostSafetyInput) {
  const words = input.draftPost.toLowerCase()
  const risky = riskyWords.filter(w => words.includes(w))
  let safe = input.draftPost
  for (const w of riskyWords) safe = safe.replace(new RegExp(`\\b${w}\\b`, 'gi'), 'issue')
  safe = safe.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email hidden]')
    .replace(/(?:\+91[-\s]?)?[6-9]\d{9}\b/g, '[phone hidden]')
    .replace(/\b(?:\d[ -]*?){12,16}\b/g, '[number hidden]')
  const company = input.companyName || 'support team'
  const politePost = `Hi ${company}, I need help with my ${input.issueType.toLowerCase().replaceAll('_',' ')} issue. I have already tried the support route and request a ticket/status update. Please guide me through the official process. Reference details can be shared privately.`
  const riskScore = Math.min(100, risky.length*18 + (safe.length > 1000 ? 20 : 0))
  return {
    title: 'Public post safety check',
    riskScore,
    riskLevel: riskScore >= 60 ? 'HIGH_REVIEW_NEEDED' : riskScore >= 30 ? 'MEDIUM_REVIEW' : 'LOW',
    riskyWords: risky,
    saferPost: safe.length < 40 ? politePost : safe,
    recommendedPost: politePost,
    postingRules: ['Do not include private IDs, phone, address, OTP or account details.', 'Ask for official ticket/status, not revenge.', 'Say “issue” or “unresolved” unless proven by official record.', 'Move sensitive details to DM/email official channel.'],
    disclaimer: 'This is communication safety guidance, not legal advice.'
  }
}

export function buildAgentRevenueSimulation(input: AgentRevenueSimulatorInput) {
  const paidClients = Math.round(input.monthlyClients * (input.conversionRate / 100))
  const gross = paidClients * input.avgServiceFee + input.addOnRevenue
  const net = gross - input.planCost
  const breakEvenClients = input.avgServiceFee > 0 ? Math.ceil(input.planCost / input.avgServiceFee) : 0
  return {
    title: 'Agent revenue simulator',
    city: input.city || 'your area',
    paidClients,
    grossRevenue: gross,
    planCost: input.planCost,
    estimatedNet: net,
    breakEvenClients,
    suggestedPackages: [
      { name: 'Basic complaint help', price: Math.max(49, Math.round(input.avgServiceFee * 0.6)), includes: ['Draft + copy pack'] },
      { name: 'Follow-up pack', price: Math.max(99, Math.round(input.avgServiceFee)), includes: ['Draft + reminder + escalation'] },
      { name: 'Document + evidence pack', price: Math.max(199, Math.round(input.avgServiceFee * 2)), includes: ['Checklist + timeline + PDF pack'] }
    ],
    growthTips: ['Use QR poster in shop/cyber cafe.', 'Offer free first risk check to build trust.', 'Keep proof private and get customer consent.', 'Do not promise legal outcome or refund guarantee.'],
    warning: 'Revenue is only an estimate. Follow local laws, platform rules and honest service pricing.'
  }
}
