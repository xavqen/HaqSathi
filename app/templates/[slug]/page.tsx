import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { templateSeedItems } from '@/lib/templates/seed-templates'
import { TemplateRenderForm } from '@/components/forms/template-render-form'
import { FeedbackForm } from '@/components/forms/feedback-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
type TemplateLike = typeof templateSeedItems[number] & { id?: string; usageCount?: number; createdAt?: Date; updatedAt?: Date }

async function getTemplate(slug: string): Promise<TemplateLike | null> {
  const dbItem = await db.template.findUnique({ where: { slug } }).catch(() => null)
  if (dbItem) return { ...dbItem, variables: Array.isArray(dbItem.variables) ? dbItem.variables as string[] : [] }
  return templateSeedItems.find((item) => item.slug === slug) || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const template = await getTemplate(slug)
  if (!template) return { title: 'Template not found' }
  return { title: `${template.title}`, description: template.intent }
}

export function generateStaticParams() {
  return templateSeedItems.map((template) => ({ slug: template.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const template = await getTemplate(slug)
  if (!template) notFound()
  const variables = Array.isArray(template.variables) ? template.variables.map(String) : []
  return <main className="bg-slate-50"><section className="mx-auto max-w-4xl px-4 py-12"><p className="text-sm font-bold text-emerald-700">{template.category}</p><h1 className="mt-2 text-4xl font-black">{template.title}</h1><p className="mt-3 text-slate-600">{template.intent}</p><Card className="mt-8"><CardHeader><CardTitle>Fill details</CardTitle></CardHeader><CardContent><TemplateRenderForm slug={template.slug} variables={variables} isPremium={template.isPremium} /></CardContent></Card><div className="mt-6"><FeedbackForm entity="Template" entityId={template.id || template.slug} /></div><div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Disclaimer: This ready draft is for guidance only, not an official or legal guarantee.</div></section></main>
}
