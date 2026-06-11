export type SeoIndexingStatus = 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type SeoIndexingControl = {
  id: string
  label: string
  status: SeoIndexingStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
}

export type SeoIndexingLane = {
  id: string
  label: string
  priority: 'P0' | 'P1' | 'P2'
  route: string
  check: string
  risk: string
  evidenceRequired: string[]
}

export type SeoIndexingReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    lanes: number
    p0Lanes: number
    indexedRoutes: number
  }
  controls: SeoIndexingControl[]
  lanes: SeoIndexingLane[]
  searchConsoleChecklist: string[]
  runbook: string[]
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

function status(ok: boolean, missing: SeoIndexingStatus = 'MANUAL_REQUIRED'): SeoIndexingStatus {
  return ok ? 'READY_TO_TEST' : missing
}

const defaultRoutes = [
  '/',
  '/complaint',
  '/upi-help',
  '/scheme-finder',
  '/documents',
  '/tools',
  '/official-sources',
  '/authority-directory',
  '/filing-guides',
  '/state-guides',
  '/pricing',
  '/blog'
]

const lanes: SeoIndexingLane[] = [
  {
    id: 'domain-property',
    label: 'Search Console domain property',
    priority: 'P0',
    route: 'https://www.haqsathi.site',
    check: 'Domain property exists and ownership is verified in Google Search Console.',
    risk: 'Without ownership, sitemap, indexing and coverage problems cannot be monitored.',
    evidenceRequired: ['Search Console property screenshot', 'Verified ownership proof', 'Owner/date note']
  },
  {
    id: 'sitemap-submit',
    label: 'Sitemap submitted and fetched',
    priority: 'P0',
    route: '/sitemap.xml',
    check: 'Sitemap opens on production URL and Search Console shows successful fetch.',
    risk: 'New pages may stay undiscovered or be delayed if sitemap fetch fails.',
    evidenceRequired: ['Browser screenshot of sitemap', 'Search Console sitemap success screenshot']
  },
  {
    id: 'robots-indexability',
    label: 'Robots and noindex guard',
    priority: 'P0',
    route: '/robots.txt',
    check: 'robots.txt allows public pages and blocks only private/admin/API routes.',
    risk: 'Wrong robots rules can block the full site or expose private areas to crawlers.',
    evidenceRequired: ['robots.txt screenshot', 'URL inspection screenshot for homepage']
  },
  {
    id: 'canonical-metadata',
    label: 'Canonical and metadata review',
    priority: 'P1',
    route: 'public + tool pages',
    check: 'Title, description, canonical URL, Open Graph and favicon render correctly.',
    risk: 'Duplicate or weak snippets reduce ranking and click-through.',
    evidenceRequired: ['View-source metadata proof', 'Rich result/social preview screenshot']
  },
  {
    id: 'core-route-inspection',
    label: 'Core route URL inspection',
    priority: 'P1',
    route: defaultRoutes.join(', '),
    check: 'Important routes are live, mobile-friendly and request indexing is available where needed.',
    risk: 'Broken or slow key pages can waste crawl budget and lose launch traffic.',
    evidenceRequired: ['URL inspection screenshots', 'Mobile usability screenshot', 'HTTP 200 proof']
  },
  {
    id: 'search-snippet-safety',
    label: 'Snippet safety and disclaimer review',
    priority: 'P2',
    route: 'guidance/legal/resource pages',
    check: 'Search snippets do not imply official government affiliation or guaranteed outcomes.',
    risk: 'Misleading snippets can hurt user trust and compliance.',
    evidenceRequired: ['SERP preview screenshot', 'Disclaimer snippet review note']
  }
]

