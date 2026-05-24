import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Landmark, MessageCircle, ShieldAlert, WalletCards } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { pricingPlans, trustPoints } from '@/lib/constants'
import { InstallPwaCard } from '@/components/layout/install-pwa'

const tools = [
  { title: 'AI Complaint Generator', desc: 'Refund, wrong item, bank debit, delivery scam ke drafts.', href: '/complaint', icon: FileText },
  { title: 'UPI Fraud/Wrong Transfer', desc: 'Urgent steps, bank complaint, proof checklist.', href: '/upi-help', icon: ShieldAlert },
  { title: 'Scheme Finder', desc: 'State, age, income aur goal ke basis par scheme suggestions.', href: '/scheme-finder', icon: Landmark },
  { title: 'Document Checklist', desc: 'Income, caste, scholarship, KYC, passport basics.', href: '/documents', icon: WalletCards },
  { title: 'AI Chat Assistant', desc: 'WhatsApp-style Hinglish help for quick questions.', href: '/chat', icon: MessageCircle }
]

const faqs = [
  ['Kya HaqSathi AI official government website hai?', 'Nahi. Ye guidance tool hai. Official submission se pehle government/company portal verify karein.'],
  ['Kya complaint generator free hai?', 'Free plan me 3 complaint drafts/month milenge.'],
  ['Cyber fraud me kya karna chahiye?', 'Turant bank/payment app aur official cyber fraud emergency channels ko report karein.']
]

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-emerald-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge>India-first life admin AI</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Aapka haq, complaint, refund, documents aur schemes — simple language me.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">HaqSathi AI common people ke liye complaint draft, UPI help, document checklist aur scheme guidance ko easy Hinglish me convert karta hai.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/complaint" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">Generate Complaint <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link href="/upi-help" className="inline-flex h-12 items-center justify-center rounded-xl border px-6 font-semibold hover:bg-slate-50">UPI Urgent Help</Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {trustPoints.map((point) => <div key={point} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />{point}</div>)}
            </div>
          </div>
          <Card className="border-emerald-100 bg-white">
            <CardHeader>
              <CardTitle>Popular complaint draft</CardTitle>
              <CardDescription>Fast copy-ready format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                Dear Support Team,<br />
                Mera refund abhi tak receive nahi hua. Order/Transaction ID: _____. Amount: ₹_____. Please check and provide written update with expected resolution timeline.
              </div>
              <Link href="/complaint" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">Create my draft</Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="max-w-3xl">
          <Badge>Problem</Badge>
          <h2 className="mt-3 text-3xl font-bold">Logon ko exact complaint words, documents aur next step samajh nahi aata.</h2>
          <p className="mt-3 text-slate-600">HaqSathi AI unko simple wizard se guide karta hai — kya likhna hai, kya proof chahiye, aur follow-up kab karna hai.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {tools.map((tool) => (
            <Card key={tool.title} className="transition hover:-translate-y-1 hover:shadow-soft">
              <CardHeader>
                <tool.icon className="h-8 w-8 text-emerald-700" />
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.desc}</CardDescription>
              </CardHeader>
              <CardContent><Link className="font-semibold text-emerald-700" href={tool.href}>Open tool →</Link></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-3">
            {['Select issue', 'Fill basic details', 'Copy AI draft'].map((step, index) => (
              <Card key={step}>
                <CardHeader>
                  <Badge>Step {index + 1}</Badge>
                  <CardTitle>{step}</CardTitle>
                  <CardDescription>{index === 0 ? 'Complaint/refund/UPI/document type choose karo.' : index === 1 ? 'Company, amount, date, issue aur proof details add karo.' : 'Draft copy karo, PDF/download/share options use karo.'}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-bold">Pricing</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className={plan.name === 'Pro' ? 'border-emerald-500' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-3xl font-black">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  {plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" />{feature}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-3xl font-bold">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faqs.map(([q, a]) => <Card key={q}><CardHeader><CardTitle className="text-lg">{q}</CardTitle><CardDescription>{a}</CardDescription></CardHeader></Card>)}
        </div>
      </section>
    
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border bg-white p-8 shadow-soft">
          <p className="text-sm font-bold text-emerald-700">New in Phase 6</p>
          <h2 className="mt-2 text-3xl font-black">Ready templates + official resource directory</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Refund follow-up, UPI wrong transfer, bank debit complaint, scholarship document note jaise ready drafts ab template library me milenge.</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href="/templates" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Open Templates</a><a href="/resources" className="rounded-xl border px-5 py-3 text-sm font-semibold">Official Resources</a></div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-12"><div className="grid gap-6 lg:grid-cols-2"><InstallPwaCard /><div className="rounded-3xl border bg-white p-6 shadow-soft"><p className="text-sm font-bold text-emerald-700">New in Phase 7</p><h2 className="mt-2 text-3xl font-black">Search + launch checklist + stronger safety layer</h2><p className="mt-3 text-slate-600">Universal search, PWA install, admin audit log, launch checklist, security page aur global disclaimer banner add ho gaya.</p><div className="mt-5 flex flex-wrap gap-3"><a href="/search" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Search App</a><a href="/dashboard/security" className="rounded-xl border px-5 py-3 text-sm font-semibold">Security Page</a></div></div></div></section>


      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border bg-gradient-to-r from-slate-950 to-emerald-950 p-8 text-white shadow-soft">
          <p className="text-sm font-bold text-emerald-200">Final completion layer</p>
          <h2 className="mt-2 text-3xl font-black">Advanced packs: RTI, legal-style draft, consumer forum, evidence pack</h2>
          <p className="mt-3 max-w-3xl text-emerald-50">Ab simple complaint ke baad escalation-ready documents bhi ban sakte hain: notice-style draft, RTI application, bank escalation, consumer forum summary aur evidence index.</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href="/tools/legal-notice-draft" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Legal Draft</a><a href="/tools/rti-helper" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white">RTI Helper</a><a href="/dashboard/evidence-packs" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white">Evidence Packs</a></div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border bg-white p-8 shadow-soft">
          <p className="text-sm font-bold text-emerald-700">New in Phase 17</p>
          <h2 className="mt-2 text-3xl font-black">Final launch hardening: health checks, env audit, build guard</h2>
          <p className="mt-3 max-w-3xl text-slate-600">Production deploy se pehle app health, DB readiness, SEO audit, security headers, error pages, cookie consent aur analytics-ready setup verify kar sakte ho.</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href="/launch-readiness" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Launch Readiness</a><a href="/deploy-guide" className="rounded-xl border px-5 py-3 text-sm font-semibold">Deploy Guide</a></div>
        </div>
      </section>

    </main>
  )
}
