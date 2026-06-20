import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const baseUrl = (process.env.LIGHTHOUSE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
const outDir = process.env.LIGHTHOUSE_OUTPUT_DIR || './artifacts/lighthouse'
const routes = (process.env.LIGHTHOUSE_ROUTES || '/,/tools,/complaint,/upi-help,/pricing')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)
const modes = (process.env.LIGHTHOUSE_MODES || 'mobile,desktop').split(',').map((mode) => mode.trim()).filter(Boolean)
mkdirSync(outDir, { recursive: true })

for (const route of routes) {
  for (const mode of modes) {
    const preset = mode === 'desktop' ? 'desktop' : 'perf'
    const safeRoute = route === '/' ? 'home' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-')
    const outputPath = path.join(outDir, `${safeRoute}-${mode}.html`)
    const url = `${baseUrl}${route}`
    const args = [
      '--yes',
      'lighthouse',
      url,
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox',
      `--preset=${preset}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=html',
      `--output-path=${outputPath}`
    ]
    console.log(`Running Lighthouse ${mode}: ${url}`)
    const result = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' })
    if (result.status !== 0) {
      console.error(`Lighthouse failed for ${route} (${mode}). Make sure the app is running and reachable at ${baseUrl}.`)
      process.exit(result.status || 1)
    }
  }
}
console.log(`Lighthouse batch reports saved to ${outDir}`)
