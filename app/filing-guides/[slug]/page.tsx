import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { filingGuideSeeds } from '@/lib/filing/seed-guides'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const guide = await db.officialFilingGuide.findUnique({ where: { slug } }).catch(() => filingGuideSeeds.find((g) => g.slug === slug) as any)
  return { title: guide ? guide.title : 'Filing Guide', description: guide?.summary || 'Simple filing guide.' }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const guide = await db.officialFilingGuide.findUnique({ where: { slug } }).catch(() => filingGuideSeeds.find((g) => g.slug === slug) as any)
  if (!guide) notFound()
  const steps = Array.isArray(guide.steps) ? guide.steps : []
  const documents = Array.isArray(guide.documents) ? guide.documents : []
  return <main className="bg-slate-50"><section className="mx-auto max-w-5xl px-4 py-12"><div className="flex flex-wrap gap-2"><Badge>{guide.category}</Badge>{guide.isVerified && <Badge>Verified</Badge>}</div><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{guide.title}</h1><p className="mt-3 text-slate-600">{guide.summary}</p><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]"><div className="space-y-6"><Card><CardHeader><CardTitle>Step-by-step</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-3 pl-5 text-sm text-slate-700">{steps.map((step: string, i: number) => <li key={i}>{step}</li>)}</ol></CardContent></Card><Card><CardHeader><CardTitle>Required documents</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">{documents.map((doc: string, i: number) => <li key={i}>{doc}</li>)}</ul></CardContent></Card></div><aside className="space-y-4"><Card><CardHeader><CardTitle>Authority</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{guide.authority}</p></CardContent></Card><Card><CardHeader><CardTitle>Timeline / Fees</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-slate-600"><p><b>Timeline:</b> {guide.timeline || 'Verify officially.'}</p><p><b>Fees:</b> {guide.fees || 'Verify officially.'}</p></CardContent></Card><Card><CardHeader><CardTitle>Safety note</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">HaqSathi official authority nahi hai. OTP, PIN, password, full card number kabhi share na karein. Official portal/link verify karke hi submit karein.</p></CardContent></Card></aside></div></section></main>
}
