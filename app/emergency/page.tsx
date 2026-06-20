import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Emergency Help', description: 'UPI fraud, wrong payment and cyber scam first-response checklist.' }

const cards = [
  ['UPI fraud/scam', ['Bank/payment app ko immediately report karo', 'UPI/card/netbanking block ya secure karo', 'Cyber fraud official emergency channel par complaint karo', 'Acknowledgement number save karo'], '/upi-help'],
  ['Wrong UPI transfer', ['Receiver details and UTR save karo', 'Bank/app support ko written request bhejo', 'NPCI/bank dispute flow verify karo', 'Follow-up reminder set karo'], '/tools/bank-escalation'],
  ['Refund not received', ['Order ID, amount and date collect karo', 'Company support ko complaint draft bhejo', '7-15 day follow-up plan banao', 'Consumer filing guide check karo'], '/complaint']
]

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-red-600">Urgent mode</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Emergency first-response center</h1><p className="mt-3 max-w-2xl text-slate-600">Fraud me first few hours important hote hain. Ye checklist guidance hai, official emergency channels ko immediately contact karein.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{cards.map(([title, steps, href]: any) => <Card key={title} className="h-full"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">{steps.map((s: string) => <li key={s}>{s}</li>)}</ol><Link href={href} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Open helper</Link></CardContent></Card>)}</div><div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"><b>Safety:</b> Kisi ko OTP, PIN, password, full card number, remote access app permission ya screen share mat do. HaqSathi official government/bank authority nahi hai.</div></section></main>
}
