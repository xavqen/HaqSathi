import { getEnvHealth } from '@/lib/launch/env-health'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Page() {
  const health = getEnvHealth('PRODUCTION')
  const grouped = health.items.reduce<Record<string, typeof health.items>>((acc, item) => {
    acc[item.area] ||= []
    acc[item.area].push(item)
    return acc
  }, {})

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Environment Health</h1>
        <p className="mt-2 text-slate-600">Production launch ke liye env variables configured hain ya nahi, safe masked view.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Production required readiness</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-black">{health.totals.productionPassing}/{health.totals.productionRequired}</p><p className="text-sm text-slate-600">required production variables passing</p></CardContent>
      </Card>
      <div className="grid gap-5">
        {Object.entries(grouped).map(([area, items]) => (
          <Card key={area}>
            <CardHeader><CardTitle>{area}</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {items.map((item) => (
                <div key={item.key} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{item.key}</p>
                    <Badge className={item.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>{item.ok ? 'OK' : 'MISSING'}</Badge>
                  </div>
                  <p className="mt-1 break-all text-sm text-slate-600">Current: {item.current}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.advice}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
