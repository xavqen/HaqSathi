import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

function redact(value: string) {
  return value.replace(/:\/\/([^:]+):([^@]+)@/, (_m, user) => `://${user}:***@`)
}

function explainUrl(name: string, raw?: string) {
  console.log(`\n${name}:`)
  if (!raw) {
    console.log('  ❌ Missing')
    return false
  }
  try {
    const url = new URL(raw)
    console.log(`  ✅ Found: ${redact(raw)}`)
    console.log(`  Host: ${url.hostname}`)
    console.log(`  Port: ${url.port || '(default)'}`)
    console.log(`  User: ${decodeURIComponent(url.username)}`)
    if (!url.password || url.password === 'password') console.log('  ⚠️ Password looks empty/placeholder')
    if (url.hostname.includes('pooler.supabase.com') && !decodeURIComponent(url.username).includes('.')) {
      console.log('  ⚠️ Supabase pooler usually uses username like postgres.PROJECT_REF, not plain postgres.')
    }
    if (raw.includes('[YOUR-DB-PASSWORD]') || raw.includes('project.supabase.co')) console.log('  ⚠️ Replace placeholder values from Supabase dashboard.')
    return true
  } catch {
    console.log('  ❌ Invalid URL format')
    return false
  }
}

async function main() {
  console.log('HaqSathi AI Database Doctor')
  const hasDb = explainUrl('DATABASE_URL', process.env.DATABASE_URL)
  explainUrl('DIRECT_URL', process.env.DIRECT_URL)

  if (!hasDb) {
    console.log('\nFix: .env me valid Supabase PostgreSQL string paste karo, phir npm run db:push chalao.')
    return
  }

  const prisma = new PrismaClient()
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('\n✅ Database connection OK. Ab run karo:')
    console.log('   npm run db:push')
    console.log('   npm run db:seed')
  } catch (err: any) {
    const message = String(err?.message || err)
    console.log('\n❌ Database connection failed.')
    if (message.includes('Authentication failed') || message.includes('P1000')) {
      console.log('Reason: Database password/username galat hai. Supabase Dashboard → Project Settings → Database → Reset database password ya Connect string copy karo.')
      console.log('Pooler use kar rahe ho to DATABASE_URL username aksar postgres.PROJECT_REF hota hai.')
      console.log('Password me @ # / ? : jaise characters hain to URL-encode karo.')
    } else if (message.includes('P1001') || message.includes("Can't reach")) {
      console.log('Reason: DB reachable nahi hai. IPv4 ke liye Supabase pooler URL use karo.')
    }
    console.log('\nRaw error:')
    console.log(message.split('\n').slice(0, 8).join('\n'))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
