import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

const checks = [
  'Run npm run clean:next-conflict',
  'Run npm run db:doctor',
  'Run npm run db:push and db:seed',
  'Run npm run ship:prod',
  'Run npm run build',
  'Deploy on Vercel with production env variables',
  'Test payment, email, storage, auth and admin access'
]

export default function ReleaseStablePage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold text-emerald-700">HaqSathi AI v2.0.0</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Stable release package</h1>
        <p className="text-muted-foreground">
          Feature freeze is active. Only build/runtime fixes, deployment QA and production env testing should continue.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Final launch checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((check) => (
            <div key={check} className="rounded-2xl border bg-white p-4 text-sm shadow-sm">
              ✅ {check}
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/launch-readiness" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Launch readiness</Link>
            <Link href="/admin/system-doctor" className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2 text-sm font-semibold hover:bg-muted">System doctor</Link>
            <Link href="/deploy-guide" className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2 text-sm font-semibold hover:bg-muted">Deploy guide</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
