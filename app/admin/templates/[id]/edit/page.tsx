import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminTemplateForm } from '@/components/forms/admin-template-form'

export const dynamic = 'force-dynamic'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await db.template.findUnique({ where: { id } })
  if (!template) notFound()
  return <div><h1 className="text-3xl font-black">Edit Template</h1><p className="mt-2 text-slate-600">Template content update karein.</p><div className="mt-6"><AdminTemplateForm initial={template} /></div></div>
}
