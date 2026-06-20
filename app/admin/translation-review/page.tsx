import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink, FileText, Languages, ShieldAlert } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getTranslationReviewReadinessReport } from '@/lib/translation/review-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Translation Review | Admin' }

function statusClass(status: string) {
  if (status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-sky-200 bg-sky-50 text-sky-800'
}

export default async function AdminTranslationReviewPage() {
  await requireAdmin()
  const report = getTranslationReviewReadinessReport()
  const cards = [
    { label: 'Supported languages', value: report.summary.supportedLanguages, note: 'Full app language menu coverage', icon: Languages },
    { label: 'Priority languages', value: report.summary.priorityLanguages, note: 'Launch review focus', icon: ClipboardCheck },
    { label: 'P0 lanes', value: report.summary.p0Lanes, note: 'Must review first', icon: ShieldAlert },
    { label: 'Manual controls', value: report.summary.manualRequired, note: 'Need human evidence', icon: AlertTriangle }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 65</Badge>
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Translation review readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Human-review command center for all language copy before public launch. It keeps machine translations as draft until priority pages, legal warnings, RTL layouts and screenshots are reviewed.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/translation-review-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/admin/localization" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Languages className="h-4 w-4" />Localization</a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="min-w-0">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-2 break-words text-2xl font-black sm:text-3xl">{card.value}</CardTitle>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span>
              </CardHeader>
              <CardContent><p className="text-sm font-semibold text-slate-500">{card.note}</p></CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <ClipboardCheck className="h-6 w-6 text-emerald-700" />
          <CardTitle>Human review controls</CardTitle>
          <CardDescription>These controls stay manual until real reviewer evidence exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{control.label}</p>
                    <p className="mt-1 break-words text-xs font-semibold text-slate-500">{control.envValue}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{control.passCondition}</p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">Evidence: {control.evidenceRequired}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Languages className="h-6 w-6 text-emerald-700" />
          <CardTitle>Priority review lanes</CardTitle>
          <CardDescription>Review P0 lanes before marketing traffic, then P1/P2 lanes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2">
            {report.lanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{lane.label}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Reviewer: {lane.reviewer}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{lane.risk}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lane.pages.map((page) => <span key={page} className="rounded-full border bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-600">{page}</span>)}
                </div>
                <p className="mt-3 text-xs font-bold leading-5 text-slate-500">Languages: {lane.languages.join(', ')}</p>
                <ul className="mt-3 grid gap-1 text-xs font-semibold text-slate-500">
                  {lane.evidenceRequired.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <FileText className="h-6 w-6 text-emerald-700" />
            <CardTitle>Glossary lock</CardTitle>
            <CardDescription>Terms that should stay exact across languages.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {report.glossary.map((item) => (
                <div key={item.term} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-950">{item.term}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">Keep as: {item.keepAs}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review runbook</CardTitle>
            <CardDescription>Use this sequence when completing human translation QA.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-3 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item} className="pl-1 leading-6">{item}</li>)}
            </ol>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run translation:readiness</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
