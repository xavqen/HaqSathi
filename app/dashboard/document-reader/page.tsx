import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const items = await db.documentParseResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-black">Document reader history</h1><p className="mt-2 text-slate-600">Parsed invoice/SMS/email fields yahan save hote hain.</p></div>
        <Link href="/tools/document-reader"><Button className="w-full rounded-2xl sm:w-auto">Read document</Button></Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.length === 0 && <Card><CardContent className="pt-6 text-slate-600">Abhi koi parsed document nahi.</CardContent></Card>}
        {items.map((item) => {
          const fields = item.extractedFields as Record<string, string>
          return <Card key={item.id}><CardHeader><CardTitle>{item.documentType}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><b>Confidence:</b> {item.confidenceScore}/100</p><p><b>Company:</b> {fields.companyName}</p><p><b>Ref:</b> {fields.transactionId}</p><p><b>Amount:</b> {fields.amount}</p><p className="text-xs text-slate-500">{item.createdAt.toLocaleString()}</p></CardContent></Card>
        })}
      </div>
    </div>
  )
}
