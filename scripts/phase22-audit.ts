import { existsSync, readFileSync } from 'node:fs'

const checks = [
  ['Google login route', 'app/api/auth/google/route.ts'],
  ['Google callback route', 'app/api/auth/google/callback/route.ts'],
  ['Google OAuth helper', 'lib/auth/google.ts'],
  ['User account menu', 'components/layout/user-account-menu.tsx'],
  ['Profile Google card', 'components/forms/profile-form.tsx'],
  ['Phase 22 docs', 'PHASE_22_GOOGLE_AUTH_UI.md']
] as const

const issues: string[] = []
for (const [label, file] of checks) if (!existsSync(file)) issues.push(`${label} missing: ${file}`)

const env = existsSync('.env.example') ? readFileSync('.env.example', 'utf8') : ''
for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_AUTH_REDIRECT_URI']) {
  if (!env.includes(`${key}=`)) issues.push(`.env.example missing ${key}`)
}

const schema = existsSync('prisma/schema.prisma') ? readFileSync('prisma/schema.prisma', 'utf8') : ''
for (const field of ['googleId', 'avatarUrl', 'emailVerifiedAt']) {
  if (!schema.includes(field)) issues.push(`schema.prisma missing User.${field}`)
}

const navbar = existsSync('components/layout/navbar.tsx') ? readFileSync('components/layout/navbar.tsx', 'utf8') : ''
if (navbar.includes('<LogoutButton')) issues.push('Navbar still exposes LogoutButton')
if (!navbar.includes('UserAccountMenu')) issues.push('Navbar missing UserAccountMenu')

console.log('\nPhase 22 Google Auth + UX audit')
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Google auth routes, env docs, user schema and logged-in navbar UX are present.\n')
