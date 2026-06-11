export type DeviceQaStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type DeviceQaPriority = 'P0' | 'P1' | 'P2'

export type DeviceQaDevice = {
  id: string
  label: string
  viewport: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  priority: DeviceQaPriority
  coreChecks: string[]
  evidenceRequired: string[]
  riskIfSkipped: string
}

export type DeviceQaControl = {
  id: string
  label: string
  status: DeviceQaStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function control(id: string, label: string, status: DeviceQaStatus, envValue: string, passCondition: string, evidenceRequired: string): DeviceQaControl {
  return { id, label, status, envValue, passCondition, evidenceRequired }
}

const coreRoutes = env('REAL_DEVICE_QA_ROUTES', '/,/complaint,/upi-help,/scheme-finder,/documents,/tools,/dashboard,/pricing')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const devices: DeviceQaDevice[] = [
  {
    id: 'android-small-chrome',
    label: 'Small Android Chrome',
    viewport: '360×800',
    deviceType: 'mobile',
    priority: 'P0',
    coreChecks: ['Header does not wrap badly', 'Bottom navigation does not cover content', 'Language/profile popovers stay inside viewport', 'Forms and CTA buttons are touch-friendly'],
    evidenceRequired: ['Home screenshot', 'Complaint form screenshot', 'Language menu screenshot', 'Profile/menu screenshot'],
    riskIfSkipped: 'Most Indian low-end Android users may see overflow, hidden buttons, or unusable forms.'
  },
  {
    id: 'android-large-chrome',
    label: 'Large Android Chrome',
    viewport: '412×915',
    deviceType: 'mobile',
    priority: 'P0',
    coreChecks: ['Long cards stack cleanly', 'No horizontal scroll', 'PWA install prompt remains readable', 'Keyboard does not hide important form actions'],
    evidenceRequired: ['Dashboard screenshot', 'Tools grid screenshot', 'Input focused screenshot'],
    riskIfSkipped: 'Common mobile viewport may pass static audit but still break with keyboard and long Hindi/Hinglish text.'
  },
  {
    id: 'iphone-safari-safe-area',
    label: 'iPhone Safari safe-area',
    viewport: '390×844',
    deviceType: 'mobile',
    priority: 'P1',
    coreChecks: ['Safe-area bottom spacing', 'Sticky bars do not overlap', 'External links open safely', 'Viewport units do not jump on Safari chrome'],
    evidenceRequired: ['Home screenshot', 'Bottom nav screenshot', 'Long page scroll end screenshot'],
    riskIfSkipped: 'iOS Safari may hide bottom actions or create jumpy scroll.'
  },
  {
    id: 'tablet-portrait',
    label: 'Tablet portrait',
    viewport: '768×1024',
    deviceType: 'tablet',
    priority: 'P1',
    coreChecks: ['Cards use two-column layout where safe', 'Admin quick nav scrolls horizontally', 'Forms do not become too narrow', 'Tables use internal horizontal scrolling'],
    evidenceRequired: ['Admin page screenshot', 'Complaint page screenshot', 'Table/list screenshot'],
    riskIfSkipped: 'Tablet users may see awkward mobile/desktop crossover layouts.'
  },
  {
    id: 'laptop-desktop',
    label: 'Laptop desktop',
    viewport: '1366×768',
    deviceType: 'desktop',
    priority: 'P0',
    coreChecks: ['Desktop nav is compact', 'Admin sidebar is usable', 'Popovers are full width enough', 'Above-the-fold hero has no clipping'],
    evidenceRequired: ['Home screenshot', 'Admin screenshot', 'Profile dropdown screenshot'],
    riskIfSkipped: 'Desktop users may face crowded header, thin dropdowns, or clipped admin content.'
  },
  {
    id: 'wide-desktop',
    label: 'Wide desktop',
    viewport: '1920×1080',
    deviceType: 'desktop',
    priority: 'P2',
    coreChecks: ['Max-width keeps content readable', 'Cards do not stretch too wide', 'Launch/admin command pages remain scannable'],
    evidenceRequired: ['Home full-width screenshot', 'Admin command center screenshot'],
    riskIfSkipped: 'Large screens may look empty, stretched, or visually weak.'
  }
]

const controls: DeviceQaControl[] = [
  control('production-url', 'Production URL configured', configured('VERCEL_PRODUCTION_URL') || configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}`, 'Use a real HTTPS deployed URL for real-device QA.', 'Vercel production URL screenshot'),
  control('device-matrix-owner', 'Device QA owner assigned', configured('REAL_DEVICE_QA_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REAL_DEVICE_QA_OWNER=${env('REAL_DEVICE_QA_OWNER') || 'empty'}`, 'A person is responsible for collecting screenshots and bugs.', 'Owner name in launch notes'),
  control('android-proof', 'Android Chrome proof saved', enabled('ANDROID_CHROME_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ANDROID_CHROME_QA_REVIEWED=${env('ANDROID_CHROME_QA_REVIEWED', 'false')}`, 'Small and large Android Chrome screenshots are saved.', 'Android screenshots for home, complaint, tools, menu'),
  control('ios-proof', 'iOS Safari proof saved', enabled('IOS_SAFARI_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `IOS_SAFARI_QA_REVIEWED=${env('IOS_SAFARI_QA_REVIEWED', 'false')}`, 'iPhone Safari safe-area and sticky UI checks are saved.', 'iPhone Safari screenshots or browserstack proof'),
  control('tablet-proof', 'Tablet proof saved', enabled('TABLET_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `TABLET_QA_REVIEWED=${env('TABLET_QA_REVIEWED', 'false')}`, 'Tablet portrait checks pass on core pages.', 'Tablet screenshots for admin/form/table pages'),
  control('desktop-proof', 'Desktop proof saved', enabled('DESKTOP_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DESKTOP_QA_REVIEWED=${env('DESKTOP_QA_REVIEWED', 'false')}`, 'Laptop and wide desktop checks pass.', 'Desktop screenshots for home/admin/dropdown'),
  control('bug-capture', 'Bug capture workflow ready', configured('REAL_DEVICE_BUG_INBOX') || configured('SUPPORT_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REAL_DEVICE_BUG_INBOX=${env('REAL_DEVICE_BUG_INBOX') || 'fallback:SUPPORT_EMAIL'}`, 'Every device issue can be reported with route, viewport, screenshot and severity.', 'Bug inbox or issue tracker screenshot'),
  control('screenshot-dir', 'Evidence directory configured', Boolean(env('REAL_DEVICE_QA_EVIDENCE_DIR', './artifacts/real-device-qa')) ? 'READY_TO_TEST' : 'BLOCKED', `REAL_DEVICE_QA_EVIDENCE_DIR=${env('REAL_DEVICE_QA_EVIDENCE_DIR', './artifacts/real-device-qa')}`, 'Local evidence generator writes JSON/CSV checklist.', 'Generated artifacts folder')
]

const bugReportTemplate = [
  'Route URL',
  'Device model / browser',
  'Viewport size',
  'Issue summary',
  'Screenshot/video evidence',
  'Expected behavior',
  'Actual behavior',
  'Severity: P0/P1/P2',
  'Owner and fix status'
]

const runbook = [
  'Deploy to Vercel preview or production with final environment variables.',
  'Run npm run device-qa:readiness and open /admin/real-device-qa.',
  'Test the P0 device list first: small Android, large Android, laptop desktop.',
  'Open core routes and capture screenshots for header, forms, dropdowns, tables and bottom navigation.',
  'Record every issue with route, viewport, screenshot and severity before marking env flags reviewed.',
  'Re-run after every UI shell, navbar, popover, footer, admin shell or global CSS change.'
]

export function getRealDeviceQaReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const p0Devices = devices.filter((device) => device.priority === 'P0').length
  const mobileDevices = devices.filter((device) => device.deviceType === 'mobile').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.40-real-device-qa-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      devices: devices.length,
      p0Devices,
      mobileDevices,
      coreRoutes: coreRoutes.length
    },
    controls,
    devices,
    coreRoutes,
    bugReportTemplate,
    runbook,
    nextAction: blocked
      ? 'Set a real deployed HTTPS URL before real-device QA.'
      : manualRequired
        ? 'Collect screenshots and bug evidence on the P0 device matrix before public launch.'
        : 'Real-device QA evidence gates are complete for launch review.'
  }
}
