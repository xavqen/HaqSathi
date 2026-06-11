import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.REAL_DEVICE_QA_EVIDENCE_DIR || './artifacts/real-device-qa'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

const routes = env('REAL_DEVICE_QA_ROUTES', '/,/complaint,/upi-help,/scheme-finder,/documents,/tools,/dashboard,/pricing')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const controls = [
  ['production-url', 'Production URL configured', configured('VERCEL_PRODUCTION_URL') || configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}`],
  ['device-matrix-owner', 'Device QA owner assigned', configured('REAL_DEVICE_QA_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REAL_DEVICE_QA_OWNER=${env('REAL_DEVICE_QA_OWNER') || 'empty'}`],
  ['android-proof', 'Android Chrome proof saved', enabled('ANDROID_CHROME_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ANDROID_CHROME_QA_REVIEWED=${env('ANDROID_CHROME_QA_REVIEWED', 'false')}`],
  ['ios-proof', 'iOS Safari proof saved', enabled('IOS_SAFARI_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `IOS_SAFARI_QA_REVIEWED=${env('IOS_SAFARI_QA_REVIEWED', 'false')}`],
  ['tablet-proof', 'Tablet proof saved', enabled('TABLET_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `TABLET_QA_REVIEWED=${env('TABLET_QA_REVIEWED', 'false')}`],
  ['desktop-proof', 'Desktop proof saved', enabled('DESKTOP_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DESKTOP_QA_REVIEWED=${env('DESKTOP_QA_REVIEWED', 'false')}`],
  ['bug-capture', 'Bug capture workflow ready', configured('REAL_DEVICE_BUG_INBOX') || configured('SUPPORT_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REAL_DEVICE_BUG_INBOX=${env('REAL_DEVICE_BUG_INBOX') || 'fallback:SUPPORT_EMAIL'}`],
  ['screenshot-dir', 'Evidence directory configured', 'READY_TO_TEST', `REAL_DEVICE_QA_EVIDENCE_DIR=${outputDir}`]
]

const devices = [
  ['android-small-chrome', 'P0', 'mobile', 'Small Android Chrome', '360×800', 'Header, bottom nav, language/profile menus, complaint form'],
  ['android-large-chrome', 'P0', 'mobile', 'Large Android Chrome', '412×915', 'Cards, keyboard behavior, tools grid, PWA prompt'],
  ['iphone-safari-safe-area', 'P1', 'mobile', 'iPhone Safari safe-area', '390×844', 'Safe area, sticky bars, Safari viewport behavior'],
  ['tablet-portrait', 'P1', 'tablet', 'Tablet portrait', '768×1024', 'Admin quick nav, form widths, table overflow'],
  ['laptop-desktop', 'P0', 'desktop', 'Laptop desktop', '1366×768', 'Desktop nav, admin sidebar, profile dropdown, hero fold'],
  ['wide-desktop', 'P2', 'desktop', 'Wide desktop', '1920×1080', 'Max-width readability and card stretching']
]

const bugTemplate = [
  ['field', 'description'],
  ['route_url', 'Exact route where issue appears'],
  ['device_browser', 'Device model and browser version'],
  ['viewport', 'Viewport size or screenshot dimensions'],
  ['summary', 'One-line issue summary'],
  ['evidence', 'Screenshot/video filename or link'],
  ['expected', 'Expected responsive behavior'],
  ['actual', 'Actual broken behavior'],
  ['severity', 'P0/P1/P2'],
  ['owner_status', 'Owner and fix status']
]

const ready = controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[2] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.40-real-device-qa-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    devices: devices.length,
    p0Devices: devices.filter((device) => device[1] === 'P0').length,
    routes: routes.length
  },
  controls: controls.map(([id, label, status, envValue]) => ({ id, label, status, envValue })),
  devices: devices.map(([id, priority, type, label, viewport, checks]) => ({ id, priority, type, label, viewport, checks })),
  routes,
  nextAction: blocked ? 'Set a real deployed HTTPS URL before real-device QA.' : manualRequired ? 'Collect device screenshots and bug evidence before public launch.' : 'Real-device QA evidence gates are ready for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'real-device-qa-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'real-device-controls.csv'), csv([['id', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'real-device-matrix.csv'), csv([['id', 'priority', 'type', 'label', 'viewport', 'checks'], ...devices]))
writeFileSync(join(outputDir, 'real-device-routes.csv'), csv([['route'], ...routes.map((route) => [route])]))
writeFileSync(join(outputDir, 'real-device-bug-template.csv'), csv(bugTemplate))

console.log(`✅ Real device QA readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Devices: ${devices.length} · Routes: ${routes.length}`)
