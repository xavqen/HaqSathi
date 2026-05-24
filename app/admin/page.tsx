import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const [users, complaints, schemes, contacts, seoPages, payments, templates, resources, feedback] = await Promise.all([
    db.user.count(), db.complaint.count(), db.scheme.count(), db.contactMessage.count(), db.seoPage.count(), db.paymentOrder.count(), db.template.count(), db.officialResource.count(), db.feedback.count()
  ])
  return <div><h1 className="text-3xl font-black">Admin Overview</h1><p className="mt-2 text-slate-600">Business metrics and content controls.</p><div className="mt-6 grid gap-5 md:grid-cols-3">{[['Users', users], ['Complaints', complaints], ['Schemes', schemes], ['Contact messages', contacts], ['SEO pages', seoPages], ['Payment orders', payments], ['Templates', templates], ['Resources', resources], ['Feedback', feedback]].map(([k,v]) => <Card key={k}><CardHeader><CardTitle className="text-base">{k}</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{v}</div></CardContent></Card>)}</div></div>
}
