export type AiSafetyStatus = 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type AiSafetyRisk = 'low' | 'medium' | 'high' | 'critical'

export type AiSafetyControl = {
  id: string
  label: string
  status: AiSafetyStatus
  adminValue: string
  userValue: string
  launchNote: string
}

export type AiSafetyReviewLane = {
  id: string
  label: string
  tools: string[]
  risk: AiSafetyRisk
  requiredChecks: string[]
  escalationTriggers: string[]
  sampleDecision: 'allow' | 'review' | 'block'
}

export type AiSafetyReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    reviewLanes: number
    highRiskLanes: number
  }
  controls: AiSafetyControl[]
  reviewLanes: AiSafetyReviewLane[]
  outputSafetyRules: string[]
  reviewerChecklist: string[]
  launchEvidence: string[]
}

const env = (name: string, fallback = '') => process.env[name] || fallback
const enabled = (name: string) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name: string) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const httpsOrEmpty = (name: string) => !env(name) || /^https:\/\//i.test(env(name))

export const aiSafetyReviewLanes: AiSafetyReviewLane[] = [
  {
    id: 'complaint-drafts',
    label: 'Complaint and escalation drafts',
    tools: ['AI complaint generator', 'Legal-style draft', 'Consumer forum pack', 'Refund negotiation'],
    risk: 'high',
    requiredChecks: ['No guaranteed outcome claim', 'Clear factual timeline', 'Evidence checklist included', 'Official escalation path reminder', 'No threat or abusive language'],
    escalationTriggers: ['Legal notice wording', 'Large money loss', 'Medical/education/employment impact', 'User asks for court/legal certainty'],
    sampleDecision: 'review'
  },
  {
    id: 'financial-fraud',
    label: 'UPI, banking and fraud help',
    tools: ['UPI fraud helper', 'Wrong transfer draft', 'Bank chargeback helper', 'Scam radar'],
    risk: 'critical',
    requiredChecks: ['Never ask for OTP/PIN/password', 'Urgent official reporting steps first', 'Bank/cyber portal verification reminder', 'Sensitive values masked in logs', 'No recovery guarantee'],
    escalationTriggers: ['OTP/PIN/card data entered', 'Active fraud within 24 hours', 'Threat/self-harm language', 'Minor or elderly victim'],
    sampleDecision: 'review'
  },
  {
    id: 'schemes-authorities',
    label: 'Schemes, authority and official data answers',
    tools: ['Scheme finder', 'Authority directory', 'Official resources', 'Status tracker'],
    risk: 'high',
    requiredChecks: ['Source freshness check', 'Eligibility caveat', 'State/jurisdiction note', 'Official portal link preferred', 'Deadline/date manual review'],
    escalationTriggers: ['Deadline claim changed', 'Eligibility money benefit claim', 'Source unavailable', 'User needs urgent form submission'],
    sampleDecision: 'review'
  },
  {
    id: 'documents-vault-ocr',
    label: 'Documents, OCR and vault assistance',
    tools: ['Document checklist', 'OCR autofill', 'Document vault', 'Evidence pack builder'],
    risk: 'medium',
    requiredChecks: ['PII redaction before review', 'Low confidence fields marked', 'File safety result visible', 'Manual preview before submit', 'No permanent upload without consent'],
    escalationTriggers: ['Aadhaar/PAN/bank document', 'OCR confidence below threshold', 'Suspicious file markers', 'Document contains minor data'],
    sampleDecision: 'review'
  },
  {
    id: 'general-chat',
    label: 'General AI chat and explainer answers',
    tools: ['AI chat assistant', 'Rights explainer', 'Call script generator', 'Smart wizard'],
    risk: 'medium',
    requiredChecks: ['Guidance-only disclaimer', 'No medical/legal/financial certainty', 'Ask for missing facts when needed', 'Short actionable steps', 'Safe refusal for disallowed requests'],
    escalationTriggers: ['Medical/legal emergency', 'Harassment/threat language', 'Identity or document misuse', 'Request to bypass official process'],
    sampleDecision: 'allow'
  }
]

