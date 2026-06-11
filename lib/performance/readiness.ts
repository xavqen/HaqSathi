export type PerformanceReadinessStatus = 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type PerformanceControl = {
  id: string
  label: string
  status: PerformanceReadinessStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
}

export type PerformanceLane = {
  id: string
  label: string
  priority: 'P0' | 'P1' | 'P2'
  target: string
  check: string
  risk: string
  evidenceRequired: string[]
}

export type PerformanceReadinessReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    lanes: number
    p0Lanes: number
    routes: number
  }
  controls: PerformanceControl[]
  lanes: PerformanceLane[]
  routeTargets: string[]
  runbook: string[]
  optimizationChecklist: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return env(name).toLowerCase() === 'true'
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function numberEnv(name: string, fallback: number) {
  const value = Number(env(name, String(fallback)))
  return Number.isFinite(value) ? value : fallback
}

function status(ok: boolean, missing: PerformanceReadinessStatus = 'MANUAL_REQUIRED'): PerformanceReadinessStatus {
  return ok ? 'READY_TO_TEST' : missing
}

const defaultRoutes = [
  '/',
  '/complaint',
  '/upi-help',
  '/scheme-finder',
  '/documents',
  '/tools',
  '/chat',
  '/pricing',
  '/dashboard'
]

const lanes: PerformanceLane[] = [
  {
    id: 'core-web-vitals-mobile',
    label: 'Core Web Vitals mobile pass',
    priority: 'P0',
    target: 'LCP ≤ 2500ms, CLS ≤ 0.10, INP ≤ 200ms',
    check: 'Run Lighthouse/PageSpeed on production mobile throttling for homepage and top tool pages.',
    risk: 'Most users will come from mobile; slow pages reduce trust, retention and SEO.',
    evidenceRequired: ['Mobile Lighthouse report', 'Core Web Vitals screenshot', 'Production URL/date note']
  },
  {
    id: 'critical-route-speed',
    label: 'Critical route speed budget',
    priority: 'P0',
    target: 'Home/tool pages interactive without jank',
    check: 'Review homepage, complaint, UPI help, scheme finder and document routes on low-end Android and desktop Chrome.',
    risk: 'Complaint generation and urgent fraud help must feel fast during stressful user sessions.',
    evidenceRequired: ['Mobile screen recording', 'Desktop screen recording', 'Route timing notes']
  },
  {
    id: 'image-font-optimization',
    label: 'Image and font delivery review',
    priority: 'P1',
    target: 'Compressed images, no layout shift, stable font loading',
    check: 'Verify hero images, icons, OG images and fonts do not cause horizontal scroll, CLS or heavy transfer.',
    risk: 'Large images and unstable fonts can break mobile UX and Lighthouse scores.',
    evidenceRequired: ['Network waterfall screenshot', 'Image audit note', 'Font loading note']
  },
  {
    id: 'javascript-bundle-budget',
    label: 'JavaScript bundle budget',
    priority: 'P1',
    target: 'No unnecessary client bundle growth on public pages',
    check: 'Run Next build analyzer or inspect route chunks after production build.',
    risk: 'Too much client JS hurts slow phones and makes tools feel frozen.',
    evidenceRequired: ['Build output screenshot', 'Largest chunks note', 'Action list for heavy routes']
  },
  {
    id: 'api-latency-budget',
    label: 'API latency budget',
    priority: 'P1',
    target: 'Core APIs respond quickly with rate-limit fallback',
    check: 'Smoke-test complaint draft, auth, dashboard, search and admin readiness APIs on deployed URL.',
    risk: 'Slow APIs make the app look broken even if UI loads fast.',
    evidenceRequired: ['API timing table', 'Vercel function log screenshot', 'Slow route action note']
  },
  {
    id: 'third-party-script-budget',
    label: 'Third-party script budget',
    priority: 'P2',
    target: 'Only necessary analytics/payment/ad scripts enabled',
    check: 'Review GA, ads, Razorpay, analytics and live chat scripts after consent and launch flags.',
    risk: 'Third-party scripts can block main thread, lower trust and create privacy risk.',
    evidenceRequired: ['Third-party script inventory', 'Consent proof', 'Performance waterfall screenshot']
  }
]

