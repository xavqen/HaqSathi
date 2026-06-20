import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const root = process.cwd()
const outputDir = join(root, 'artifacts', 'code-scan')
const issues = []
const warnings = []
const scanned = { files: 0, imports: 0, links: 0, apiFetches: 0, envRefs: 0 }
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
const ignoredDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo'])

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function rel(file) {
  return relative(root, file).split(sep).join('/')
}

function existsModule(base) {
  if (existsSync(base)) return true
  for (const ext of extensions) if (existsSync(base + ext)) return true
  for (const ext of extensions) if (existsSync(join(base, 'index' + ext))) return true
  return false
}

function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')')
}

function routeFromAppFile(file) {
  const relativeDir = relative(join(root, 'app'), dirname(file)).split(sep).filter(Boolean)
  const visibleSegments = relativeDir.filter((segment) => !isRouteGroup(segment) && !segment.startsWith('@'))
  const route = '/' + visibleSegments.join('/')
  return route === '/' ? '/' : route
}

function routePattern(route) {
  if (route === '/') return /^\/?$/
  const segments = route.split('/').filter(Boolean)
  let pattern = '^'
  for (const segment of segments) {
    if (/^\[\[\.\.\..+\]\]$/.test(segment)) pattern += '(?:/.*)?'
    else if (/^\[\.\.\..+\]$/.test(segment)) pattern += '/.+'
    else if (/^\[.+\]$/.test(segment)) pattern += '/[^/]+'
    else pattern += '/' + segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(pattern + '/?$')
}

function isPublicAsset(href) {
  const target = join(root, 'public', href.replace(/^\//, ''))
  return existsSync(target)
}

function checkImports(files) {
  const importRegex = /(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g
  for (const file of files.filter((f) => sourceExtensions.some((ext) => f.endsWith(ext)))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(importRegex)) {
      const spec = match[1]
      scanned.imports += 1
      if (spec.startsWith('@/')) {
        const target = join(root, spec.slice(2))
        if (!existsModule(target)) issues.push({ type: 'missing-alias-import', file: rel(file), detail: spec })
      }
      if (spec.startsWith('./') || spec.startsWith('../')) {
        const target = resolve(dirname(file), spec)
        if (!existsModule(target)) issues.push({ type: 'missing-relative-import', file: rel(file), detail: spec })
      }
    }
  }
}

function checkLinks(files) {
  const routeFiles = walk(join(root, 'app')).filter((f) => rel(f).endsWith('/page.tsx'))
  const patterns = routeFiles.map((file) => routePattern(routeFromAppFile(file)))
  const hrefRegex = /href=\{?(["'])(\/[^"']*)\1\}?/g

  for (const file of files.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(hrefRegex)) {
      const href = match[2].split('?')[0].split('#')[0]
      if (!href || href === '/' || href.startsWith('/api/') || href.startsWith('/#') || href.startsWith('//')) continue
      scanned.links += 1
      if (isPublicAsset(href)) continue
      if (!patterns.some((pattern) => pattern.test(href))) issues.push({ type: 'broken-literal-page-link', file: rel(file), detail: href })
    }
  }
}

function checkApiFetches(files) {
  const routeFiles = walk(join(root, 'app', 'api')).filter((f) => rel(f).endsWith('/route.ts'))
  const routes = routeFiles.map((file) => {
    const route = routeFromAppFile(file)
    const text = readFileSync(file, 'utf8')
    const methods = new Set(Array.from(text.matchAll(/export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\b/g)).map((m) => m[1]))
    return { route, pattern: routePattern(route), methods }
  })

  const fetchRegex = /fetch\(\s*['"](\/api\/[^'"]+)['"]\s*(?:,\s*\{([\s\S]*?)\})?/g
  for (const file of files.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(fetchRegex)) {
      const url = match[1].split('?')[0]
      const method = /method\s*:\s*['"]([A-Z]+)['"]/.exec(match[2] || '')?.[1] || 'GET'
      scanned.apiFetches += 1
      const found = routes.filter((route) => route.pattern.test(url))
      if (!found.length) issues.push({ type: 'broken-literal-api-fetch', file: rel(file), detail: `${method} ${url}` })
      else if (!found.some((route) => route.methods.has(method))) issues.push({ type: 'api-method-mismatch', file: rel(file), detail: `${method} ${url}` })
    }
  }
}

function checkEnvExample(files) {
  const envFile = join(root, '.env.example')
  if (!existsSync(envFile)) {
    issues.push({ type: 'missing-env-example', file: '.env.example', detail: 'required for Vercel setup' })
    return
  }

  const env = readFileSync(envFile, 'utf8')
  const defined = new Set(Array.from(env.matchAll(/^([A-Z0-9_]+)=/gm)).map((m) => m[1]))
  const used = new Set()
  const ignored = new Set(['NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_GIT_COMMIT_SHA', 'VERCEL_PROJECT_PRODUCTION_URL'])

  for (const file of files.filter((f) => sourceExtensions.some((ext) => f.endsWith(ext)))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/process\.env\.([A-Z0-9_]+)/g)) used.add(match[1])
    for (const match of text.matchAll(/process\.env\[['"]([A-Z0-9_]+)['"]\]/g)) used.add(match[1])
  }

  for (const key of used) {
    scanned.envRefs += 1
    if (!defined.has(key) && !ignored.has(key)) issues.push({ type: 'env-var-missing-from-example', file: '.env.example', detail: key })
  }
}

function checkSensitiveSetupRoutes() {
  const dbCheck = join(root, 'app/api/setup/db-check/route.ts')
  if (!existsSync(dbCheck)) return
  const text = readFileSync(dbCheck, 'utf8')
  if (text.includes('databaseUrl')) issues.push({ type: 'sensitive-setup-route-output', file: rel(dbCheck), detail: 'databaseUrl must never be returned to browser clients' })
  if (!text.includes('getCurrentUser') || !text.includes('SETUP_DB_CHECK_SECRET')) {
    issues.push({ type: 'setup-route-not-restricted', file: rel(dbCheck), detail: 'must require admin session or SETUP_DB_CHECK_SECRET' })
  }
}

function checkContactApiPersistence() {
  const contactApi = join(root, 'app/api/contact/route.ts')
  if (!existsSync(contactApi)) return
  const text = readFileSync(contactApi, 'utf8')
  if (!text.includes('db.$transaction')) warnings.push({ type: 'contact-api-non-transactional', file: rel(contactApi), detail: 'urgent contact + support ticket should save atomically' })
  if (/catch \([^)]*\) \{\s*console\.error\([^)]*\)\s*\}\s*return NextResponse\.json\(\{\s*ok: true/s.test(text)) {
    issues.push({ type: 'false-success-after-db-error', file: rel(contactApi), detail: 'contact API must not return ok:true after persistence failure' })
  }
}

function checkServerOnlyBoundaries() {
  const languageInstructions = join(root, 'lib/ai/language-instructions.ts')
  if (existsSync(languageInstructions)) {
    const text = readFileSync(languageInstructions, 'utf8')
    if (!text.includes('server-only')) warnings.push({ type: 'server-only-boundary-missing', file: rel(languageInstructions), detail: 'AI system prompt helpers should stay server-only' })
  }
}

const files = walk(root)
scanned.files = files.length
checkImports(files)
checkLinks(files)
checkApiFetches(files)
checkEnvExample(files)
checkSensitiveSetupRoutes()
checkContactApiPersistence()
checkServerOnlyBoundaries()

const report = {
  ok: issues.length === 0,
  version: '3.0.105-motion-hydration-stability',
  scanned,
  issues,
  warnings,
  generatedAt: new Date().toISOString()
}
mkdirSync(outputDir, { recursive: true })
writeFileSync(join(outputDir, 'full-project-code-scan.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'full-project-code-scan.csv'), ['type,file,detail', ...[...issues, ...warnings].map((item) => `${item.type},${item.file},"${String(item.detail).replaceAll('"', '""')}"`)].join('\n'))

console.log('\nHaqSathi AI full project code scan')
console.log(`Files scanned: ${scanned.files}`)
console.log(`Imports checked: ${scanned.imports}`)
console.log(`Literal links checked: ${scanned.links}`)
console.log(`Literal API fetches checked: ${scanned.apiFetches}`)
console.log(`Env refs checked: ${scanned.envRefs}`)
console.log(`Issues found: ${issues.length}`)
console.log(`Warnings found: ${warnings.length}`)

for (const issue of issues) console.error(`❌ ${issue.type}: ${issue.file} -> ${issue.detail}`)
for (const warning of warnings) console.warn(`⚠️ ${warning.type}: ${warning.file} -> ${warning.detail}`)

if (issues.length) process.exit(1)
console.log('✅ Full project scan passed: imports, links, API fetches, env coverage, setup-route exposure and contact persistence look safe.\n')
