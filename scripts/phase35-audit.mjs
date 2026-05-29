import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const mustContain = [
  ['package.json', '3.0'],
  ['app/globals.css', 'safe-area-inset-bottom'],
  ['components/layout/navbar.tsx', 'startFree'],
  ['components/layout/mobile-bottom-actions.tsx', 'grid-cols-5'],
  ['components/dashboard/dashboard-shell.tsx', 'Dashboard quick navigation'],
  ['app/dashboard/page.tsx', 'Recommended next actions'],
  ['app/tools/page.tsx', 'dictionary.tools.title'],
  ['scripts/content-polish-audit.mjs', 'Core UI files scanned']
]
const errors = []
for (const [rel, text] of mustContain) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) errors.push(`Missing ${rel}`)
  else if (!fs.readFileSync(file, 'utf8').includes(text)) errors.push(`${rel} missing marker: ${text}`)
}

const toolsDir = path.join(root, 'app', 'tools')
const toolPages = fs.readdirSync(toolsDir).filter((name) => fs.existsSync(path.join(toolsDir, name, 'page.tsx')))
if (toolPages.length < 38) errors.push(`Expected at least 38 tool pages, found ${toolPages.length}`)

console.log('\nHaqSathi Phase 35 audit')
console.log(`Tool pages: ${toolPages.length}`)
console.log(`Issues found: ${errors.length}`)
if (errors.length) {
  console.log(errors.map((x) => `❌ ${x}`).join('\n'))
  process.exit(1)
}
console.log('✅ Phase 35 audit passed: core UI copy, navigation markers, mobile shell and tool inventory are in place.')
