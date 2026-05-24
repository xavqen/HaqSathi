import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminSchemeForm } from '@/components/forms/admin-scheme-form'

export const dynamic = 'force-dynamic'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scheme = await db.scheme.findUnique({ where: { id } })
  if (!scheme) notFound()
  const initial = {
    id: scheme.id,
    title: scheme.title,
    slug: scheme.slug,
    state: scheme.state,
    purpose: scheme.purpose,
    eligibility: scheme.eligibility,
    documents: scheme.documents,
    applySteps: scheme.applySteps,
    officialLink: scheme.officialLink
  }
  return <div><h1 className="text-3xl font-black">Edit Scheme</h1><div className="mt-6"><AdminSchemeForm initial={initial} /></div></div>
}
