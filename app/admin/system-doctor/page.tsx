import { Card, CardContent } from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

const envChecks = [
  ['DATABASE_URL', 'Database connection string'],
  ['DIRECT_URL', 'Direct database URL'],
  ['NEXT_PUBLIC_APP_URL', 'Public app URL'],
  ['AUTH_SECRET', 'Cookie/session secret'],
  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service key'],
  ['SUPABASE_STORAGE_BUCKET', 'Storage bucket'],
  ['RESEND_API_KEY', 'Email sending key'],
  ['RAZORPAY_KEY_ID', 'Razorpay key id'],
  ['RAZORPAY_KEY_SECRET', 'Razorpay key secret']
]

export const metadata = { title: 'System Doctor - Admin' }

export default async function SystemDoctorPage() {
  await requireAdmin()
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">System Doctor</h1>
      <p className="mt-2 text-slate-600">Production launch se pehle env aur runtime readiness check.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {envChecks.map(([key, label]) => {
          const present = Boolean(process.env[key])
          return (
            <Card key={key}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-slate-500">{key}</p>
                </div>
                <span className={present ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700' : 'rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800'}>{present ? 'Found' : 'Missing'}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold">Recommended command</h2>
          <code className="mt-3 block rounded-xl bg-slate-950 p-4 text-sm text-white">npm run clean:next-conflict && npm run doctor:all && npm run release:final-check && npm run build</code>
        </CardContent>
      </Card>
    </main>
  )
}
