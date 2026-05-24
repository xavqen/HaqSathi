import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve, relative, sep } from 'node:path'

const root = process.cwd()
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
const issues: string[] = []

function walk(dir: string, out: string[] = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function rel(file: string) {
  return relative(root, file).split(sep).join('/')
}

function existsModule(base: string) {
  if (existsSync(base)) return true
  for (const ext of extensions) if (existsSync(base + ext)) return true
  for (const ext of extensions) if (existsSync(join(base, 'index' + ext))) return true
  return false
}

function isRouteGroup(segment: string) {
  return segment.startsWith('(') && segment.endsWith(')')
}

function routeFromAppFile(file: string, marker: 'page.tsx' | 'route.ts') {
  const base = marker === 'page.tsx' ? join(root, 'app') : join(root, 'app')
  const relativeDir = relative(base, dirname(file)).split(sep).filter(Boolean)
  const visibleSegments = relativeDir.filter((segment) => !isRouteGroup(segment) && !segment.startsWith('@'))
  const route = '/' + visibleSegments.join('/')
  return route === '/' ? '/' : route
}

function routePattern(route: string) {
  if (route === '/') return /^\/?$/
  const segments = route.split('/').filter(Boolean)
  let pattern = '^'
  for (const segment of segments) {
    if (/^\[\[\.\.\..+\]\]$/.test(segment)) pattern += '(?:/.*)?'
    else if (/^\[\.\.\..+\]$/.test(segment)) pattern += '/.+'
    else if (/^\[.+\]$/.test(segment)) pattern += '/[^/]+'
    else pattern += '/' + segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  pattern += '/?$'
  return new RegExp(pattern)
}

function checkImports(files: string[]) {
  const importRegex = /(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g
  for (const file of files.filter((f) => /\.(tsx?|jsx?)$/.test(f))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(importRegex)) {
      const spec = match[1]
      if (spec.startsWith('@/')) {
        const target = join(root, spec.slice(2))
        if (!existsModule(target)) issues.push(`Missing alias import: ${rel(file)} -> ${spec}`)
      }
      if (spec.startsWith('./') || spec.startsWith('../')) {
        const target = resolve(dirname(file), spec)
        if (!existsModule(target)) issues.push(`Missing relative import: ${rel(file)} -> ${spec}`)
      }
    }
  }
}

function checkLinks(files: string[]) {
  const routeFiles = walk(join(root, 'app')).filter((f) => rel(f).endsWith('/page.tsx'))
  const patterns = routeFiles.map((file) => routePattern(routeFromAppFile(file, 'page.tsx')))
  const hrefRegex = /href=\{?(["'])(\/[^"']*)\1\}?/g

  for (const file of files.filter((f) => /\.(tsx?)$/.test(f))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(hrefRegex)) {
      const href = match[2].split('?')[0].split('#')[0]
      if (!href || href === '/' || href.startsWith('/api/') || href.startsWith('/#') || href.startsWith('//')) continue
      if (!patterns.some((pattern) => pattern.test(href))) issues.push(`Broken literal page link: ${rel(file)} -> ${href}`)
    }
  }
}

function checkApiFetches(files: string[]) {
  const routeFiles = walk(join(root, 'app', 'api')).filter((f) => rel(f).endsWith('/route.ts'))
  const routes = routeFiles.map((file) => {
    const route = routeFromAppFile(file, 'route.ts')
    const text = readFileSync(file, 'utf8')
    const methods = new Set(Array.from(text.matchAll(/export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\b/g)).map((m) => m[1]))
    return { route, pattern: routePattern(route), methods }
  })

  const fetchRegex = /fetch\(\s*['"](\/api\/[^'"]+)['"]\s*(?:,\s*\{([\s\S]*?)\})?/g
  for (const file of files.filter((f) => /\.(tsx?)$/.test(f))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(fetchRegex)) {
      const url = match[1].split('?')[0]
      const method = /method\s*:\s*['"]([A-Z]+)['"]/.exec(match[2] || '')?.[1] || 'GET'
      const found = routes.filter((route) => route.pattern.test(url))
      if (!found.length) issues.push(`Broken literal API fetch: ${rel(file)} -> ${url}`)
      else if (!found.some((route) => route.methods.has(method))) issues.push(`API method mismatch: ${rel(file)} -> ${method} ${url}`)
    }
  }
}

function checkKnownUiPitfalls(files: string[]) {
  const buttonPath = join(root, 'components', 'ui', 'button.tsx')
  if (!existsSync(buttonPath)) return
  const buttonSource = readFileSync(buttonPath, 'utf8')
  const supportsAsChild = buttonSource.includes('@radix-ui/react-slot') || buttonSource.includes('asChild')
  if (!supportsAsChild) {
    for (const file of files.filter((f) => /\.(tsx?)$/.test(f))) {
      const text = readFileSync(file, 'utf8')
      if (/<Button[^>]*\basChild\b/.test(text)) issues.push(`Button asChild used but Button component does not support it: ${rel(file)}`)
    }
  }
}

function checkEnvExample(files: string[]) {
  const envFile = join(root, '.env.example')
  if (!existsSync(envFile)) return issues.push('.env.example missing')
  const env = readFileSync(envFile, 'utf8')
  const defined = new Set(Array.from(env.matchAll(/^([A-Z0-9_]+)=/gm)).map((m) => m[1]))
  const used = new Set<string>()

  for (const file of files.filter((f) => /\.(tsx?|js|mjs)$/.test(f))) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/process\.env\.([A-Z0-9_]+)/g)) used.add(match[1])
    for (const match of text.matchAll(/process\.env\[['"]([A-Z0-9_]+)['"]\]/g)) used.add(match[1])
  }

  for (const key of used) if (!defined.has(key)) issues.push(`Env var used but missing in .env.example: ${key}`)
}

const files = walk(root)
checkImports(files)
checkLinks(files)
checkApiFetches(files)
checkKnownUiPitfalls(files)
checkEnvExample(files)

console.log('\nHaqSathi AI full code scan')
console.log(`Files scanned: ${files.length}`)
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Static scan passed: imports, literal routes, API methods, env references and known UI pitfalls look OK.\n')
