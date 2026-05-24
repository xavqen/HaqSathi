const baseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const paths = ['/', '/health-not-real', '/api/health', '/api/ready', '/complaint', '/upi-help', '/scheme-finder', '/documents', '/tools', '/launch-readiness']

async function check(path: string) {
  const res = await fetch(`${baseUrl}${path}`, { method: path.startsWith('/api/') ? 'GET' : 'HEAD' }).catch((err) => ({ ok: false, status: 0, statusText: String(err) } as Response))
  return { path, status: res.status, ok: path === '/health-not-real' ? res.status === 404 : res.status < 500 }
}

async function main() {
  console.log(`HaqSathi AI local smoke test: ${baseUrl}`)
  const results = await Promise.all(paths.map(check))
  for (const result of results) console.log(`${result.ok ? '✅' : '❌'} ${result.path} -> ${result.status}`)
  if (results.some((result) => !result.ok)) process.exit(1)
}

main()
