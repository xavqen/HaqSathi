type Status = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
type Priority = 'P0' | 'P1' | 'P2'

const controls: Array<{ id: string; priority: Priority; label: string; env: string; note: string }> = [
  { id: 'mode', priority: 'P0', label: 'Lost document planner mode selected', env: 'LOST_DOCUMENT_PLANNER_MODE', note: 'Use local_only until official report/reissue routes are reviewed.' },
  { id: 'copy-reviewed', priority: 'P0', label: 'Lost report and duplicate/reissue copy reviewed', env: 'LOST_DOCUMENT_COPY_REVIEWED', note: 'Review copy for guidance-only wording and no guaranteed report/reissue outcome.' },
  { id: 'official-route-reviewed', priority: 'P0', label: 'Police/official authority route reviewed', env: 'LOST_DOCUMENT_OFFICIAL_ROUTE_REVIEWED', note: 'Verify police/e-FIR/NC/lost-report, duplicate/reissue and provider blocking routes.' },
  { id: 'identity-safety-reviewed', priority: 'P0', label: 'Identity misuse safety reviewed', env: 'LOST_DOCUMENT_IDENTITY_SAFETY_REVIEWED', note: 'Confirm OTP/password/full ID/QR/barcode/CVV/UPI PIN/remote access warnings are visible.' },
  { id: 'mobile-qa', priority: 'P1', label: 'Mobile/tablet/desktop QA completed', env: 'LOST_DOCUMENT_MOBILE_QA_REVIEWED', note: 'Check form, proof checklist, copy button and long report text on small screens.' }
]

export const lostDocumentReadinessLanes = [
  { id: 'misuse-blocking', priority: 'P0' as Priority, lane: 'Misuse blocking', reviewRule: 'SIM/card/bank/UPI/device blocking advice must appear before general follow-up when risk exists.', safetyRule: 'Never ask for OTP, SIM swap code, UPI PIN, CVV, passwords or remote access.' },
  { id: 'official-report', priority: 'P0' as Priority, lane: 'Official lost report', reviewRule: 'Police/e-FIR/NC/GD/lost-report wording must stay jurisdiction-neutral and official-route only.', safetyRule: 'No guarantee of FIR/NC acceptance, duplicate approval or faster police action.' },
  { id: 'duplicate-reissue', priority: 'P1' as Priority, lane: 'Duplicate/reissue', reviewRule: 'Duplicate/reprint/reissue route must direct users to official issuer/provider channels.', safetyRule: 'Avoid agents, random payment links and unofficial document recovery services.' },
  { id: 'privacy', priority: 'P1' as Priority, lane: 'Identity privacy', reviewRule: 'Masked document-number guidance, redaction warning and private sharing instructions must be visible.', safetyRule: 'Hide full ID numbers, QR/barcodes, address, phone/email, account/card numbers and family data.' }
]

function statusFor(id: string, value: string): Status {
  if (id === 'mode') return value ? 'READY_TO_TEST' : 'BLOCKED'
  return value === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

function envValue(key: string) {
  return process.env[key] || (key.endsWith('_MODE') ? 'local_only' : 'false')
}

export function getLostDocumentReadinessReport() {
  const mapped = controls.map((control) => {
    const value = envValue(control.env)
    return { ...control, envValue: value, status: statusFor(control.id, value) }
  })

  return {
    version: '3.0.79-lost-document-report-planner',
    generatedAt: new Date().toISOString(),
    owner: process.env.LOST_DOCUMENT_OWNER || 'Product/Identity safety',
    summary: {
      status: mapped.some((control) => control.status === 'BLOCKED') ? 'BLOCKED' : mapped.some((control) => control.status === 'MANUAL_REQUIRED') ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      totalControls: mapped.length,
      ready: mapped.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: mapped.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: mapped.filter((control) => control.status === 'BLOCKED').length
    },
    controls: mapped,
    lostDocumentReadinessLanes
  }
}