export function getSeoIndexingReadinessReport(): SeoIndexingReport {
  const indexedRouteCount = env('SEO_INDEXING_CORE_ROUTES', defaultRoutes.join(',')).split(',').map((route) => route.trim()).filter(Boolean).length
  const controls: SeoIndexingControl[] = [
    {
      id: 'production-url',
      label: 'Production URL configured',
      status: status(configured('NEXT_PUBLIC_APP_URL'), 'BLOCKED'),
      envValue: `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`,
      passCondition: 'NEXT_PUBLIC_APP_URL points to the real production domain, not localhost or preview-only URL.',
      evidenceRequired: 'Production domain screenshot and Vercel domain assignment proof.'
    },
    {
      id: 'search-console-property',
      label: 'Search Console property verified',
      status: enabled('SEARCH_CONSOLE_PROPERTY_VERIFIED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `SEARCH_CONSOLE_PROPERTY_VERIFIED=${env('SEARCH_CONSOLE_PROPERTY_VERIFIED', 'false')}`,
      passCondition: 'Google Search Console domain or URL-prefix property is verified for the production domain.',
      evidenceRequired: 'Search Console ownership screenshot.'
    },
    {
      id: 'sitemap-submitted',
      label: 'Sitemap submitted successfully',
      status: enabled('SEARCH_CONSOLE_SITEMAP_SUBMITTED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `SEARCH_CONSOLE_SITEMAP_SUBMITTED=${env('SEARCH_CONSOLE_SITEMAP_SUBMITTED', 'false')}`,
      passCondition: 'Search Console reports sitemap fetch success for /sitemap.xml.',
      evidenceRequired: 'Search Console sitemap success screenshot and fetch date.'
    },
    {
      id: 'robots-reviewed',
      label: 'Robots.txt reviewed on production',
      status: enabled('ROBOTS_TXT_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `ROBOTS_TXT_REVIEWED=${env('ROBOTS_TXT_REVIEWED', 'false')}`,
      passCondition: 'Public pages are allowed and private admin/API routes are not indexable.',
      evidenceRequired: 'robots.txt browser screenshot and route review note.'
    },
    {
      id: 'canonical-reviewed',
      label: 'Canonical metadata reviewed',
      status: enabled('SEO_CANONICAL_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `SEO_CANONICAL_REVIEWED=${env('SEO_CANONICAL_REVIEWED', 'false')}`,
      passCondition: 'Canonical URLs, titles, descriptions and Open Graph data are correct on important routes.',
      evidenceRequired: 'Metadata screenshot or generated report for public routes.'
    },
    {
      id: 'indexing-evidence-dir',
      label: 'Indexing evidence directory configured',
      status: status(Boolean(env('SEO_INDEXING_EVIDENCE_DIR', './artifacts/seo-indexing'))),
      envValue: `SEO_INDEXING_EVIDENCE_DIR=${env('SEO_INDEXING_EVIDENCE_DIR', './artifacts/seo-indexing')}`,
      passCondition: 'Local readiness reports are saved in a stable evidence folder.',
      evidenceRequired: 'seo-indexing-readiness.json and CSV output.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.36-seo-indexing-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      lanes: lanes.length,
      p0Lanes: lanes.filter((lane) => lane.priority === 'P0').length,
      indexedRoutes: indexedRouteCount
    },
    controls,
    lanes,
    searchConsoleChecklist: [
      'Verify domain property or URL-prefix property in Google Search Console.',
      'Submit https://www.haqsathi.site/sitemap.xml and save success evidence.',
      'Inspect homepage, /complaint, /upi-help, /scheme-finder, /documents, /tools and /pricing.',
      'Confirm robots.txt does not block public routes and admin/API routes are not promoted for indexing.',
      'Review live titles/descriptions/canonical URLs after Vercel deployment.',
      'Save screenshots before sending ads, backlinks or SEO traffic.'
    ],
    runbook: [
      'Deploy the latest build to the final Vercel production domain.',
      'Open /robots.txt and /sitemap.xml on production, not localhost.',
      'Run npm run seo:indexing-readiness and save generated artifacts.',
      'Open /admin/seo-indexing and capture the readiness dashboard.',
      'Submit sitemap in Search Console and inspect P0 URLs.',
      'Only mark Search Console env flags true after real evidence is saved.'
    ]
  }
}
