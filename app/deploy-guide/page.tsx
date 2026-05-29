import { CopyButton } from '@/components/ui/copy-button'

const localCommands = `npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run launch:final
npm run build`

const envList = `NEXT_PUBLIC_APP_URL
AUTH_SECRET
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
RESEND_API_KEY
RESEND_FROM_EMAIL
RAZORPAY_KEY_ID
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
CRON_SECRET`

export const metadata = { title: 'Deployment Guide | HaqSathi AI', description: 'Vercel and Supabase deployment guide for HaqSathi AI.' }

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Deploy</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Production deployment guide</h1>
        <p className="mt-3 text-slate-600">Vercel + Supabase launch ke liye exact command aur env checklist.</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Local final commands</h2><pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{localCommands}</pre><div className="mt-4"><CopyButton text={localCommands} label="Copy commands" /></div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Vercel env variables</h2><pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{envList}</pre><div className="mt-4"><CopyButton text={envList} label="Copy env list" /></div></div>
        </div>
        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Manual QA before public launch</h2><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700"><li>Test register, login and logout.</li><li>Test complaint, UPI, scheme and document generators.</li><li>Test signed document upload and download links.</li><li>Verify Razorpay test checkout and webhook.</li><li>Receive the forgot-password email and test reset.</li><li>Test homepage, dashboard, tools and payment in mobile Chrome.</li></ol></div>
      </section>
    </main>
  )
}
