import { existsSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/db'

export type SeoAuditItem = { area: string; item: string; ok: boolean; note: string }
const cwd = process.cwd()
const exists = (rel: string) => existsSync(join(/* turbopackIgnore: true */ cwd, rel))

export async function getSeoAudit(): Promise<SeoAuditItem[]> {
  const items: SeoAuditItem[] = [
    { area: 'Routes', item: 'sitemap.ts exists', ok: exists('app/sitemap.ts'), note: 'Dynamic sitemap route available.' },
    { area: 'Routes', item: 'robots.ts exists', ok: exists('app/robots.ts'), note: 'Robots route available.' },
    { area: 'Metadata', item: 'root metadata exists', ok: exists('app/layout.tsx'), note: 'Root layout contains metadataBase/title/description.' },
    { area: 'Programmatic SEO', item: '/complaint/[slug]', ok: exists('app/complaint/[slug]/page.tsx'), note: 'Complaint SEO route available.' },
    { area: 'Programmatic SEO', item: '/refund/[company]', ok: exists('app/refund/[company]/page.tsx'), note: 'Refund company SEO route available.' },
    { area: 'Programmatic SEO', item: '/scheme/[state]/[slug]', ok: exists('app/scheme/[state]/[slug]/page.tsx'), note: 'State scheme SEO route available if folder exists.' },
    { area: 'Programmatic SEO', item: '/documents/[slug]', ok: exists('app/documents/[slug]/page.tsx'), note: 'Document guide SEO route available.' }
  ]

  if (!process.env.DATABASE_URL) {
    items.push({ area: 'Database', item: 'SEO DB audit', ok: false, note: 'Set DATABASE_URL, then run db:doctor and seed.' })
  } else try {
    const [seoPages, blogPosts, sources, stateGuides] = await Promise.all([
      db.seoPage.count(),
      db.blogPost.count().catch(() => 0),
      db.officialSource.count().catch(() => 0),
      db.stateGuide.count().catch(() => 0)
    ])
    items.push(
      { area: 'Seed', item: '20+ SEO pages', ok: seoPages >= 20, note: `${seoPages} seeded SEO pages.` },
      { area: 'Content', item: 'Blog posts available', ok: blogPosts >= 3, note: `${blogPosts} blog posts seeded.` },
      { area: 'Trust', item: 'Official sources available', ok: sources >= 3, note: `${sources} official sources seeded.` },
      { area: 'Local SEO', item: 'State guides available', ok: stateGuides >= 3, note: `${stateGuides} state guides seeded.` }
    )
  } catch {
    items.push({ area: 'Database', item: 'SEO DB audit', ok: false, note: 'Database unavailable. Run db:doctor and seed.' })
  }

  return items
}
