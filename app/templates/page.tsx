import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { templateSeedItems } from '@/lib/templates/seed-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Ready Templates', description: 'Ready templates for refunds, UPI, bank issues, scholarships and legal-style drafts in simple language.' }

type TemplateRow = {
  id: string
  slug: string
  title: string
  category: string
  intent: string
  isPremium: boolean
  usageCount: number
}

async function getTemplates(): Promise<TemplateRow[]> {
  const dbItems = await db.template.findMany({
    select: { id: true, slug: true, title: true, category: true, intent: true, isPremium: true, usageCount: true },
    orderBy: [{ category: 'asc' }, { usageCount: 'desc' }]
  }).catch(() => [] as TemplateRow[])
  if (dbItems.length) return dbItems
  return templateSeedItems.map((item) => ({ ...item, id: item.slug, usageCount: 0 }))
}

export default async function Page() {
  const templates = await getTemplates()
  const categories = Array.from(new Set(templates.map((template) => template.category)))
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-emerald-700">Template Library</p>
          <h1 className="mt-2 text-4xl font-black">Ready message drafts you can copy and adapt</h1>
          <p className="mt-3 text-slate-600">Reusable templates for refunds, UPI, bank, scholarship and cyber fraud workflows.</p>
        </div>
        {categories.map((category) => (
          <section key={category} className="mt-10">
            <h2 className="text-2xl font-black">{category}</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {templates.filter((template) => template.category === category).map((template) => (
                <Card key={template.slug}>
                  <CardHeader><CardTitle className="text-lg">{template.title}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{template.intent}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{template.isPremium ? 'Premium' : 'Free'}</span>
                      <Link href={`/templates/${template.slug}`} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Use</Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}
