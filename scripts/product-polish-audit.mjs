import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const exists = (p) => fs.existsSync(path.join(root, p))

const issues = []
const warnings = []

function collectFiles(dir, acc = []) {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const rel = path.join(dir, name).replaceAll('\\', '/')
    const stat = fs.statSync(path.join(root, rel))
    if (stat.isDirectory()) collectFiles(rel, acc)
    else acc.push(rel)
  }
  return acc
}

const toolDirs = fs.readdirSync(path.join(root, 'app/tools'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
const catalog = read('lib/tools/catalog.ts')
const catalogSlugs = [...catalog.matchAll(/href:\s*'\/tools\/([^']+)'/g)].map((m) => m[1]).sort()
const missingFromCatalog = toolDirs.filter((slug) => !catalogSlugs.includes(slug))
const missingPages = catalogSlugs.filter((slug) => !exists(`app/tools/${slug}/page.tsx`))
if (missingFromCatalog.length) issues.push(`Tools missing from catalog: ${missingFromCatalog.join(', ')}`)
if (missingPages.length) issues.push(`Catalog points to missing tool pages: ${missingPages.join(', ')}`)

const sourceFiles = collectFiles('app').concat(collectFiles('components')).filter((file) => /\.(tsx|ts)$/.test(file))
const hinglishTerms = [' karo', ' pao', ' nahi', ' hai', ' hain', ' hoga', ' zaroor', ' turant', ' Aap', ' aap', ' ke liye', ' se pehle']
let hardcodedHits = []
for (const file of sourceFiles) {
  const text = read(file)
  const hits = hinglishTerms.filter((term) => text.includes(term))
  if (hits.length) hardcodedHits.push({ file, hits })
  if (/^['\"]use client['\"]/.test(text) && !text.startsWith("'use client'\n") && !text.startsWith('"use client"\n')) issues.push(`Malformed use client directive: ${file}`)
}
if (hardcodedHits.length > 120) warnings.push(`Many files still contain Indian-language helper copy (${hardcodedHits.length}). This is acceptable for legal/tool outputs, but core UI should stay English-first.`)

const globals = read('app/globals.css')
if (!globals.includes('overflow-x: hidden')) issues.push('Global overflow-x protection missing')
if (!globals.includes('padding-bottom: calc(76px + env(safe-area-inset-bottom))')) warnings.push('Mobile safe-area bottom padding not detected')
if (!globals.includes('.desktop-floating-feedback')) warnings.push('Mobile floating feedback guard not detected')

const navbar = read('components/layout/navbar.tsx')
if (!navbar.includes('/login?next=/tools')) issues.push('Start Free logged-out redirect is not configured')
if (!navbar.includes("user ? '/tools'")) warnings.push('Start Free logged-in route to tools is not obvious')
if (!navbar.includes('xl:flex')) warnings.push('Desktop navbar may not be using simplified desktop-only nav')

const dashboardShell = read('components/dashboard/dashboard-shell.tsx')
if (!dashboardShell.includes('navGroups')) issues.push('Dashboard navigation is not grouped')
if (dashboardShell.includes('moreLinks.slice')) issues.push('Dashboard still uses old crowded moreLinks chip navigation')

const adminShell = read('components/admin/admin-shell.tsx')
if (!adminShell.includes('groups')) issues.push('Admin navigation is not grouped')

const layout = read('app/layout.tsx')
if (!layout.includes('data-app-language')) issues.push('Root layout does not expose selected app language')
if (!layout.includes('dir={htmlSettings.dir}')) issues.push('RTL direction support missing in root layout')

const pkg = JSON.parse(read('package.json'))
if (!String(pkg.version).match(/^3\.0\.[5-9]|^3\.[1-9]/)) issues.push(`package.json version should be 3.0.5 or newer product-polish version, found ${pkg.version}`)

console.log('HaqSathi AI product polish audit')
console.log(`Tool pages: ${toolDirs.length}`)
console.log(`Catalog tools: ${catalogSlugs.length}`)
console.log(`Source files scanned: ${sourceFiles.length}`)
console.log(`English-first copy warnings: ${hardcodedHits.length}`)
if (warnings.length) {
  console.log('\nWarnings:')
  for (const warning of warnings) console.log(`⚠️  ${warning}`)
}
if (issues.length) {
  console.log('\nIssues:')
  for (const issue of issues) console.log(`❌ ${issue}`)
  process.exit(1)
}
console.log('\n✅ Product polish audit passed: tools catalog, grouped UX, responsive guards and language shell look OK.')
