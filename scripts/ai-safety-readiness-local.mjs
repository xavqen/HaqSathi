import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.AI_SAFETY_EVIDENCE_DIR || './artifacts/ai-safety-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const httpsOrEmpty = (name) => !env(name) || /^https:\/\//i.test(env(name))

const guardrailMode = env('AI_GUARDRAILS_MODE', 'review')
const reviewQueue = enabled('AI_REVIEW_QUEUE_ENABLED')
const piiRedaction = env('AI_PII_REDACTION_ENABLED', 'true') !== 'false'
const hallucinationReview = env('AI_HALLUCINATION_REVIEW_REQUIRED', 'true') !== 'false'
const lowConfidenceThreshold = Number(env('AI_LOW_CONFIDENCE_THRESHOLD', '0.65'))
const retentionDays = Number(env('AI_OUTPUT_LOG_RETENTION_DAYS', '30'))
const webhookSafe = httpsOrEmpty('AI_SAFETY_ESCALATION_WEBHOOK_URL')
const ownerReady = configured('AI_SAFETY_REVIEW_OWNER')

const controls = [
  ['guardrail-mode', 'AI guardrail mode', guardrailMode === 'off' ? 'BLOCKED' : 'READY_TO_TEST', `AI_GUARDRAILS_MODE=${guardrailMode}`],
  ['review-queue', 'High-risk review queue', reviewQueue ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `AI_REVIEW_QUEUE_ENABLED=${env('AI_REVIEW_QUEUE_ENABLED', 'false')}`],
  ['pii-redaction', 'Sensitive data redaction', piiRedaction ? 'READY_TO_TEST' : 'BLOCKED', `AI_PII_REDACTION_ENABLED=${env('AI_PII_REDACTION_ENABLED', 'true')}`],
  ['hallucination-review', 'Hallucination and source review', hallucinationReview ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `AI_HALLUCINATION_REVIEW_REQUIRED=${env('AI_HALLUCINATION_REVIEW_REQUIRED', 'true')}`],
  ['confidence-threshold', 'Low-confidence threshold', lowConfidenceThreshold > 0 && lowConfidenceThreshold <= 0.9 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `AI_LOW_CONFIDENCE_THRESHOLD=${Number.isFinite(lowConfidenceThreshold) ? lowConfidenceThreshold : 'invalid'}`],
  ['log-retention', 'AI review log retention', retentionDays > 0 && retentionDays <= 90 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `AI_OUTPUT_LOG_RETENTION_DAYS=${Number.isFinite(retentionDays) ? retentionDays : 'invalid'}`],
  ['review-owner', 'AI safety review owner', ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', env('AI_SAFETY_REVIEW_OWNER') || 'empty'],
  ['escalation-webhook', 'Escalation webhook safety', webhookSafe ? 'READY_TO_TEST' : 'BLOCKED', configured('AI_SAFETY_ESCALATION_WEBHOOK_URL') ? 'configured' : 'empty']
]

const reviewLanes = [
  ['complaint-drafts', 'Complaint and escalation drafts', 'high', 'review'],
  ['financial-fraud', 'UPI, banking and fraud help', 'critical', 'review'],
  ['schemes-authorities', 'Schemes, authority and official data answers', 'high', 'review'],
  ['documents-vault-ocr', 'Documents, OCR and vault assistance', 'medium', 'review'],
  ['general-chat', 'General AI chat and explainer answers', 'medium', 'allow']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.30-ai-quality-safety-readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length,
    reviewLanes: reviewLanes.length,
    highRiskLanes: reviewLanes.filter((lane) => lane[2] === 'high' || lane[2] === 'critical').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  reviewLanes: reviewLanes.map(([id, label, risk, sampleDecision]) => ({ id, label, risk, sampleDecision })),
  outputSafetyRules: ['No OTP/PIN/password collection', 'No guaranteed outcome claims', 'Official verification reminder', 'Sensitive data masking'],
  launchEvidence: ['Admin screenshot', 'JSON/CSV evidence', 'Low-rating review test', 'Manual sample review across lanes']
}

const controlRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]
const laneRows = [
  ['lane_id', 'label', 'risk', 'sample_decision'],
  ...reviewLanes.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'ai-safety-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'ai-safety-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'ai-safety-review-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ AI quality & safety readiness evidence written to ${outputDir}`)
console.log(`Review lanes: ${report.summary.reviewLanes} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
