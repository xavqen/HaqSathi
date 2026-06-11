export type VehicleChallanReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const vehicleChallanReadinessLanes = [
  {
    id: 'copy-safety',
    priority: 'P0',
    lane: 'Challan dispute copy',
    reviewRule: 'Tool must generate factual dispute copy for wrong vehicle, paid-but-pending, duplicate, incorrect violation, vehicle-sold and towing cases without promising cancellation/refund.',
    safetyRule: 'Copy must ask for official written status and timeline only.'
  },
  {
    id: 'payment-safety',
    priority: 'P0',
    lane: 'Payment/link safety',
    reviewRule: 'Tool must warn users to use official traffic/e-challan portals and avoid random challan links or agents.',
    safetyRule: 'No OTP, UPI PIN, card PIN, CVV, password or remote access collection.'
  },
  {
    id: 'privacy-redaction',
    priority: 'P0',
    lane: 'Vehicle/privacy redaction',
    reviewRule: 'Tool must tell users to redact address, phone, full ID, engine/chassis number and unrelated documents.',
    safetyRule: 'No public sharing of full RC/ID/address/payment details.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long challan messages, selects, amount/date fields and copy block must work on Android Chrome and desktop.',
    safetyRule: 'No horizontal overflow or hidden submit/copy actions.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): VehicleChallanReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getVehicleChallanReadinessReport() {
  const mode = env('VEHICLE_CHALLAN_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Vehicle challan planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as VehicleChallanReadinessStatus : 'BLOCKED' as VehicleChallanReadinessStatus,
      envValue: `VEHICLE_CHALLAN_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until copy, official route, payment safety and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Challan dispute copy reviewed',
      status: boolStatus('VEHICLE_CHALLAN_COPY_REVIEWED'),
      envValue: `VEHICLE_CHALLAN_COPY_REVIEWED=${env('VEHICLE_CHALLAN_COPY_REVIEWED', 'false')}`,
      note: 'Review wrong vehicle, duplicate, paid-but-pending, towing and vehicle-sold copy.'
    },
    {
      id: 'official-route-reviewed',
      priority: 'P0',
      label: 'Official challan route reviewed',
      status: boolStatus('VEHICLE_CHALLAN_OFFICIAL_ROUTE_REVIEWED'),
      envValue: `VEHICLE_CHALLAN_OFFICIAL_ROUTE_REVIEWED=${env('VEHICLE_CHALLAN_OFFICIAL_ROUTE_REVIEWED', 'false')}`,
      note: 'Confirm official traffic/e-challan/state police/transport route wording and scam warning.'
    },
    {
      id: 'payment-safety-reviewed',
      priority: 'P0',
      label: 'Challan payment/link safety reviewed',
      status: boolStatus('VEHICLE_CHALLAN_PAYMENT_SAFETY_REVIEWED'),
      envValue: `VEHICLE_CHALLAN_PAYMENT_SAFETY_REVIEWED=${env('VEHICLE_CHALLAN_PAYMENT_SAFETY_REVIEWED', 'false')}`,
      note: 'Confirm random link/agent/OTP/UPI PIN/CVV/password/remote access warnings are visible.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('VEHICLE_CHALLAN_MOBILE_QA_REVIEWED'),
      envValue: `VEHICLE_CHALLAN_MOBILE_QA_REVIEWED=${env('VEHICLE_CHALLAN_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form, date/amount fields, long copy block and escalation cards on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.77-vehicle-challan-dispute-planner',
    mode,
    owner: env('VEHICLE_CHALLAN_OWNER', 'Product/Transport safety'),
    controls,
    vehicleChallanReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not replace official traffic/transport authority or legal instructions.',
      'Users must verify challan details through official traffic/e-challan/state police/transport portal only.',
      'Never request OTP, UPI PIN, CVV, card PIN, password, full ID, engine/chassis number or remote access.',
      'Generated messages should be factual and should not guarantee challan cancellation, refund or penalty removal.',
      'Users should avoid random challan-removal agents, links and unofficial payment requests.'
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