export function getAiQualitySafetyReadinessReport(): AiSafetyReport {
  const guardrailMode = env('AI_GUARDRAILS_MODE', 'review')
  const reviewQueue = enabled('AI_REVIEW_QUEUE_ENABLED')
  const piiRedaction = env('AI_PII_REDACTION_ENABLED', 'true') !== 'false'
  const hallucinationReview = env('AI_HALLUCINATION_REVIEW_REQUIRED', 'true') !== 'false'
  const lowConfidenceThreshold = Number(env('AI_LOW_CONFIDENCE_THRESHOLD', '0.65'))
  const retentionDays = Number(env('AI_OUTPUT_LOG_RETENTION_DAYS', '30'))
  const webhookSafe = httpsOrEmpty('AI_SAFETY_ESCALATION_WEBHOOK_URL')
  const ownerReady = configured('AI_SAFETY_REVIEW_OWNER')
  const blockedByMode = guardrailMode === 'off'

  const controls: AiSafetyControl[] = [
    {
      id: 'guardrail-mode',
      label: 'AI guardrail mode',
      status: blockedByMode ? 'BLOCKED' : 'READY_TO_TEST',
      adminValue: `AI_GUARDRAILS_MODE=${guardrailMode}`,
      userValue: 'AI tools should run with review/strict guardrails so risky legal, financial, scheme and document advice is slowed down for verification.',
      launchNote: 'Use review for MVP. Strict can be enabled after real reviewer workflow and false-positive testing.'
    },
    {
      id: 'review-queue',
      label: 'High-risk review queue',
      status: reviewQueue ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `AI_REVIEW_QUEUE_ENABLED=${env('AI_REVIEW_QUEUE_ENABLED', 'false')}`,
      userValue: 'Critical and high-risk outputs should be queued for admin review before being marked safe or reused as examples.',
      launchNote: 'Connect queue to DB/admin assignment before running paid campaigns at scale.'
    },
    {
      id: 'pii-redaction',
      label: 'Sensitive data redaction',
      status: piiRedaction ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: `AI_PII_REDACTION_ENABLED=${env('AI_PII_REDACTION_ENABLED', 'true')}`,
      userValue: 'OTP, PIN, card, bank, Aadhaar, PAN, phone and email values should be masked before analytics, review or error logs.',
      launchNote: 'Keep enabled for all AI review logs and support handoffs.'
    },
    {
      id: 'hallucination-review',
      label: 'Hallucination and source review',
      status: hallucinationReview ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `AI_HALLUCINATION_REVIEW_REQUIRED=${env('AI_HALLUCINATION_REVIEW_REQUIRED', 'true')}`,
      userValue: 'Answers involving deadlines, eligibility, authority contact details and legal-style drafts need source/freshness review.',
      launchNote: 'Pair with official data refresh and link monitoring before calling outputs verified.'
    },
    {
      id: 'confidence-threshold',
      label: 'Low-confidence threshold',
      status: lowConfidenceThreshold > 0 && lowConfidenceThreshold <= 0.9 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `AI_LOW_CONFIDENCE_THRESHOLD=${Number.isFinite(lowConfidenceThreshold) ? lowConfidenceThreshold : 'invalid'}`,
      userValue: 'Low-confidence OCR/extraction/AI answers should show manual verification prompts instead of acting certain.',
      launchNote: 'Recommended MVP value: 0.60 to 0.75 depending on false positive rate.'
    },
    {
      id: 'log-retention',
      label: 'AI review log retention',
      status: retentionDays > 0 && retentionDays <= 90 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `AI_OUTPUT_LOG_RETENTION_DAYS=${Number.isFinite(retentionDays) ? retentionDays : 'invalid'}`,
      userValue: 'AI review logs should not store sensitive user data forever. Keep enough for safety QA but limit privacy exposure.',
      launchNote: 'Set retention with privacy policy and deletion/export flow.'
    },
    {
      id: 'review-owner',
      label: 'AI safety review owner',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: env('AI_SAFETY_REVIEW_OWNER') || 'empty',
      userValue: 'A named owner should review flagged outputs, unsafe feedback, low ratings and recurring hallucination patterns.',
      launchNote: 'Assign before public launch or keep all high-risk outputs as guidance-only with strict disclaimers.'
    },
    {
      id: 'escalation-webhook',
      label: 'Escalation webhook safety',
      status: webhookSafe ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: configured('AI_SAFETY_ESCALATION_WEBHOOK_URL') ? 'configured' : 'empty',
      userValue: 'Optional escalation alerts must use HTTPS only and avoid raw sensitive data.',
      launchNote: 'Use only after redaction and internal access review.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.30-ai-quality-safety-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      reviewLanes: aiSafetyReviewLanes.length,
      highRiskLanes: aiSafetyReviewLanes.filter((lane) => lane.risk === 'high' || lane.risk === 'critical').length
    },
    controls,
    reviewLanes: aiSafetyReviewLanes,
    outputSafetyRules: [
      'Never ask users for OTP, UPI PIN, card PIN, banking password or full secret credentials.',
      'Never guarantee refund, legal outcome, scheme approval, complaint success or money recovery.',
      'Use guidance-only wording and recommend official portal/company/bank verification for final action.',
      'For deadline, eligibility, authority or legal-style claims, show source/freshness uncertainty unless manually verified.',
      'Mask sensitive data before storing AI reviews, analytics, incident reports or support handoffs.',
      'Escalate critical finance, cyber fraud, minor safety, threat or self-harm signals to human review immediately.'
    ],
    reviewerChecklist: [
      'Check user intent and tool context.',
      'Check if the AI output includes a risky claim or missing caveat.',
      'Verify official source/date when the answer mentions deadlines, eligibility, authority or portal path.',
      'Confirm no sensitive secrets are stored in review logs.',
      'Mark decision as allow, revise, block or escalate with reviewer/date evidence.'
    ],
    launchEvidence: [
      'Run npm run ai-safety:readiness and save JSON/CSV outputs.',
      'Open /admin/ai-safety-readiness and save screenshot.',
      'Submit one low-rating AI review from /api/ai/reviews and confirm it appears in /admin/ai-reviews.',
      'Test OTP/PIN/card-secret input redaction in a local dry run.',
      'Manually review one sample from complaint, UPI, scheme, document/OCR and chat lanes before launch.'
    ]
  }
}
