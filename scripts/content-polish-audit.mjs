import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const coreFiles = [
  'app/page.tsx',
  'app/tools/page.tsx',
  'app/complaint/page.tsx',
  'app/refund/page.tsx',
  'app/upi-help/page.tsx',
  'app/scheme-finder/page.tsx',
  'app/documents/page.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/profile/page.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx',
  'components/layout/navbar.tsx',
  'components/layout/footer.tsx',
  'components/layout/disclaimer-banner.tsx',
  'components/layout/mobile-bottom-actions.tsx',
  'components/forms/complaint-generator.tsx',
  'components/forms/upi-helper.tsx',
  'components/forms/scheme-finder.tsx',
  'components/forms/document-checklist.tsx'
]

const blocked = [
  /\b(karo|banao|nahi|galat|sahi|paisa|paise|turant|madad|dikhega|banayega|milega|yahan|aapka|apna)\b/i,
  /\b(Hinglish)\b/i
]

const issues = []
for (const rel of coreFiles) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    issues.push(`Missing core file: ${rel}`)
    continue
  }
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, i) => {
    if (blocked.some((regex) => regex.test(line))) {
      issues.push(`${rel}:${i + 1} ${line.trim().slice(0, 140)}`)
    }
  })
}

console.log('\nHaqSathi content polish audit')
console.log(`Core UI files scanned: ${coreFiles.length}`)
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  console.log(issues.slice(0, 80).map((x) => `❌ ${x}`).join('\n'))
  process.exit(1)
}
console.log('✅ Core UI copy is English-first. Non-English text should now be limited to language choices, examples, seed data or generated outputs.')