export function getPerformanceReadinessReport(): PerformanceReadinessReport {
  const routeTargets = env('PERFORMANCE_ROUTE_TARGETS', defaultRoutes.join(',')).split(',').map((route) => route.trim()).filter(Boolean)
  const minPerformance = numberEnv('LIGHTHOUSE_MIN_PERFORMANCE', 75)
  const minAccessibility = numberEnv('LIGHTHOUSE_MIN_ACCESSIBILITY', 90)
  const minBestPractices = numberEnv('LIGHTHOUSE_MIN_BEST_PRACTICES', 90)
  const minSeo = numberEnv('LIGHTHOUSE_MIN_SEO', 90)
  const lcp = numberEnv('WEB_VITALS_LCP_TARGET_MS', 2500)
  const cls = env('WEB_VITALS_CLS_TARGET', '0.10')
  const inp = numberEnv('WEB_VITALS_INP_TARGET_MS', 200)

  const controls: PerformanceControl[] = [
    {
      id: 'production-url',
      label: 'Production URL configured',
      status: status(configured('NEXT_PUBLIC_APP_URL'), 'BLOCKED'),
      envValue: `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`,
      passCondition: 'NEXT_PUBLIC_APP_URL points to the final HTTPS production domain, not localhost.',
      evidenceRequired: 'Production domain screenshot and Vercel domain proof.'
    },
    {
      id: 'lighthouse-base-url',
      label: 'Lighthouse base URL configured',
      status: status(Boolean(env('LIGHTHOUSE_BASE_URL', 'http://localhost:3000'))),
      envValue: `LIGHTHOUSE_BASE_URL=${env('LIGHTHOUSE_BASE_URL', 'http://localhost:3000')}`,
      passCondition: 'LIGHTHOUSE_BASE_URL can target local dev or deployed production for final proof.',
      evidenceRequired: 'Generated Lighthouse artifacts under the performance evidence folder.'
    },
    {
      id: 'score-budget',
      label: 'Lighthouse score budget declared',
      status: 'READY_TO_TEST',
      envValue: `P=${minPerformance} A=${minAccessibility} BP=${minBestPractices} SEO=${minSeo}`,
      passCondition: 'Minimum score thresholds are defined before launch testing starts.',
      evidenceRequired: 'Mobile and desktop Lighthouse JSON/HTML output.'
    },
    {
      id: 'web-vitals-budget',
      label: 'Core Web Vitals budget declared',
      status: 'READY_TO_TEST',
      envValue: `LCP=${lcp}ms CLS=${cls} INP=${inp}ms`,
      passCondition: 'Mobile web-vitals targets are visible to QA and founder before launch signoff.',
      evidenceRequired: 'PageSpeed/Lighthouse screenshots for P0 routes.'
    },
    {
      id: 'mobile-throttle-reviewed',
      label: 'Mobile throttling reviewed',
      status: enabled('PERFORMANCE_MOBILE_THROTTLE_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PERFORMANCE_MOBILE_THROTTLE_REVIEWED=${env('PERFORMANCE_MOBILE_THROTTLE_REVIEWED', 'false')}`,
      passCondition: 'Low-end Android or throttled Chrome test has been reviewed.',
      evidenceRequired: 'Android screenshot/recording or Lighthouse throttled mobile report.'
    },
    {
      id: 'bundle-reviewed',
      label: 'Bundle size reviewed',
      status: enabled('PERFORMANCE_BUNDLE_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PERFORMANCE_BUNDLE_REVIEWED=${env('PERFORMANCE_BUNDLE_REVIEWED', 'false')}`,
      passCondition: 'Next.js build output or bundle analyzer is reviewed for public routes.',
      evidenceRequired: 'Build output screenshot and route chunk notes.'
    },
    {
      id: 'image-font-reviewed',
      label: 'Images and fonts reviewed',
      status: enabled('PERFORMANCE_IMAGE_REVIEWED') && enabled('PERFORMANCE_FONT_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `IMAGE=${env('PERFORMANCE_IMAGE_REVIEWED', 'false')} FONT=${env('PERFORMANCE_FONT_REVIEWED', 'false')}`,
      passCondition: 'Image compression, dimensions, lazy loading and font shift risks are reviewed.',
      evidenceRequired: 'Network screenshot, CLS screenshot and manual review note.'
    },
    {
      id: 'performance-evidence-dir',
      label: 'Performance evidence directory configured',
      status: status(Boolean(env('PERFORMANCE_EVIDENCE_DIR', './artifacts/performance-readiness'))),
      envValue: `PERFORMANCE_EVIDENCE_DIR=${env('PERFORMANCE_EVIDENCE_DIR', './artifacts/performance-readiness')}`,
      passCondition: 'Readiness reports are saved in a stable evidence folder.',
      evidenceRequired: 'performance-readiness.json and CSV outputs.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.37-performance-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      lanes: lanes.length,
      p0Lanes: lanes.filter((lane) => lane.priority === 'P0').length,
      routes: routeTargets.length
    },
    controls,
    lanes,
    routeTargets,
    runbook: [
      'Deploy the latest build to the final Vercel production domain.',
      'Run npm run performance:readiness to generate local performance evidence.',
      'Run npm run lighthouse:local against local dev and again against the deployed URL.',
      'Open /admin/performance-readiness and save the dashboard screenshot.',
      'Test P0 routes on a real Android phone and desktop browser.',
      'Only mark review env flags true after Lighthouse, bundle, image/font and low-end mobile evidence are saved.'
    ],
    optimizationChecklist: [
      'Keep public landing pages mostly server-rendered and avoid unnecessary client components.',
      'Use responsive image dimensions and avoid layout shift in hero/cards.',
      'Keep sticky banners, language dropdowns and bottom nav from covering primary CTAs.',
      'Review third-party scripts after consent: ads, analytics, payment, live chat.',
      'Watch Vercel function cold starts for complaint, search, auth and dashboard APIs.',
      'Retest mobile after any new admin dashboard, modal, popover or table is added.'
    ]
  }
}
