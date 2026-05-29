import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'lib/i18n/languages.ts',
  'components/layout/navbar.tsx',
  'components/forms/language-preference-form.tsx',
  'app/dashboard/profile/page.tsx',
  'app/dashboard/language/page.tsx'
]
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)))
const navbar = fs.readFileSync(path.join(root, 'components/layout/navbar.tsx'), 'utf8')
const languages = fs.readFileSync(path.join(root, 'lib/i18n/languages.ts'), 'utf8')
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8')

const issues = [
  ...missing.map((file) => `Missing file: ${file}`),
  !navbar.includes('mobile-header-scroll') ? 'Navbar mobile scroll class missing' : '',
  !languages.includes('INDIAN_LANGUAGE_OPTIONS') ? 'Indian language list missing' : '',
  !languages.includes('GLOBAL_LANGUAGE_OPTIONS') ? 'Global language list missing' : '',
  !schema.includes('primaryLanguage String   @default("ENGLISH")') ? 'Primary language default is not English' : ''
].filter(Boolean)

console.log('Phase 23 audit')
if (issues.length) {
  console.error(issues.map((issue) => `❌ ${issue}`).join('\n'))
  process.exit(1)
}
console.log('✅ Mobile header + language system passed')
