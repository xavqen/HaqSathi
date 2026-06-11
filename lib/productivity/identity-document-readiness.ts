export type IdentityDocumentReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const identityDocumentReadinessLanes = [
  {
    id: 'official-route',
    priority: 'P0',
    lane: 'Official correction route',
    reviewRule: 'Tool must direct users to official issuing authority routes for Aadhaar, PAN, voter ID, passport, DL, certificates and bank KYC.',
    safetyRule: 'No agent promises, instant correction claims, unofficial link redirects or guaranteed approval language.'
  },
  {
    id: 'identity-safety',
    priority: 'P0',
    lane: 'Identity data safety',
    reviewRule: 'Tool must warn users not to share OTP, passwords, full ID numbers, QR/barcodes, CVV, UPI PIN or remote access.',
    safetyRule: 'Generated copy must avoid asking for full Aadhaar/PAN/passport/account/card details.'
  },
  {
    id: 'proof-consistency',
    priority: 'P1',
    lane: 'Proof consistency',
    reviewRule: 'Tool must help users compare current wrong value, correct value and supporting proof without giving legal guarantees.',
    safetyRule: 'Proof checklist must tell users to redact unrelated family/address/payment data before public sharing.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long correction requests, date inputs, selects and copy block must work on Android Chrome, tablet and desktop.',
    safetyRule: 'No horizontal overflow, clipped select text or hidden copy button on small screens.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): IdentityDocumentReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getIdentityDocumentReadinessReport() {
  const mode = env('IDENTITY_DOCUMENT_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Identity document planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as IdentityDocumentReadinessStatus : 'BLOCKED' as IdentityDocumentReadinessStatus,
      envValue: `IDENTITY_DOCUMENT_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until official route, identity safety, copy review and mobile QA are completed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Correction request copy reviewed',
      status: boolStatus('IDENTITY_DOCUMENT_COPY_REVIEWED'),
      envValue: `IDENTITY_DOCUMENT_COPY_REVIEWED=${env('IDENTITY_DOCUMENT_COPY_REVIEWED', 'false')}`,
      note: 'Review Aadhaar, PAN, passport, voter ID, DL, certificate and bank KYC correction copy for safe wording.'
    },
    {
      id: 'official-route-reviewed',
      priority: 'P0',
      label: 'Official correction route reviewed',
      status: boolStatus('IDENTITY_DOCUMENT_OFFICIAL_ROUTE_REVIEWED'),
      envValue: `IDENTITY_DOCUMENT_OFFICIAL_ROUTE_REVIEWED=${env('IDENTITY_DOCUMENT_OFFICIAL_ROUTE_REVIEWED', 'false')}`,
      note: 'Confirm that all route text points users to official issuing authority channels only.'
    },
    {
      id: 'identity-safety-reviewed',
      priority: 'P0',
      label: 'Identity data safety reviewed',
      status: boolStatus('IDENTITY_DOCUMENT_SAFETY_REVIEWED'),
      envValue: `IDENTITY_DOCUMENT_SAFETY_REVIEWED=${env('IDENTITY_DOCUMENT_SAFETY_REVIEWED', 'false')}`,
      note: 'Confirm OTP/password/full ID/QR/barcode/CVV/UPI PIN/remote-access warnings are visible.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('IDENTITY_DOCUMENT_MOBILE_QA_REVIEWED'),
      envValue: `IDENTITY_DOCUMENT_MOBILE_QA_REVIEWED=${env('IDENTITY_DOCUMENT_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test selects, long proof text, copy request block and responsive cards on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.78-identity-document-correction-planner',
    mode,
    owner: env('IDENTITY_DOCUMENT_OWNER', 'Product/Document safety'),
    controls,
    identityDocumentReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not replace official issuing authority rules or legal advice.',
      'Users must verify correction requirements, proof documents, fees and timeline with official authority channels.',
      'Never request OTP, password, full Aadhaar/PAN/passport/account number, QR/barcode, CVV, UPI PIN or remote access.',
      'Generated copy should request verification, correction status and missing requirements in writing; it must not guarantee approval.',
      'Users should avoid agents, random WhatsApp/Telegram contacts and unofficial correction links.'
    ],
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      status: blocked ? 'BLOCKED' : manualRequired ? 'MANUAL_REQUIRED' : 'READY_TO_TEST'
    }
  }
}
