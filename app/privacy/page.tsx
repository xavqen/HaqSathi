import type { Metadata } from 'next'
import Link from 'next/link'
import { SUPPORT_EMAIL, GRIEVANCE_OFFICER_NAME, GRIEVANCE_OFFICER_EMAIL, GRIEVANCE_OFFICER_ADDRESS, LEGAL_LAST_UPDATED } from '@/lib/content/site-contact'

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = { title: 'Privacy Policy', description: 'How HaqSathi AI collects, uses and protects personal data for complaint and drafting workflows.' }

export default function Page() {
  return (
    <main className="bg-slate-50">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-[2rem] border bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">Legal</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Privacy Policy</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>
          <div className="mt-6 space-y-7 text-sm leading-7 text-slate-700 sm:text-base">
            <p>HaqSathi AI (&quot;we&quot;, &quot;us&quot;, &quot;HaqSathi&quot;) is a guidance and drafting platform for complaints, refunds, UPI issues, government schemes and documents, operated for users in India. This policy explains what information we collect, how we use it, and the rights you have over it under India&apos;s Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;).</p>
            <Section title="1. Information we collect" items={[
              'Account information: name, email address, and authentication details such as email/password or Google sign-in.',
              'Case information you provide: complaint type, company/bank/app name, transaction or reference IDs, dates, amounts, issue description, desired resolution, and previous communication you enter.',
              'Documents/images you upload for OCR autofill or proof scanning.',
              'Usage data: pages visited, tools used, device/browser type, and approximate location for product improvement and abuse prevention.',
              'Payment information is handled by Razorpay; we do not store your card, UPI PIN, or bank credentials.'
            ]} />
            <p className="rounded-2xl bg-amber-50 p-4 text-amber-950"><b>Important:</b> Do not enter OTPs, passwords, full card numbers, UPI PINs, or other secret credentials anywhere on HaqSathi AI. We never need this information to help you.</p>
            <Section title="2. How we use your information" items={[
              'To generate complaint drafts, checklists, call scripts, scheme suggestions and follow-up plans.',
              'To save your case history, reminders, and drafts to your account if logged in.',
              'To improve and secure the product, and prevent abuse.',
              'To send reminders or service updates you have opted into.'
            ]} />
            <section><h2 className="text-2xl font-black text-slate-950">3. AI processing and third-party services</h2><p className="mt-2">To generate drafts and suggestions, the text you enter may be sent to third-party AI providers such as Google Gemini and/or OpenAI for processing. These providers process data under their own terms and may be located outside India. We do not knowingly send OTPs, passwords or full payment credentials to these providers — please do not enter them.</p><p className="mt-2">We also use Razorpay for payments and database/hosting providers such as PostgreSQL/Supabase or similar services to store account and case data securely.</p></section>
            <Section title="4. Data sharing" items={['We do not sell your personal data.', 'We share data only with service providers needed to operate HaqSathi AI, or where required by law such as a valid court or government order.']} />
            <section><h2 className="text-2xl font-black text-slate-950">5. Data retention</h2><p className="mt-2">We retain account and case data for as long as your account is active, plus a reasonable period afterward for legal, security and backup purposes. You can request deletion of your account and data at any time.</p></section>
            <Section title="6. Your rights under the DPDP Act" items={['Access the personal data we hold about you.', 'Request correction or updating of inaccurate or incomplete data.', 'Request erasure of your data, subject to legal retention requirements.', 'Withdraw consent for processing, which may limit some features.', 'File a grievance with our Grievance Officer, and if unresolved, with the Data Protection Board of India.']} />
            <section><h2 className="text-2xl font-black text-slate-950">7. How to exercise your rights</h2><p className="mt-2">Email <a className="font-black text-emerald-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the subject &quot;Privacy Request&quot; from your registered email address. We will respond within a reasonable time as required by law.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">8. Security</h2><p className="mt-2">We use reasonable technical and organizational measures such as encrypted connections, access controls and hashed passwords to protect your data. No system is 100% secure, so please avoid sharing OTPs, passwords or PINs anywhere on the platform.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">9. Grievance Officer</h2><div className="mt-3 rounded-2xl bg-slate-50 p-4"><p><b>Grievance Officer:</b> {GRIEVANCE_OFFICER_NAME}</p><p><b>Email:</b> <a className="font-bold text-emerald-700 underline" href={`mailto:${GRIEVANCE_OFFICER_EMAIL}`}>{GRIEVANCE_OFFICER_EMAIL}</a></p><p><b>Address:</b> {GRIEVANCE_OFFICER_ADDRESS}</p></div></section>
            <section><h2 className="text-2xl font-black text-slate-950">10. Children&apos;s privacy</h2><p className="mt-2">HaqSathi AI is intended for users aged 18 and above. We do not knowingly collect data from children.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">11. Changes to this policy</h2><p className="mt-2">We may update this policy periodically. Material changes will be reflected here with an updated &quot;Last updated&quot; date.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">12. Contact us</h2><p className="mt-2">Privacy questions: <a className="font-black text-emerald-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></section>
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate Complaint</Link><Link href="/" className="rounded-xl border px-5 py-3 font-semibold">Home</Link></div>
        </div>
      </article>
    </main>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  return <section><h2 className="text-2xl font-black text-slate-950">{title}</h2><ul className="mt-3 list-disc space-y-2 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>
}
