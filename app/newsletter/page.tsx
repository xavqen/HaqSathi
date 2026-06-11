import Link from 'next/link'
import { CheckCircle2, MailCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { NewsletterSubscribeForm } from '@/components/forms/newsletter-subscribe-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'HaqSathi AI Newsletter - Rights Tips and Safety Updates',
  description: 'Subscribe to privacy-safe HaqSathi AI updates for complaint, refund, UPI safety, documents and scheme guidance.'
}

const benefits = [
  'Simple rights and complaint tips in easy language',
  'UPI fraud and refund safety reminders',
  'Document and scheme checklist updates',
  'Product changes and useful new tool alerts'
]

const promises = [
  'No spammy fear-based marketing',
  'No complaint text, document data or bank details in campaigns',
  'Consent-first updates with unsubscribe option',
  'Education and product updates only'
]

export default function NewsletterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-8 lg:p-10">
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Privacy-safe updates</Badge>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Get useful HaqSathi AI rights tips without spam.</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Receive practical updates about complaints, refunds, UPI safety, documents and schemes. Campaigns are designed to avoid sensitive personal data.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => <div key={benefit} className="flex gap-2 rounded-2xl border bg-white p-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{benefit}</div>)}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/tools" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">Explore tools</Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-black text-slate-700">Privacy policy</Link>
          </div>
        </div>

        <div className="space-y-4">
          <NewsletterSubscribeForm />
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Our email promise</CardTitle>
              <CardDescription>Marketing should be useful, safe and consent-based.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-slate-700">
                {promises.map((promise) => <li key={promise} className="flex gap-2"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{promise}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {['Rights tips', 'Safety alerts', 'Product updates'].map((title) => (
          <Card key={title}>
            <CardHeader>
              <MailCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>Short, useful and privacy-aware updates for real users.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  )
}
