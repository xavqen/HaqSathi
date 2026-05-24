export type EnvStage = 'LOCAL' | 'PREVIEW' | 'PRODUCTION'
export type EnvHealthItem = {
  key: string
  area: string
  requiredFor: EnvStage[]
  sensitive: boolean
  ok: boolean
  current: string
  advice: string
}

const placeholderBits = ['change-this', '[YOUR-PASSWORD]', 'PROJECT_REF', 'your-', 'example', 'haqsathi.local']

function hasUsableValue(value: string | undefined) {
  if (!value) return false
  const clean = value.trim()
  if (!clean) return false
  return !placeholderBits.some((bit) => clean.toLowerCase().includes(bit.toLowerCase()))
}

function mask(value: string | undefined, sensitive: boolean) {
  if (!value) return 'missing'
  if (!sensitive) return value.length > 80 ? `${value.slice(0, 77)}...` : value
  if (value.length <= 10) return 'configured'
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

const definitions = [
  { key: 'NEXT_PUBLIC_APP_URL', area: 'App', requiredFor: ['LOCAL','PREVIEW','PRODUCTION'], sensitive: false, advice: 'Set localhost for dev and deployed domain for production.' },
  { key: 'AUTH_SECRET', area: 'Security', requiredFor: ['LOCAL','PREVIEW','PRODUCTION'], sensitive: true, advice: 'Use a long random 32+ character secret.' },
  { key: 'DATABASE_URL', area: 'Database', requiredFor: ['LOCAL','PREVIEW','PRODUCTION'], sensitive: true, advice: 'Use Supabase Transaction Pooler URL for app/runtime.' },
  { key: 'DIRECT_URL', area: 'Database', requiredFor: ['LOCAL','PREVIEW','PRODUCTION'], sensitive: true, advice: 'Use Supabase direct/session connection URL for Prisma db push.' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', area: 'Storage', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Required for Supabase Storage document vault.' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', area: 'Storage', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Required for private signed document uploads/downloads.' },
  { key: 'SUPABASE_STORAGE_BUCKET', area: 'Storage', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Create private bucket, usually named documents.' },
  { key: 'RESEND_API_KEY', area: 'Email', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Required for reset emails, support emails and reminders.' },
  { key: 'RESEND_FROM_EMAIL', area: 'Email', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Use a verified sender domain in Resend.' },
  { key: 'RAZORPAY_KEY_ID', area: 'Billing', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Required for live checkout creation.' },
  { key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID', area: 'Billing', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Required for browser checkout.' },
  { key: 'RAZORPAY_KEY_SECRET', area: 'Billing', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Required for payment signature verification.' },
  { key: 'RAZORPAY_WEBHOOK_SECRET', area: 'Billing', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Required before using production webhooks.' },
  { key: 'CRON_SECRET', area: 'Automation', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Protect reminder cron route.' },
  { key: 'GOOGLE_CLIENT_ID', area: 'Auth', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Required for Google login in production.' },
  { key: 'GOOGLE_CLIENT_SECRET', area: 'Auth', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Required for Google OAuth callback.' },
  { key: 'GOOGLE_AUTH_REDIRECT_URI', area: 'Auth', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Use https://your-domain.com/api/auth/google/callback.' },
  { key: 'OPENAI_API_KEY', area: 'AI', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Optional if Gemini key is configured, but production needs at least one real AI key.' },
  { key: 'GEMINI_API_KEY', area: 'AI', requiredFor: ['PRODUCTION'], sensitive: true, advice: 'Optional if OpenAI key is configured, but production needs at least one real AI key.' },
  { key: 'NEXT_PUBLIC_GA_ID', area: 'Analytics', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Optional Google Analytics measurement ID.' },
  { key: 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN', area: 'Analytics', requiredFor: ['PRODUCTION'], sensitive: false, advice: 'Optional Plausible domain for lightweight analytics.' }
] satisfies Array<Omit<EnvHealthItem, 'ok' | 'current'>>

export function getEnvHealth(stage: EnvStage = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'LOCAL') {
  const items: EnvHealthItem[] = definitions.map((item) => {
    const value = process.env[item.key]
    const isRequired = item.requiredFor.includes(stage)
    const ok = isRequired ? hasUsableValue(value) : true
    return { ...item, ok, current: mask(value, item.sensitive) }
  })

  const aiConfigured = hasUsableValue(process.env.OPENAI_API_KEY) || hasUsableValue(process.env.GEMINI_API_KEY)
  const productionItems = items.filter((item) => item.requiredFor.includes('PRODUCTION'))
  const productionReadyCount = productionItems.filter((item) => item.ok).length

  return {
    stage,
    items,
    totals: {
      all: items.length,
      passing: items.filter((item) => item.ok).length,
      productionRequired: productionItems.length,
      productionPassing: productionReadyCount,
      aiConfigured
    }
  }
}
