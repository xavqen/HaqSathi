import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/db'

export type LaunchCheck = { area: string; item: string; ok: boolean; note: string }

const cwd = process.cwd()
const exists = (path: string) => existsSync(join(/* turbopackIgnore: true */ cwd, path))
const envSet = (name: string) => Boolean(process.env[name] && !String(process.env[name]).includes('change-this') && !String(process.env[name]).includes('[YOUR-PASSWORD]'))
const hasDatabase = envSet('DATABASE_URL')

export async function getLaunchChecks(): Promise<LaunchCheck[]> {
  const checks: LaunchCheck[] = [
    { area: 'Core', item: 'package.json exists', ok: exists('package.json'), note: 'Required for npm scripts.' },
    { area: 'Core', item: 'Prisma schema exists', ok: exists('prisma/schema.prisma'), note: 'Required for database.' },
    { area: 'Core', item: 'Prisma config exists', ok: exists('prisma.config.ts'), note: 'Required for newer Prisma CLI config.' },
    { area: 'Security', item: 'AUTH_SECRET configured', ok: envSet('AUTH_SECRET'), note: 'Set a long random value in production.' },
    { area: 'Security', item: 'Next proxy exists', ok: exists('proxy.ts'), note: 'Next.js 16 proxy file for headers/security.' },
    { area: 'Database', item: 'DATABASE_URL configured', ok: envSet('DATABASE_URL'), note: 'Use Supabase PostgreSQL pooler/Prisma connection string.' },
    { area: 'Database', item: 'DIRECT_URL configured', ok: envSet('DIRECT_URL'), note: 'Use Supabase direct connection string for Prisma directUrl.' },
    { area: 'PWA', item: 'Manifest route exists', ok: exists('app/manifest.ts'), note: 'Install support metadata.' },
    { area: 'PWA', item: 'Service worker exists', ok: exists('public/sw.js'), note: 'Offline fallback support.' },
    { area: 'SEO', item: 'Sitemap route exists', ok: exists('app/sitemap.ts'), note: 'Search indexing.' },
    { area: 'SEO', item: 'Robots route exists', ok: exists('app/robots.ts'), note: 'Crawler control.' },
    { area: 'Billing', item: 'Razorpay key present', ok: envSet('RAZORPAY_KEY_ID'), note: 'Required only before real payments.' },
    { area: 'Email', item: 'Resend key present', ok: envSet('RESEND_API_KEY'), note: 'Required only before real email sending.' },
    { area: 'Monitoring', item: 'Health API exists', ok: exists('app/api/health/route.ts'), note: 'Basic uptime endpoint for deployment checks.' },
    { area: 'Monitoring', item: 'Ready API exists', ok: exists('app/api/ready/route.ts'), note: 'DB/env readiness endpoint for production checks.' },
    { area: 'UX', item: 'not-found page exists', ok: exists('app/not-found.tsx'), note: 'Friendly 404 page.' },
    { area: 'UX', item: 'error boundary exists', ok: exists('app/error.tsx'), note: 'Friendly runtime error page.' },
    { area: 'Build', item: 'middleware.ts removed', ok: !exists('middleware.ts'), note: 'Next 16 proxy-only setup avoids duplicate middleware/proxy crash.' }
  ]

  if (!hasDatabase) {
    checks.push({ area: 'Database', item: 'DB connection check', ok: false, note: 'Set DATABASE_URL, then run npm run db:doctor, npm run db:push and npm run db:seed.' })
  } else try {
    const [seoPages, templates, resources] = await Promise.all([db.seoPage.count(), db.template.count(), db.officialResource.count()])
    checks.push(
      { area: 'Seed', item: 'SEO pages seeded', ok: seoPages >= 20, note: `${seoPages} SEO pages found.` },
      { area: 'Seed', item: 'Templates seeded', ok: templates >= 5, note: `${templates} templates found.` },
      { area: 'Seed', item: 'Resources seeded', ok: resources >= 3, note: `${resources} resources found.` }
    )
  } catch {
    checks.push({ area: 'Database', item: 'DB connection check', ok: false, note: 'Run npm run db:doctor, then npm run db:push and npm run db:seed.' })
  }

  try {
    const pkg = JSON.parse(readFileSync(join(/* turbopackIgnore: true */ cwd, 'package.json'), 'utf8'))
    checks.push(
      { area: 'Scripts', item: 'db:doctor script', ok: Boolean(pkg.scripts?.['db:doctor']), note: 'Local database troubleshooting command.' },
      { area: 'Scripts', item: 'launch:audit script', ok: Boolean(pkg.scripts?.['launch:audit']), note: 'Local launch audit command.' },
      { area: 'Scripts', item: 'phase17:audit script', ok: Boolean(pkg.scripts?.['phase17:audit']), note: 'Final hardening audit command.' },
      { area: 'Scripts', item: 'build:guard script', ok: Boolean(pkg.scripts?.['build:guard']), note: 'Pre-build guard for common launch mistakes.' }
    )
  } catch {}

  return checks
}
