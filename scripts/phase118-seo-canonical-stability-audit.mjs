import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(path, 'utf8')
}

function pass(label, ok) {
  if (!ok) {
    console.error(`❌ ${label}`)
    process.exitCode = 1
    return
  }
  console.log(`✅ ${label}`)
}

const pkg = JSON.parse(read('package.json'))
const utils = read('lib/utils.ts')
const layout = read('app/layout.tsx')
const sitemap = read('app/sitemap.ts')
const robots = read('app/robots.ts')
const articleSchema = read('components/seo/article-schema.tsx')
const blogPage = read('app/blog/[slug]/page.tsx')
const phase = read('PHASE_118_SEO_CANONICAL_STABILITY.md')

const seoCriticalFiles = {
  'app/sitemap.ts': sitemap,
  'app/robots.ts': robots,
  'components/seo/article-schema.tsx': articleSchema,
  'app/blog/[slug]/page.tsx': blogPage
}

console.log('\nPhase 118 SEO canonical stability audit')
pass('version is v3.0.88 or newer', (/^3\.0\.(8[8-9]|9[0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)))
pass('phase118 audit script is registered', pkg.scripts['phase118:audit'] === 'node scripts/phase118-seo-canonical-stability-audit.mjs')
pass('quality release includes phase118', pkg.scripts['quality:release'].includes('phase118:audit'))
pass('site URL helper normalizes protocol and trailing slash', utils.includes('export function getSiteUrl()') && utils.includes('https://${rawUrl}') && utils.includes("replace(/\\/+$/, '')"))
pass('absoluteUrl handles root and path joining', utils.includes("if (cleanPath === '/') return `${getSiteUrl()}/`") && utils.includes('return `${getSiteUrl()}${cleanPath}`'))
pass('metadataBase uses normalized site URL', layout.includes("metadataBase: new URL(getSiteUrl())") && layout.includes("import { getSiteUrl } from '@/lib/utils'"))
pass('sitemap uses normalized absoluteUrl helper', sitemap.includes("import { absoluteUrl } from '@/lib/utils'") && sitemap.includes("route === '' ? absoluteUrl('/') : absoluteUrl(route)"))
pass('robots exposes normalized sitemap and blocks private routes', robots.includes("sitemap: absoluteUrl('/sitemap.xml')") && robots.includes("'/api'") && robots.includes("'/dashboard'"))
pass('article schema uses normalized canonical page URL', articleSchema.includes("mainEntityOfPage: absoluteUrl(`/blog/${slug}`)"))
pass('blog breadcrumbs use normalized absolute URLs', blogPage.includes("absoluteUrl('/blog')") && blogPage.includes("absoluteUrl(`/blog/${post.slug}`)"))
pass('SEO critical files avoid raw NEXT_PUBLIC_APP_URL string-building', Object.values(seoCriticalFiles).every((content) => !content.includes('process.env.NEXT_PUBLIC_APP_URL')))
pass('phase report documents the launch SEO risk', phase.includes('Google Search Console') && phase.includes('single source'))

if (process.exitCode) {
  console.error('\nPhase 118 failed: fix the SEO/canonical stability guard above.')
} else {
  console.log('\n✅ Phase 118 passed: canonical URL, sitemap and robots stability are hardened.')
}
