import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Setup & DB Fix',
  description: 'HaqSathi AI setup checklist and database connection fix guide.'
}

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold text-brand-700">Setup Helper</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Database error fix karo</h1>
        <p className="text-slate-600">Aapke log me P1000 authentication issue hai. Code run ho raha hai, bas Supabase DB credentials galat hain.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Step 1: Supabase se URL copy karo</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>Supabase Dashboard → Project → Connect / Database settings me jao.</p>
            <p><b>DATABASE_URL</b> me Transaction pooler / Prisma URL paste karo.</p>
            <p><b>DIRECT_URL</b> me Direct connection URL paste karo.</p>
            <p>Password me @, #, /, ?, : ho to URL encode karna hoga.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Step 2: Commands chalao</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">npm run db:doctor{`\n`}npm run db:push{`\n`}npm run db:seed{`\n`}npm run dev</pre>
            <a href="/api/setup/db-check" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Check DB API</a>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
