import { readdirSync, statSync } from 'fs'
import { join, relative, sep } from 'path'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function collectRoutes() {
  const appDir = join(process.cwd(), 'app')
  const routes: string[] = []
  function walk(dir: string) {
    for (const item of readdirSync(dir)) {
      const full = join(dir, item)
      const stat = statSync(full)
      if (stat.isDirectory()) walk(full)
      if (stat.isFile() && item === 'page.tsx') {
        const rel = relative(appDir, dir).split(sep).join('/')
        routes.push(rel ? `/${rel}` : '/')
      }
    }
  }
  walk(appDir)
  return routes.sort()
}

export default function Page() {
  const routes = collectRoutes()
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Route Inventory</h1>
        <p className="mt-2 text-slate-600">Total pages detected: {routes.length}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All page routes</CardTitle></CardHeader>
        <CardContent><div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">{routes.map((route) => <code key={route} className="rounded-xl bg-slate-100 px-3 py-2 text-xs">{route}</code>)}</div></CardContent>
      </Card>
    </div>
  )
}
