import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'OCR Autofill History' }

export default async function Page() {
  const user = await requireUser()
  const items = await db.ocrAutofillResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 })
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-wider text-primary">Dashboard</p><h1 className="text-3xl font-black">OCR autofill history</h1></div>
          <Link href="/tools/ocr-autofill" className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Upload proof</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const fields = item.extractedFields as Record<string, unknown>
            return <Card key={item.id}><CardHeader><CardTitle>{String(fields.companyName || item.fileName || 'OCR result')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-slate-700"><p><b>File:</b> {item.fileName || 'Notes only'}</p><p><b>Amount:</b> {String(fields.amount || 'Not detected')}</p><p><b>Reference:</b> {String(fields.transactionId || 'Not detected')}</p><p><b>Confidence:</b> {item.confidenceScore}/100 · {item.provider}</p><Link href="/tools/ocr-autofill" className="text-sm font-bold text-primary">Run again →</Link></CardContent></Card>
          })}
          {!items.length && <div className="rounded-3xl border border-dashed bg-white p-8 text-center text-slate-600">Abhi OCR result saved nahi hai. Upload proof se start karo.</div>}
        </div>
      </section>
    </main>
  )
}
