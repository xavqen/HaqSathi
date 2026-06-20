import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/forms/contact-form'

export const dynamic = 'force-static'
export const revalidate = 86400

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@haqsathi.site'

export const metadata: Metadata = { title: 'Contact', description: 'Contact HaqSathi AI support.' }
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-wider text-primary">Support</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Contact HaqSathi AI</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Send support questions, payment issues, bug reports, fraud/abuse reports or privacy requests. You can also email us at <b>{supportEmail}</b>.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-2xl">Send a message</CardTitle></CardHeader>
        <CardContent><ContactForm /></CardContent>
      </Card>
    </main>
  )
}
