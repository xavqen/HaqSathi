import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const checks = [
  'npm run clean:next-conflict',
  'npm run doctor:all',
  'npm run db:generate',
  'npm run db:push',
  'npm run db:seed',
  'npm run release:final-check',
  'npm run build',
  'npm run dev'
]

export const metadata = {
  title: 'Final Release Check',
  description: 'Final build, database, env and production checklist for HaqSathi AI release candidate.'
}

export default function ReleaseFinalPage() {
  return (
    <main className="container py-10">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold text-emerald-700">Release Candidate 2</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Final release check</h1>
        <p className="mt-4 text-slate-600">
          This page is for the final manual checklist before launch. New features are frozen. Test only build, env, DB, payment, email and storage.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold">Local final commands</h2>
            <div className="mt-4 space-y-2">
              {checks.map((cmd) => <code key={cmd} className="block rounded-xl bg-slate-950 px-3 py-2 text-sm text-white">{cmd}</code>)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold">Launch gates</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>✅ Build command without TypeScript error</li>
              <li>✅ Supabase DB + Storage verified</li>
              <li>✅ Razorpay test payment and webhook verified</li>
              <li>✅ Resend password reset email verified</li>
              <li>✅ Mobile pages checked manually</li>
              <li>✅ Legal disclaimer visible on sensitive tools</li>
            </ul>
            <Link href="/admin/system-doctor" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Open system doctor</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
