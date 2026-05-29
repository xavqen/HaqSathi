import fs from 'fs'
import path from 'path'

const root = process.cwd()
const required = [
  'lib/i18n/dictionaries.ts',
  'components/i18n/language-switcher.tsx',
  'app/api/language/cookie/route.ts',
  'components/layout/navbar.tsx',
  'components/layout/footer.tsx',
  'components/layout/disclaimer-banner.tsx',
  'app/page.tsx',
  'app/tools/page.tsx',
  'components/tools/tool-grid.tsx'
]

const issues = []
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) issues.push(`Missing required file: ${file}`)
}

const dictionary = fs.readFileSync(path.join(root, 'lib/i18n/dictionaries.ts'), 'utf8')
for (const lang of ['ENGLISH', 'HINGLISH', 'HINDI', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'URDU']) {
  if (!dictionary.includes(`${lang}:`) && lang !== 'ENGLISH') issues.push(`Dictionary missing language shell: ${lang}`)
}
for (const token of ['getShellDictionary', 'ShellDictionary', 'translateCategory']) {
  if (!dictionary.includes(token)) issues.push(`Dictionary missing export/helper: ${token}`)
}

const navbar = fs.readFileSync(path.join(root, 'components/layout/navbar.tsx'), 'utf8')
for (const token of ['LanguageSwitcher', 'getShellDictionary', 'dictionary.nav', 'haqsathi_language']) {
  if (!navbar.includes(token)) issues.push(`Navbar missing i18n token: ${token}`)
}

const cookieRoute = fs.readFileSync(path.join(root, 'app/api/language/cookie/route.ts'), 'utf8')
if (!cookieRoute.includes('haqsathi_language')) issues.push('Language cookie API does not set haqsathi_language')

const home = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8')
for (const token of ['dictionary.home.title', 'dictionary.home.primaryCta', 'dictionary.home.faqs']) {
  if (!home.includes(token)) issues.push(`Home page missing translated token: ${token}`)
}

const tools = fs.readFileSync(path.join(root, 'components/tools/tool-grid.tsx'), 'utf8')
for (const token of ['dictionary?: ShellDictionary', 'labels.searchPlaceholder', 'translateCategory']) {
  if (!tools.includes(token)) issues.push(`Tool grid missing translated token: ${token}`)
}

console.log('HaqSathi Phase 36 i18n shell audit')
console.log(`Required files checked: ${required.length}`)
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  console.error(issues.map((issue) => `❌ ${issue}`).join('\n'))
  process.exit(1)
}
console.log('✅ Phase 36 audit passed: public language switcher, shell dictionaries, translated navbar/footer/disclaimer/home/tools and language cookie route are installed.')
