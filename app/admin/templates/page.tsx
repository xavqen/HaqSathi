import Link from 'next/link'
import { db } from '@/lib/db'
import { AdminTemplateForm } from '@/components/forms/admin-template-form'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const templates = await db.template.findMany({ orderBy: [{ category: 'asc' }, { updatedAt: 'desc' }] }).catch(() => [])
  return <div><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-black">Templates</h1><p className="mt-2 text-slate-600">Ready drafts library manage karein.</p></div><Link href="/templates" className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">View Public</Link></div><div className="mt-6"><AdminTemplateForm /></div><div className="mt-8 overflow-hidden rounded-3xl border bg-white shadow-soft"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Title</th><th>Category</th><th>Premium</th><th>Uses</th><th>Action</th></tr></thead><tbody>{templates.map((t) => <tr key={t.id} className="border-t"><td className="p-4 font-semibold">{t.title}</td><td>{t.category}</td><td>{t.isPremium ? 'Yes' : 'No'}</td><td>{t.usageCount}</td><td><Link href={`/admin/templates/${t.id}/edit`} className="font-semibold text-primary">Edit</Link></td></tr>)}</tbody></table></div></div>
}
