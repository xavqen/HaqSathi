export type MobileAppReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type MobileAppReadinessControl = {
  id: string
  label: string
  status: MobileAppReadinessStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
}

export type MobileAppReadinessLane = {
  id: string
  label: string
  priority: 'P0' | 'P1' | 'P2'
  platform: string
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
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD|com\.example|org\.example/i.test(value))
}

function readiness(isReady: boolean, fallback: MobileAppReadinessStatus = 'MANUAL_REQUIRED'): MobileAppReadinessStatus {
  return isReady ? 'READY_TO_TEST' : fallback
}

const coreRoutes = ['/', '/complaint', '/upi-help', '/documents', '/tools', '/dashboard']

const lanes: MobileAppReadinessLane[] = [
  {
    id: 'android-twa-readiness',
    label: 'Android TWA wrapper readiness',
    priority: 'P0',
    platform: 'Android',
    check: 'Build a trusted web activity or Capacitor shell, verify final HTTPS origin, app icon, splash screen, standalone navigation and deep links.',
    risk: 'If Android wrapper metadata or asset links are wrong, Play Store install can open as a browser tab or fail domain verification.',
    evidenceRequired: ['Signed Android build screenshot', 'assetlinks.json verification proof', 'Installed app launch screenshot']
  },
  {
    id: 'ios-wrapper-readiness',
    label: 'iOS web wrapper readiness',
    priority: 'P1',
    platform: 'iOS',
    check: 'Validate iOS wrapper, safe-area layout, keyboard behavior, external links, privacy prompts and in-app browser restrictions.',
    risk: 'iOS safe-area, keyboard and review-policy issues can break forms even if the PWA works in Chrome.',
    evidenceRequired: ['iPhone safe-area screenshots', 'Keyboard form screenshot', 'External link behavior proof']
  },
  {
    id: 'store-listing-assets',
    label: 'Store listing assets',
    priority: 'P0',
    platform: 'Android + iOS',
    check: 'Prepare app name, short description, screenshots, privacy policy URL, support URL, content rating answers and data safety forms.',
    risk: 'Store submission can be rejected or delayed if privacy/data-safety answers are inconsistent with website behavior.',
    evidenceRequired: ['Play Console draft screenshots', 'App Store Connect draft screenshots', 'Data safety form draft']
  },
  {
    id: 'mobile-auth-payment-policy',
    label: 'Auth/payment policy review',
    priority: 'P0',
    platform: 'Android + iOS',
    check: 'Verify login, payment, subscription, cancellation and external payment policy before app-store submission.',
    risk: 'Payment/subscription policy mismatch can trigger rejection or account risk.',
    evidenceRequired: ['Auth flow screenshot', 'Pricing screen screenshot', 'Cancellation/support flow screenshot']
  },
  {
    id: 'device-permission-safety',
    label: 'Device permission safety',
    priority: 'P1',
    platform: 'Android + iOS',
    check: 'Verify camera, microphone, notification and file permissions are asked only after user action and clear purpose text.',
    risk: 'Early or unclear permission prompts reduce trust and can fail review.',
    evidenceRequired: ['Permission prompt screenshots', 'Purpose text screenshot']
  },
  {
    id: 'crash-analytics-release',
    label: 'Crash and release monitoring',
    priority: 'P1',
    platform: 'Android + iOS',
    check: 'Attach version, build number, release channel and crash monitoring to mobile shells before beta testers install.',
    risk: 'Without mobile release visibility, wrapper-only bugs look like random website bugs and are hard to debug.',
    evidenceRequired: ['Release version screenshot', 'Crash monitoring dashboard screenshot']
  }
]

