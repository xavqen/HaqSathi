export type CourierParcelReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const courierParcelReadinessLanes = [
  {
    id: 'parcel-copy',
    priority: 'P0',
    lane: 'Courier dispute copy',
    reviewRule: 'Tool must generate factual lost/damaged/delivered/pickup/courier scam copy without promising refund, trace success or compensation.',
    safetyRule: 'Every generated message must ask for official written status, POD/trace result or timeline.'
  },
  {
    id: 'proof-safety',
    priority: 'P0',
    lane: 'Proof privacy safety',
    reviewRule: 'Tool must warn against sharing full address, phone, OTP, payment secrets, full ID numbers and private home/location details.',
    safetyRule: 'No flow should ask users to paste delivery OTP, full address, full ID or unrestricted payment details.'
  },
  {
    id: 'scam-link-safety',
    priority: 'P0',
    lane: 'Fake courier/customs scam safety',
    reviewRule: 'Tool must warn users against random customs, KYC, delivery reschedule, refund and remote-access links.',
    safetyRule: 'High-risk fake courier cases must route users to official courier/platform/payment channels only.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long issue labels, tracking/order fields, proof list, copy block and escalation cards must work on small Android Chrome screens.',
    safetyRule: 'No horizontal overflow or hidden copy button on mobile.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): CourierParcelReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getCourierParcelReadinessReport() {
  const mode = env('COURIER_PARCEL_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Courier parcel planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as CourierParcelReadinessStatus : 'BLOCKED' as CourierParcelReadinessStatus,
      envValue: `COURIER_PARCEL_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until courier copy, proof privacy, fake courier scam safety and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Courier dispute copy reviewed',
      status: boolStatus('COURIER_PARCEL_COPY_REVIEWED'),
      envValue: `COURIER_PARCEL_COPY_REVIEWED=${env('COURIER_PARCEL_COPY_REVIEWED', 'false')}`,
      note: 'Review lost parcel, marked delivered, damaged/wrong item, pickup stuck, COD/payment and fake courier copy.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Proof privacy warnings reviewed',
      status: boolStatus('COURIER_PARCEL_PRIVACY_REVIEWED'),
      envValue: `COURIER_PARCEL_PRIVACY_REVIEWED=${env('COURIER_PARCEL_PRIVACY_REVIEWED', 'false')}`,
      note: 'Confirm warnings for full address, phone, OTP, payment secrets, full IDs and private location details.'
    },
    {
      id: 'scam-reviewed',
      priority: 'P0',
      label: 'Fake courier scam route reviewed',
      status: boolStatus('COURIER_PARCEL_SCAM_ROUTE_REVIEWED'),
      envValue: `COURIER_PARCEL_SCAM_ROUTE_REVIEWED=${env('COURIER_PARCEL_SCAM_ROUTE_REVIEWED', 'false')}`,
      note: 'Confirm suspicious customs/refund/reschedule/KYC links route users to official courier/platform/payment channels only.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('COURIER_PARCEL_MOBILE_QA_REVIEWED'),
      envValue: `COURIER_PARCEL_MOBILE_QA_REVIEWED=${env('COURIER_PARCEL_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test selects, long proof list, copy block and CTA layout on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.75-courier-parcel-dispute-planner',
    mode,
    owner: env('COURIER_PARCEL_OWNER', 'Product/Courier safety'),
    controls,
    courierParcelReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not replace official courier/platform/seller/bank instructions.',
      'Never request delivery OTP, UPI PIN, CVV, card PIN, account password, full ID number, full address or remote access.',
      'Users should open official courier/platform apps/sites themselves instead of clicking suspicious SMS/WhatsApp links.',
      'Marked-delivered/damaged/wrong-item cases should preserve tracking, package, invoice and support proof before status changes.',
      'Generated messages should be factual, calm and proof-based without refund, delivery, replacement or compensation guarantees.'
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
