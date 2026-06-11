export type PwaReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type PwaReadinessControl = {
  id: string
  label: string
  status: PwaReadinessStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
}

export type PwaReadinessLane = {
  id: string
  label: string
  priority: 'P0' | 'P1' | 'P2'
  device: string
  check: string
  risk: string
  evidenceRequired: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function status(isReady: boolean, fallback: PwaReadinessStatus = 'MANUAL_REQUIRED'): PwaReadinessStatus {
  return isReady ? 'READY_TO_TEST' : fallback
}

const defaultRoutes = ['/', '/complaint', '/upi-help', '/documents', '/tools', '/dashboard']

const lanes: PwaReadinessLane[] = [
  {
    id: 'android-install-flow',
    label: 'Android Chrome install flow',
    priority: 'P0',
    device: 'Android Chrome',
    check: 'Open deployed HTTPS URL, wait for beforeinstallprompt, install app, launch from home screen and verify standalone display.',
    risk: 'If install prompt or standalone launch fails, mobile users will treat the PWA like a normal website and retention drops.',
    evidenceRequired: ['Before install prompt screenshot', 'Installed icon screenshot', 'Standalone app screenshot']
  },
  {
    id: 'desktop-install-flow',
    label: 'Desktop Chrome/Edge install flow',
    priority: 'P1',
    device: 'Desktop Chrome/Edge',
    check: 'Install from browser address bar or app menu, open in standalone window and verify core navigation.',
    risk: 'Desktop users may not discover the install option if manifest, service worker or icons are invalid.',
    evidenceRequired: ['Desktop install prompt screenshot', 'Standalone desktop screenshot']
  },
  {
    id: 'offline-navigation',
    label: 'Offline navigation fallback',
    priority: 'P0',
    device: 'Mobile + desktop',
    check: 'Load site once, switch offline in DevTools/network settings, open a non-cached page and verify offline fallback appears.',
    risk: 'A broken offline fallback makes installed app feel crashed when user has weak internet.',
    evidenceRequired: ['Offline page screenshot', 'Service worker cache screenshot']
  },
  {
    id: 'cached-page-recovery',
    label: 'Cached page recovery',
    priority: 'P1',
    device: 'Mobile + desktop',
    check: 'Visit homepage and a core tool, go offline, revisit same pages and confirm cached response or offline page without white screen.',
    risk: 'Weak network users may face blank pages during complaint drafting if cache strategy is unsafe.',
    evidenceRequired: ['Visited route list', 'Offline revisit screenshot']
  },
  {
    id: 'safe-update-flow',
    label: 'Service worker update flow',
    priority: 'P1',
    device: 'Mobile + desktop',
    check: 'Deploy a new version, refresh, verify old cache clears and the new service worker controls the page.',
    risk: 'Old caches can keep broken UI or stale official links after production fixes.',
    evidenceRequired: ['Application tab screenshot', 'Cache version screenshot']
  },
  {
    id: 'push-permission-safety',
    label: 'Push permission safety',
    priority: 'P2',
    device: 'Android Chrome + desktop Chrome',
    check: 'Verify notification permission is not requested on first page load and is only asked after user action/consent.',
    risk: 'Early permission prompts reduce trust and can hurt browser permission reputation.',
    evidenceRequired: ['User-action screenshot', 'Permission prompt screenshot if enabled']
  }
]

export function getPwaReadinessReport() {
  const routes = env('PWA_OFFLINE_ROUTE_TARGETS', defaultRoutes.join(',')).split(',').map((route) => route.trim()).filter(Boolean)
  const pwaEnabled = enabled('NEXT_PUBLIC_ENABLE_PWA')
  const productionUrlReady = configured('NEXT_PUBLIC_APP_URL')
  const manifestReviewed = enabled('PWA_MANIFEST_REVIEWED')
  const offlineReviewed = enabled('PWA_OFFLINE_FALLBACK_REVIEWED')
  const installReviewed = enabled('PWA_INSTALL_FLOW_REVIEWED')
  const updateReviewed = enabled('PWA_UPDATE_FLOW_REVIEWED')
  const iconReviewed = enabled('PWA_ICON_REVIEWED')
  const pushSafe = enabled('PWA_PUSH_PERMISSION_REVIEWED') || !enabled('REMINDER_PUSH_ENABLED')

  const controls: PwaReadinessControl[] = [
    {
      id: 'pwa-enabled',
      label: 'PWA registration enabled',
      status: status(pwaEnabled, 'BLOCKED'),
      envValue: `NEXT_PUBLIC_ENABLE_PWA=${env('NEXT_PUBLIC_ENABLE_PWA', 'false')}`,
      passCondition: 'PWA service worker registration is enabled for deployed HTTPS testing.',
      evidenceRequired: 'Application tab shows an active service worker on production domain.'
    },
    {
      id: 'production-url',
      label: 'Production HTTPS URL configured',
      status: status(productionUrlReady, 'BLOCKED'),
      envValue: `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`,
      passCondition: 'NEXT_PUBLIC_APP_URL points to final HTTPS production domain, not localhost.',
      evidenceRequired: 'Vercel domain screenshot and opened production URL proof.'
    },
    {
      id: 'manifest-reviewed',
      label: 'Manifest reviewed',
      status: manifestReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PWA_MANIFEST_REVIEWED=${env('PWA_MANIFEST_REVIEWED', 'false')}`,
      passCondition: 'App name, short name, icons, start URL, scope, theme color and display mode are reviewed.',
      evidenceRequired: 'Chrome Application → Manifest screenshot.'
    },
    {
      id: 'icons-reviewed',
      label: 'Icons reviewed',
      status: iconReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PWA_ICON_REVIEWED=${env('PWA_ICON_REVIEWED', 'false')}`,
      passCondition: 'Maskable/home-screen icon quality is checked on Android and desktop.',
      evidenceRequired: 'Installed icon screenshot from Android home screen and desktop app list.'
    },
    {
      id: 'offline-fallback-reviewed',
      label: 'Offline fallback reviewed',
      status: offlineReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PWA_OFFLINE_FALLBACK_REVIEWED=${env('PWA_OFFLINE_FALLBACK_REVIEWED', 'false')}`,
      passCondition: 'Offline page appears instead of a browser error or blank screen.',
      evidenceRequired: 'Offline fallback screenshot on mobile and desktop.'
    },
    {
      id: 'install-flow-reviewed',
      label: 'Install flow reviewed',
      status: installReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PWA_INSTALL_FLOW_REVIEWED=${env('PWA_INSTALL_FLOW_REVIEWED', 'false')}`,
      passCondition: 'Install prompt, installed mode and standalone navigation are tested.',
      evidenceRequired: 'Install prompt and standalone app screenshots.'
    },
    {
      id: 'update-flow-reviewed',
      label: 'Update flow reviewed',
      status: updateReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PWA_UPDATE_FLOW_REVIEWED=${env('PWA_UPDATE_FLOW_REVIEWED', 'false')}`,
      passCondition: 'Old caches are removed and new service worker version activates after deployment.',
      evidenceRequired: 'Cache storage and active service worker version screenshot.'
    },
    {
      id: 'push-permission-reviewed',
      label: 'Push permission safety reviewed',
      status: pushSafe ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PWA_PUSH_PERMISSION_REVIEWED=${env('PWA_PUSH_PERMISSION_REVIEWED', 'false')}`,
      passCondition: 'Notification permission is requested only after clear user action and consent.',
      evidenceRequired: 'Permission UX screenshot and privacy review note.'
    },
    {
      id: 'pwa-evidence-dir',
      label: 'PWA evidence directory configured',
      status: 'READY_TO_TEST',
      envValue: `PWA_EVIDENCE_DIR=${env('PWA_EVIDENCE_DIR', './artifacts/pwa-readiness')}`,
      passCondition: 'Local readiness outputs are saved in a stable folder.',
      evidenceRequired: 'pwa-readiness.json and CSV outputs.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.38-pwa-offline-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST' || control.status === 'PASS').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      lanes: lanes.length,
      p0Lanes: lanes.filter((lane) => lane.priority === 'P0').length,
      routes: routes.length
    },
    controls,
    lanes,
    routeTargets: routes,
    safeLaunchRules: [
      'Do not request push notification permission on first page load.',
      'Do not cache authenticated API responses or private document vault files in the service worker.',
      'Use network-first navigation with offline fallback, not stale-only HTML for sensitive flows.',
      'Bump the service worker cache name on every production PWA behavior change.',
      'Test install and offline behavior on the final HTTPS domain, not only localhost.'
    ],
    runbook: [
      'Set NEXT_PUBLIC_ENABLE_PWA=true on the deployed environment.',
      'Open production URL in Android Chrome and verify manifest + service worker in DevTools remote debugging if possible.',
      'Install the app, launch from home screen and verify the header, bottom nav and core tools work in standalone mode.',
      'Go offline and verify cached pages or /offline.html appears without a blank screen.',
      'Deploy a version bump, refresh twice and verify the old cache is removed.',
      'Only after real evidence is saved, set PWA_*_REVIEWED flags to true.'
    ]
  }
}