export function getMobileAppReadinessReport() {
  const strategy = env('NATIVE_APP_STRATEGY', 'pwa_first')
  const routes = env('MOBILE_APP_ROUTE_TARGETS', coreRoutes.join(',')).split(',').map((route) => route.trim()).filter(Boolean)
  const evidenceDir = env('MOBILE_APP_EVIDENCE_DIR', './artifacts/mobile-app-readiness')
  const productionUrlReady = configured('NEXT_PUBLIC_APP_URL')
  const androidPackageReady = configured('ANDROID_PACKAGE_NAME')
  const iosBundleReady = configured('IOS_BUNDLE_ID')
  const appNameReady = configured('NATIVE_APP_NAME') || configured('NEXT_PUBLIC_SITE_NAME')
  const supportUrlReady = configured('NATIVE_APP_SUPPORT_URL') || productionUrlReady
  const privacyUrlReady = configured('NATIVE_APP_PRIVACY_URL') || productionUrlReady
  const androidReviewed = enabled('PLAY_STORE_READINESS_REVIEWED')
  const iosReviewed = enabled('APP_STORE_READINESS_REVIEWED')
  const twaReviewed = enabled('TWA_ASSET_LINKS_REVIEWED') || strategy !== 'twa'
  const capacitorReviewed = enabled('CAPACITOR_SYNC_REVIEWED') || strategy !== 'capacitor'
  const permissionsReviewed = enabled('MOBILE_APP_PERMISSION_REVIEWED')
  const storeAssetsReviewed = enabled('MOBILE_APP_STORE_ASSETS_REVIEWED')
  const paymentsReviewed = enabled('MOBILE_APP_PAYMENT_POLICY_REVIEWED')

  const controls: MobileAppReadinessControl[] = [
    {
      id: 'strategy-selected',
      label: 'Native app strategy selected',
      status: ['pwa_first', 'twa', 'capacitor'].includes(strategy) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `NATIVE_APP_STRATEGY=${strategy}`,
      passCondition: 'Strategy is pwa_first, twa or capacitor so the team knows the release path.',
      evidenceRequired: 'Founder decision note and release path screenshot.'
    },
    {
      id: 'production-url',
      label: 'Production HTTPS URL configured',
      status: readiness(productionUrlReady, 'BLOCKED'),
      envValue: `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`,
      passCondition: 'Final HTTPS domain is configured before any native wrapper or store submission.',
      evidenceRequired: 'Production domain screenshot.'
    },
    {
      id: 'app-name',
      label: 'Native app name configured',
      status: readiness(appNameReady),
      envValue: `NATIVE_APP_NAME=${env('NATIVE_APP_NAME') || env('NEXT_PUBLIC_SITE_NAME') || 'empty'}`,
      passCondition: 'Native app name is consistent with the website branding.',
      evidenceRequired: 'Manifest/store listing name screenshot.'
    },
    {
      id: 'android-package',
      label: 'Android package name configured',
      status: readiness(androidPackageReady),
      envValue: `ANDROID_PACKAGE_NAME=${env('ANDROID_PACKAGE_NAME') || 'empty'}`,
      passCondition: 'Android package name is final and not a sample namespace.',
      evidenceRequired: 'Android project/app ID screenshot.'
    },
    {
      id: 'ios-bundle',
      label: 'iOS bundle ID configured',
      status: readiness(iosBundleReady),
      envValue: `IOS_BUNDLE_ID=${env('IOS_BUNDLE_ID') || 'empty'}`,
      passCondition: 'iOS bundle ID is final and tied to the Apple developer account.',
      evidenceRequired: 'App Store Connect bundle ID screenshot.'
    },
    {
      id: 'support-url',
      label: 'Support URL ready',
      status: readiness(supportUrlReady),
      envValue: `NATIVE_APP_SUPPORT_URL=${env('NATIVE_APP_SUPPORT_URL') || 'fallback:NEXT_PUBLIC_APP_URL'}`,
      passCondition: 'Support URL opens a working support/contact page from the app listing.',
      evidenceRequired: 'Support URL screenshot.'
    },
    {
      id: 'privacy-url',
      label: 'Privacy URL ready',
      status: readiness(privacyUrlReady),
      envValue: `NATIVE_APP_PRIVACY_URL=${env('NATIVE_APP_PRIVACY_URL') || 'fallback:NEXT_PUBLIC_APP_URL'}`,
      passCondition: 'Privacy URL is public, accurate and linked from store listings.',
      evidenceRequired: 'Privacy URL screenshot.'
    },
    {
      id: 'twa-asset-links',
      label: 'TWA asset links reviewed',
      status: twaReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `TWA_ASSET_LINKS_REVIEWED=${env('TWA_ASSET_LINKS_REVIEWED', 'false')}`,
      passCondition: 'assetlinks.json, SHA-256 fingerprint and production origin are verified if Android TWA is used.',
      evidenceRequired: 'Digital Asset Links validation screenshot.'
    },
    {
      id: 'capacitor-sync',
      label: 'Capacitor sync reviewed',
      status: capacitorReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `CAPACITOR_SYNC_REVIEWED=${env('CAPACITOR_SYNC_REVIEWED', 'false')}`,
      passCondition: 'Capacitor config, app ID, webDir and sync output are reviewed if Capacitor is used.',
      evidenceRequired: 'Capacitor config and build screenshot.'
    },
    {
      id: 'store-assets',
      label: 'Store assets reviewed',
      status: storeAssetsReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `MOBILE_APP_STORE_ASSETS_REVIEWED=${env('MOBILE_APP_STORE_ASSETS_REVIEWED', 'false')}`,
      passCondition: 'Screenshots, icon, description, support URL, privacy URL and content-rating answers are prepared.',
      evidenceRequired: 'Play Console/App Store Connect draft screenshots.'
    },
    {
      id: 'permission-review',
      label: 'Permission prompts reviewed',
      status: permissionsReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `MOBILE_APP_PERMISSION_REVIEWED=${env('MOBILE_APP_PERMISSION_REVIEWED', 'false')}`,
      passCondition: 'Camera, microphone, file and notification prompts are shown only after user action.',
      evidenceRequired: 'Permission prompt screenshots on real devices.'
    },
    {
      id: 'payment-policy',
      label: 'Mobile payment policy reviewed',
      status: paymentsReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `MOBILE_APP_PAYMENT_POLICY_REVIEWED=${env('MOBILE_APP_PAYMENT_POLICY_REVIEWED', 'false')}`,
      passCondition: 'Subscription, cancellation, external payment and refund flows are reviewed against store policy.',
      evidenceRequired: 'Pricing, payment and cancellation screenshots.'
    },
    {
      id: 'mobile-app-evidence-dir',
      label: 'Mobile app evidence directory configured',
      status: 'READY_TO_TEST',
      envValue: `MOBILE_APP_EVIDENCE_DIR=${evidenceDir}`,
      passCondition: 'Local readiness outputs are saved in a stable folder before launch review.',
      evidenceRequired: 'mobile-app-readiness.json and CSV outputs.'
    },
    {
      id: 'play-store-review',
      label: 'Play Store readiness reviewed',
      status: androidReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PLAY_STORE_READINESS_REVIEWED=${env('PLAY_STORE_READINESS_REVIEWED', 'false')}`,
      passCondition: 'Play Console store listing, data safety and internal testing release are reviewed.',
      evidenceRequired: 'Play Console internal testing proof.'
    },
    {
      id: 'app-store-review',
      label: 'App Store readiness reviewed',
      status: iosReviewed ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `APP_STORE_READINESS_REVIEWED=${env('APP_STORE_READINESS_REVIEWED', 'false')}`,
      passCondition: 'App Store Connect listing, privacy nutrition labels and TestFlight release are reviewed.',
      evidenceRequired: 'App Store Connect/TestFlight proof.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.39-mobile-app-readiness',
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
      'Do not submit a native wrapper until the deployed HTTPS website, auth, privacy policy and support route are stable.',
      'Do not request camera, microphone, file or notification permission before a clear user action.',
      'Do not claim government affiliation in store listing copy.',
      'Do not launch paid subscriptions in a mobile app until store payment rules and cancellation flows are reviewed.',
      'Keep PWA-first as the default strategy unless Android/iOS store distribution is truly needed.'
    ],
    runbook: [
      'Keep NATIVE_APP_STRATEGY=pwa_first until the website passes public launch QA.',
      'Choose TWA for Android-only lightweight launch or Capacitor for deeper native shell control.',
      'Set Android package name, iOS bundle ID, support URL and privacy URL before wrapper builds.',
      'Prepare store screenshots from real devices, not only desktop responsive mode.',
      'Verify permissions, payments, support, privacy and content-rating forms before beta release.',
      'Save Play Console/TestFlight screenshots before marking mobile app readiness reviewed.'
    ]
  }
}
