import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
function stateFromParam(value: string) {
  return value.split('-').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; slug: string }> }): Promise<Metadata> {
  const { state, slug } = await params
  const scheme = await db.scheme.findUnique({ where: { state_slug: { state: stateFromParam(state), slug } } }).catch(() => null)
  if (!scheme) return { title: 'Scheme not found' }
  return { title: `${scheme.title} Eligibility & Documents`, description: `${scheme.title} ke eligibility, documents and apply steps in simple Hinglish.` }
}

export default async function Page({ params }: { params: Promise<{ state: string; slug: string }> }) {
  const { state, slug } = await params
  const scheme = await db.scheme.findUnique({ where: { state_slug: { state: stateFromParam(state), slug } } }).catch(() => null)
  if (!scheme || !scheme.isActive) notFound()
  const documents = Array.isArray(scheme.documents) ? scheme.documents as string[] : []
  const applySteps = Array.isArray(scheme.applySteps) ? scheme.applySteps as string[] : []
  return <main className="bg-slate-50"><section className="mx-auto max-w-4xl px-4 py-10"><p className="text-sm font-semibold text-emerald-700">Verified scheme database</p><h1 className="mt-2 text-4xl font-black">{scheme.title}</h1><p className="mt-3 text-slate-600">{scheme.state} · {scheme.purpose}</p><Card className="mt-8"><CardHeader><CardTitle>Eligibility</CardTitle></CardHeader><CardContent><p className="leading-7 text-slate-700">{scheme.eligibility}</p></CardContent></Card><div className="mt-6 grid gap-5 md:grid-cols-2"><Card><CardHeader><CardTitle>Documents</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">{documents.map(d => <li key={d}>{d}</li>)}</ul></CardContent></Card><Card><CardHeader><CardTitle>Apply steps</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">{applySteps.map(d => <li key={d}>{d}</li>)}</ol></CardContent></Card></div><div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Official portal/office se final eligibility aur deadline verify karein. HaqSathi AI official authority nahi hai.</div><div className="mt-6 flex flex-wrap gap-3">{scheme.officialLink && <a href={scheme.officialLink} target="_blank" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Official Link</a>}<Link href="/scheme-finder" className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold">Find more schemes</Link></div></section></main>
}
