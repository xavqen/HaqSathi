import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'OCR Reviews | Admin | HaqSathi AI' }

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/dashboard')
  const items = await db.ocrAutofillResult.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: { select: { email: true, name: true } } } })
  const avg = items.length ? Math.round(items.reduce((sum, item) => sum + item.confidenceScore, 0) / items.length) : 0
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Admin</p>
        <h1 className="text-3xl font-black">OCR extraction reviews</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Total OCR runs</CardTitle></CardHeader><CardContent className="text-3xl font-black">{items.length}</CardContent></Card>
          <Card><CardHeader><CardTitle>Avg confidence</CardTitle></CardHeader><CardContent className="text-3xl font-black">{avg}/100</CardContent></Card>
          <Card><CardHeader><CardTitle>Vision-ready</CardTitle></CardHeader><CardContent className="text-sm text-slate-600">OpenAI/Gemini keys set hone par image OCR active hota hai.</CardContent></Card>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const fields = item.extractedFields as Record<string, unknown>
            return <Card key={item.id}><CardHeader><CardTitle>{String(fields.companyName || item.fileName || 'Result')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><b>User:</b> {item.user?.email || 'Guest'}</p><p><b>Provider:</b> {item.provider}</p><p><b>File:</b> {item.fileName || 'Notes only'} · {item.mimeType || 'n/a'}</p><p><b>Amount:</b> {String(fields.amount || 'n/a')} · <b>Ref:</b> {String(fields.transactionId || 'n/a')}</p><p><b>Warnings:</b> {Array.isArray(item.warnings) ? item.warnings.length : 0}</p></CardContent></Card>
          })}
        </div>
      </section>
    </main>
  )
}
