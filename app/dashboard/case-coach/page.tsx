import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const reports = await db.caseCoachReport.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-black">Case Coach reports</h1><p className="mt-2 text-slate-600">AI case score, missing proof aur next action history.</p></div>
        <Link href="/tools/case-coach"><Button className="w-full rounded-2xl sm:w-auto">Run coach</Button></Link>
      </div>
      <div className="mt-6 grid gap-4">
        {reports.length === 0 && <Card><CardContent className="pt-6 text-slate-600">Abhi koi report nahi. Case coach run karo.</CardContent></Card>}
        {reports.map((report) => {
          const data = report.report as any
          return <Card key={report.id}><CardHeader><CardTitle>{report.caseType} · {report.score}/100</CardTitle></CardHeader><CardContent><p className="font-semibold text-slate-700">{report.grade}</p><p className="mt-2 text-sm text-slate-500">{report.createdAt.toLocaleString()}</p>{Array.isArray(data?.nextBestActions) && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">{data.nextBestActions.slice(0, 3).map((x: string) => <li key={x}>{x}</li>)}</ul>}</CardContent></Card>
        })}
      </div>
    </div>
  )
}
