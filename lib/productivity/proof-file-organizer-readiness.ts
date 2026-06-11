export type ProofFileOrganizerReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type ProofFileOrganizerReadinessPriority = 'P0' | 'P1' | 'P2'

export type ProofFileOrganizerControl = {
  id: string
  priority: ProofFileOrganizerReadinessPriority
  label: string
  status: ProofFileOrganizerReadinessStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type ProofFileOrganizerLane = {
  id: string
  priority: ProofFileOrganizerReadinessPriority
  lane: string
  namingRule: string
  redactionRule: string
}

const env = (key: string, fallback = '') => process.env[key] || fallback
const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

export const proofFileOrganizerReadinessLanes: ProofFileOrganizerLane[] = [
  {
    id: 'originals-archive',
    priority: 'P0',
    lane: 'Original proof archive',
    namingRule: 'Originals stay in a separate private folder and are never renamed with secrets or public identifiers.',
    redactionRule: 'Originals are not shared publicly; use only official portals or verified support channels when required.'
  },
  {
    id: 'redacted-sharing-pack',
    priority: 'P0',
    lane: 'Redacted sharing pack',
    namingRule: 'Shareable copies use date, company and proof type only; no full account/card/Aadhaar/PAN in file names.',
    redactionRule: 'Mask OTP, UPI PIN, CVV, passwords, full card/bank details, full Aadhaar/PAN, private address and unrelated faces.'
  },
  {
    id: 'payment-invoice-proof',
    priority: 'P1',
    lane: 'Payment and invoice proof',
    namingRule: 'Payment screenshots and invoices use sequence numbers and transaction/reference ID only if safe to share.',
    redactionRule: 'Hide balance, full account/card numbers and unrelated transactions before sending.'
  },
  {
    id: 'submission-index',
    priority: 'P1',
    lane: 'Submission index',
    namingRule: 'Every final pack includes a short proof index and attachments sorted by date/sequence.',
    redactionRule: 'Index must say that sensitive data has been redacted before public or third-party sharing.'
  }
]

export function getProofFileOrganizerReadinessReport() {
  const mode = env('PROOF_FILE_ORGANIZER_MODE', 'local_only')
  const ownerReady = configured('PROOF_FILE_ORGANIZER_OWNER')
  const namingReviewed = truthy(env('PROOF_FILE_NAMING_REVIEWED'))
  const redactionReviewed = truthy(env('PROOF_FILE_REDACTION_REVIEWED'))
  const mobileReviewed = truthy(env('PROOF_FILE_MOBILE_QA_REVIEWED'))
  const translationReviewed = truthy(env('PROOF_FILE_TRANSLATION_REVIEWED'))
  const exportReviewed = truthy(env('PROOF_FILE_EXPORT_COPY_REVIEWED'))
  const allowedModes = ['local_only', 'dry_run', 'enabled', 'disabled']

  const controls: ProofFileOrganizerControl[] = [
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Organizer mode is safe',
      status: allowedModes.includes(mode) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `PROOF_FILE_ORGANIZER_MODE=${mode}`,
      passCondition: 'Mode is local_only, dry_run, enabled or disabled. The MVP should work without server-side proof file storage.',
      evidenceRequired: 'Admin readiness screenshot and env evidence showing mode.',
      riskIfSkipped: 'Private proof metadata can be stored or shared before privacy review.'
    },
    {
      id: 'owner-assigned',
      priority: 'P1',
      label: 'Product/support owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PROOF_FILE_ORGANIZER_OWNER=${env('PROOF_FILE_ORGANIZER_OWNER') || 'empty'}`,
      passCondition: 'Owner reviews proof categories, names, missing proof logic and sharing guidance.',
      evidenceRequired: 'Owner/team signoff in launch evidence or admin screenshot.',
      riskIfSkipped: 'Weak file ordering or unclear proof advice can reduce complaint strength.'
    },
    {
      id: 'naming-reviewed',
      priority: 'P1',
      label: 'Safe file naming reviewed',
      status: namingReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PROOF_FILE_NAMING_REVIEWED=${env('PROOF_FILE_NAMING_REVIEWED', 'false')}`,
      passCondition: 'Generated file names avoid secrets and remain readable on mobile and desktop.',
      evidenceRequired: 'Generated folder/file name screenshot for refund, UPI and document cases.',
      riskIfSkipped: 'Users may create confusing or privacy-leaking file names.'
    },
    {
      id: 'redaction-reviewed',
      priority: 'P0',
      label: 'Redaction warnings reviewed',
      status: redactionReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PROOF_FILE_REDACTION_REVIEWED=${env('PROOF_FILE_REDACTION_REVIEWED', 'false')}`,
      passCondition: 'Tool clearly warns against sharing OTP, password, UPI PIN, CVV, full card/bank details and full private IDs.',
      evidenceRequired: 'Warning panel screenshot and redacted-pack checklist evidence.',
      riskIfSkipped: 'Users can leak secrets inside proof packs or screenshots.'
    },
    {
      id: 'mobile-qa-reviewed',
      priority: 'P1',
      label: 'Mobile organizer QA reviewed',
      status: mobileReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PROOF_FILE_MOBILE_QA_REVIEWED=${env('PROOF_FILE_MOBILE_QA_REVIEWED', 'false')}`,
      passCondition: 'Long folder/file names wrap safely and no horizontal scroll appears on mobile.',
      evidenceRequired: 'Android/iPhone screenshots of form and generated organizer result.',
      riskIfSkipped: 'Long proof names can break the mobile layout.'
    },
    {
      id: 'translation-reviewed',
      priority: 'P2',
      label: 'Key-language copy reviewed',
      status: translationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PROOF_FILE_TRANSLATION_REVIEWED=${env('PROOF_FILE_TRANSLATION_REVIEWED', 'false')}`,
      passCondition: 'Terms like originals, redacted copies, proof index and missing proof are reviewed in priority languages.',
      evidenceRequired: 'Language QA screenshot or reviewer note.',
      riskIfSkipped: 'Users may misunderstand originals vs redacted copies.'
    },
    {
      id: 'export-copy-reviewed',
      priority: 'P1',
      label: 'Copy proof index reviewed',
      status: exportReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PROOF_FILE_EXPORT_COPY_REVIEWED=${env('PROOF_FILE_EXPORT_COPY_REVIEWED', 'false')}`,
      passCondition: 'Copy-ready proof index includes redaction confirmation and avoids private secrets.',
      evidenceRequired: 'Copied proof index sample saved in evidence folder.',
      riskIfSkipped: 'Copied proof index can leak private IDs or encourage over-sharing.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length

  return {
    version: '3.0.62-proof-file-organizer',
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      lanes: proofFileOrganizerReadinessLanes.length,
      launchStatus: blocked > 0 ? 'BLOCKED' : manualRequired > 0 ? 'MANUAL_REVIEW_REQUIRED' : 'READY_TO_TEST'
    },
    controls,
    proofFileOrganizerReadinessLanes,
    safetyPolicy: [
      'Keep originals private and share only redacted copies unless an official verified portal asks for originals.',
      'Do not place OTP, passwords, UPI PINs, CVV, full card/bank numbers or full Aadhaar/PAN in notes or file names.',
      'Use a clear numbered proof index so support teams, banks and offices can review attachments quickly.',
      'Public proof packs must hide phone, email, address, account IDs, unrelated faces and private document text.'
    ]
  }
}
