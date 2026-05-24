import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

const commands = `npm run clean:next-conflict
npm install
npm run build:guard
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase17:audit
npm run build
npm run smoke:local`

const deployCommands = `npm run launch:final
npm run build
vercel --prod`

export default function Page() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Build Center</h1>
        <p className="mt-2 text-slate-600">Local build, final audit aur deployment command sequence ek jagah.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Local final test</CardTitle></CardHeader>
          <CardContent><pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{commands}</pre><div className="mt-4"><CopyButton text={commands} label="Copy commands" /></div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Production deploy</CardTitle></CardHeader>
          <CardContent><pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{deployCommands}</pre><div className="mt-4"><CopyButton text={deployCommands} label="Copy deploy commands" /></div></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Release freeze rule</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-7 text-slate-600">Phase 17 ke baad naye features add karne se pehle build, payment, email, storage aur mobile QA complete karo. Production launch ke time sirf bug fixes aur verified content updates push karo.</p></CardContent>
      </Card>
    </div>
  )
}
