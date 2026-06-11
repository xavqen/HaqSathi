import { AlertTriangle, CheckCircle2, DatabaseZap, ExternalLink, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getSearchReadinessReport } from '@/lib/search-readiness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Search Readiness | Admin | HaqSathi AI' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export default async function AdminSearchReadinessPage() {
  await requireAdmin()
  const report = getSearchReadinessReport()
  const cards = [
    { label: 'Ready controls', value: report.summary.ready, note: `${report.summary.totalControls} total controls`, icon: CheckCircle2 },
    { label: 'Manual review', value: report.summary.manualRequired, note: 'Needs relevance QA', icon: AlertTriangle },
    { label: 'Provider', value: report.provider, note: 'Local fallback or external index', icon: DatabaseZap },
    { label: 'Blocked', value: report.summary.blocked, note: 'Must be zero before launch', icon: ShieldCheck }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 57</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Advanced search readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Prepare HaqSathi search for public traffic with provider checks, PII-safe indexing rules, synonyms, typo tolerance, reindex evidence and human relevance review.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/search-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/search?q=UPI%20wrong%20transfer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Search className="h-4 w-4" />Test search</a>
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
                  <CardTitle className="mt-2 break-words text-3xl font-black">{card.value}</CardTitle>
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
          <SlidersHorizontal className="h-6 w-6 text-emerald-700" />
          <CardTitle>Search readiness controls</CardTitle>
          <CardDescription>Keep search useful without indexing private user data or breaking the existing local search fallback.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{control.label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{control.adminValue}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{control.userValue}</p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">{control.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allowed public index types</CardTitle>
            <CardDescription>Only public, non-sensitive content should enter a hosted search index.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {report.publicIndexTypes.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Never index</CardTitle>
            <CardDescription>These fields must stay out of external search providers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-700">
              {report.neverIndex.map((item) => <li key={item} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended synonyms</CardTitle>
          <CardDescription>Useful Hinglish/English terms for Indian complaint and document searches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {report.recommendedSynonyms.map((group) => (
              <div key={group[0]} className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">{group[0]}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{group.slice(1).join(' · ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minimum launch evidence</CardTitle>
          <CardDescription>Collect proof before switching to a hosted search provider or sending SEO traffic.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            {report.launchEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
          </ul>
          <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Local command</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run search:readiness</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
