export type AccessibilityStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type AccessibilityPriority = 'P0' | 'P1' | 'P2'

export type AccessibilityControl = {
  id: string
  label: string
  status: AccessibilityStatus
  priority: AccessibilityPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type AccessibilityRouteCheck = {
  route: string
  priority: AccessibilityPriority
  checks: string[]
  evidenceRequired: string[]
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

function control(
  id: string,
  label: string,
  status: AccessibilityStatus,
  priority: AccessibilityPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): AccessibilityControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const routeTargets = env('ACCESSIBILITY_ROUTE_TARGETS', '/,/complaint,/upi-help,/scheme-finder,/documents,/tools,/chat,/dashboard,/pricing,/admin/launch-command-center')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const routeChecks: AccessibilityRouteCheck[] = routeTargets.map((route, index) => ({
  route,
  priority: index < 6 ? 'P0' : index < 9 ? 'P1' : 'P2',
  checks: [
    'Page can be navigated using keyboard only',
    'Focus ring is visible on links, buttons, inputs and menus',
    'Headings follow a readable order',
    'Interactive controls have clear accessible names',
    'Text contrast remains readable in mobile and desktop layouts',
    'Forms expose labels, errors and helper text without relying only on color'
  ],
  evidenceRequired: [
    'Keyboard tab-through screenshot or short recording',
    'Mobile screenshot with focused form/control',
    'Desktop screenshot with focused menu/control',
    'axe/Lighthouse accessibility result for the route'
  ]
}))

const controls: AccessibilityControl[] = [
  control(
    'production-url',
    'Production URL configured for accessibility QA',
    configured('VERCEL_PRODUCTION_URL') || configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}`,
    'A real HTTPS deployed URL is available for Lighthouse/axe and keyboard QA.',
    'Production URL screenshot and terminal output from accessibility readiness run.',
    'Localhost-only checks can miss real font loading, script, CDN, cookie banner and mobile viewport issues.'
  ),
  control(
    'owner-assigned',
    'Accessibility QA owner assigned',
    configured('ACCESSIBILITY_QA_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `ACCESSIBILITY_QA_OWNER=${env('ACCESSIBILITY_QA_OWNER') || 'empty'}`,
    'A named owner is responsible for accessibility signoff before launch.',
    'Owner name in launch notes or /admin/accessibility-readiness screenshot.',
    'Accessibility bugs may stay unowned and block users who rely on keyboard or assistive technology.'
  ),
  control(
    'keyboard-reviewed',
    'Keyboard navigation reviewed',
    enabled('ACCESSIBILITY_KEYBOARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ACCESSIBILITY_KEYBOARD_REVIEWED=${env('ACCESSIBILITY_KEYBOARD_REVIEWED', 'false')}`,
    'Core routes can be used with Tab, Shift+Tab, Enter, Space and Escape where relevant.',
    'Keyboard walkthrough proof for home, complaint, tools, dashboard and admin shell.',
    'Users may get trapped in menus, skip actions, or fail to submit forms without a mouse.'
  ),
  control(
    'focus-reviewed',
    'Visible focus states reviewed',
    enabled('ACCESSIBILITY_FOCUS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ACCESSIBILITY_FOCUS_REVIEWED=${env('ACCESSIBILITY_FOCUS_REVIEWED', 'false')}`,
    'All major buttons, links, inputs, dropdowns and bottom-nav items show a visible focus indicator.',
    'Screenshots of focused navbar, form, dropdown, bottom nav and admin quick nav.',
    'Keyboard users cannot tell where they are on the page.'
  ),
  control(
    'forms-reviewed',
    'Form labels and errors reviewed',
    enabled('ACCESSIBILITY_FORM_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ACCESSIBILITY_FORM_REVIEWED=${env('ACCESSIBILITY_FORM_REVIEWED', 'false')}`,
    'Complaint, UPI, scheme, document, auth and support forms expose labels and readable errors.',
    'Form screenshots with labels, validation error and helper text visible on mobile and desktop.',
    'Users may enter wrong data or fail silently when validation errors are not perceivable.'
  ),
  control(
    'contrast-reviewed',
    'Text contrast reviewed',
    enabled('ACCESSIBILITY_CONTRAST_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `ACCESSIBILITY_CONTRAST_REVIEWED=${env('ACCESSIBILITY_CONTRAST_REVIEWED', 'false')}`,
    'Primary text, muted text, badges, alerts and CTA states remain readable on mobile and desktop.',
    'Lighthouse/axe contrast evidence plus screenshots for badges, cards, warnings and hero CTA.',
    'Important guidance, warnings and actions may be difficult to read for low-vision users.'
  ),
  control(
    'screen-reader-reviewed',
    'Screen reader semantics reviewed',
    enabled('ACCESSIBILITY_SCREEN_READER_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `ACCESSIBILITY_SCREEN_READER_REVIEWED=${env('ACCESSIBILITY_SCREEN_READER_REVIEWED', 'false')}`,
    'Landmarks, headings, button names, link text and status messages are meaningful.',
    'NVDA/VoiceOver or browser accessibility tree proof for core routes.',
    'Assistive technology users may hear unclear controls or miss critical status updates.'
  ),
  control(
    'reduced-motion-reviewed',
    'Reduced motion behavior reviewed',
    enabled('ACCESSIBILITY_REDUCED_MOTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P2',
    `ACCESSIBILITY_REDUCED_MOTION_REVIEWED=${env('ACCESSIBILITY_REDUCED_MOTION_REVIEWED', 'false')}`,
    'The app remains usable when prefers-reduced-motion is enabled.',
    'Browser setting screenshot and route screenshot with reduced motion enabled.',
    'Motion-sensitive users may experience discomfort or lose context during transitions.'
  ),
  control(
    'evidence-dir',
    'Accessibility evidence directory configured',
    Boolean(env('ACCESSIBILITY_EVIDENCE_DIR', './artifacts/accessibility-readiness')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P2',
    `ACCESSIBILITY_EVIDENCE_DIR=${env('ACCESSIBILITY_EVIDENCE_DIR', './artifacts/accessibility-readiness')}`,
    'Local evidence generator writes JSON and CSV files for launch review.',
    'Generated artifacts/accessibility-readiness folder.',
    'Launch reviewers cannot verify which accessibility gates are complete.'
  )
]

const assistiveTechMatrix = [
  { id: 'keyboard-only', label: 'Keyboard only', priority: 'P0' as AccessibilityPriority, checks: ['Tab order', 'Escape closes menus', 'Enter/Space activate buttons', 'No focus trap'] },
  { id: 'android-talkback', label: 'Android TalkBack', priority: 'P1' as AccessibilityPriority, checks: ['Bottom nav labels', 'Form field names', 'Status/warning text', 'Dialog/dropdown announcements'] },
  { id: 'ios-voiceover', label: 'iOS VoiceOver', priority: 'P1' as AccessibilityPriority, checks: ['Safari rotor headings', 'Safe-area controls', 'CTA labels', 'External link clarity'] },
  { id: 'desktop-nvda', label: 'Desktop NVDA/Chrome', priority: 'P2' as AccessibilityPriority, checks: ['Landmarks', 'Headings', 'Form errors', 'Admin table navigation'] }
]

const runbook = [
  'Deploy latest build to a real HTTPS URL before final accessibility evidence capture.',
  'Run npm run accessibility:readiness and open /admin/accessibility-readiness.',
  'Start with P0 routes and P0 checks: keyboard navigation, focus, forms and critical CTAs.',
  'Capture mobile and desktop screenshots for focus states, form errors, menus and bottom navigation.',
  'Run Lighthouse or axe on production routes and save the reports with the generated artifacts.',
  'Do a quick screen-reader smoke test on at least one mobile and one desktop environment.',
  'Mark env review flags true only after evidence is saved and P0/P1 issues are fixed.'
]

export function getAccessibilityReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const p0Controls = controls.filter((item) => item.priority === 'P0').length
  const p0Routes = routeChecks.filter((item) => item.priority === 'P0').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.41-accessibility-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      p0Controls,
      routeTargets: routeChecks.length,
      p0Routes,
      assistiveTechTargets: assistiveTechMatrix.length
    },
    controls,
    routeChecks,
    assistiveTechMatrix,
    runbook,
    nextAction: blocked
      ? 'Set a real deployed HTTPS URL before accessibility launch review.'
      : manualRequired
        ? 'Collect keyboard, focus, form, contrast and screen-reader evidence before public launch.'
        : 'Accessibility readiness gates are complete for launch review.'
  }
}
