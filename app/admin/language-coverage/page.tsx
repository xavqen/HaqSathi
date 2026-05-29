import Link from 'next/link'
import { getLanguageCoverageGroups } from '@/lib/tools/phase25-language-tools'

export const dynamic = 'force-dynamic'

export default function Page() {
  const { india, global, total } = getLanguageCoverageGroups()
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Admin language coverage</p>
        <h1 className="mt-2 text-3xl font-black">{total} languages enabled</h1>
        <p className="mt-2 text-slate-600">Primary language English hai. India + global languages profile/tools me available hain.</p>
        <Link href="/language-hub" className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Open language hub</Link>
      </div>
      <Group title="Indian language coverage" items={india} />
      <Group title="World language coverage" items={global} />
    </div>
  )
}

function Group({ title, items }: { title: string; items: readonly { code: string; label: string; nativeName: string; region: string; script: string }[] }) {
  return <div><h2 className="text-xl font-black">{title}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div className="rounded-2xl border bg-white p-4 shadow-sm" key={item.code}><b>{item.label} — {item.nativeName}</b><p className="mt-1 text-xs text-slate-500">{item.region} · {item.script}</p></div>)}</div></div>
}
