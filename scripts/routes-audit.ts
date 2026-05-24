import { existsSync } from 'fs'
import { join } from 'path'

const routes = [
  '/', '/complaint', '/refund', '/upi-help', '/cyber-fraud', '/bank-complaint', '/scheme-finder', '/documents', '/templates', '/resources', '/pricing', '/blog', '/contact', '/about', '/privacy', '/terms', '/disclaimer', '/login', '/register', '/forgot-password', '/dashboard', '/dashboard/templates', '/dashboard/settings', '/admin', '/admin/templates', '/admin/resources', '/admin/feedback'
]

let missing = 0
for (const route of routes) {
  const p = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`
  const ok = existsSync(join(process.cwd(), p))
  console.log(`${ok ? '✓' : '✗'} ${route} -> ${p}`)
  if (!ok) missing++
}
if (missing) process.exit(1)
console.log(`Route audit passed: ${routes.length} core routes present.`)
