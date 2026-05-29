import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { SavedLinkForm } from '@/components/forms/saved-link-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function SavedLinksPage() {
  const user = await requireUser()
  const links = await db.savedOfficialLink.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])
  return <div><h1 className="text-4xl font-black">Saved Official Links</h1><p className="mt-2 text-slate-600">Save official government or company links for your case.</p><div className="mt-8"><SavedLinkForm /></div><Card className="mt-8"><CardHeader><CardTitle>Your links</CardTitle></CardHeader><CardContent>{links.length === 0 ? <p className="text-slate-500">No saved links.</p> : <div className="space-y-3">{links.map((link) => <a key={link.id} href={link.url} target="_blank" className="block rounded-xl border p-4 hover:bg-slate-50"><b>{link.title}</b><p className="text-sm text-slate-600">{link.category}{link.state ? ` · ${link.state}` : ''}</p>{link.notes && <p className="mt-2 text-sm text-slate-500">{link.notes}</p>}</a>)}</div>}</CardContent></Card></div>
}
