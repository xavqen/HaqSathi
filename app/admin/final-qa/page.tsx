import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

const finalCommands = `npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run prelaunch:full
npm run build
npm run smoke:local
npm run dev`

const qaRows = [
  ['Build', 'npm run build', 'No TypeScript, route, or Prisma client error'],
  ['Auth', 'Register, login, logout, admin login', 'Session cookie and role protection work'],
  ['AI tools', 'Complaint, UPI, scheme, documents, chat', 'Fallback + API-key mode both safe'],
  ['Storage', 'Upload document vault file', 'Signed URL opens only for owner'],
  ['Billing', 'Razorpay test checkout', 'Payment success upgrades plan'],
  ['Email', 'Forgot password + reminders', 'Resend logs created and links work'],
  ['SEO', 'Sitemap, robots, SEO pages', 'No broken public core route'],
  ['Mobile', 'Chrome mobile view', 'Forms usable without horizontal scroll']
]

export default function Page() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 18</p>
        <h1 className="text-3xl font-black">Final QA Command Center</h1>
        <p className="mt-2 text-slate-600">Launch ke pehle last audit, build, smoke test aur manual QA yahin se run karo.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>One-shot local QA commands</CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{finalCommands}</pre>
          <div className="mt-4"><CopyButton text={finalCommands} label="Copy final QA commands" /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Manual launch gates</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b text-left"><th className="py-3 pr-4">Area</th><th className="py-3 pr-4">Test</th><th className="py-3 pr-4">Pass condition</th></tr></thead>
            <tbody>{qaRows.map(([area, test, pass]) => <tr key={area} className="border-b"><td className="py-3 pr-4 font-bold">{area}</td><td className="py-3 pr-4 text-slate-600">{test}</td><td className="py-3 pr-4 text-slate-600">{pass}</td></tr>)}</tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Feature freeze rule</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-7 text-slate-600">Ab naye modules add mat karo jab tak production build, payment, email, storage, SEO aur mobile QA pass na ho. Is phase ke baad sirf bug fixes, verified official data, and polish changes karo.</p></CardContent>
      </Card>
    </div>
  )
}
