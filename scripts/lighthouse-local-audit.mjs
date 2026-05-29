import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const baseUrl = process.env.LIGHTHOUSE_BASE_URL || 'http://localhost:3000'
const outDir = process.env.LIGHTHOUSE_OUTPUT_DIR || './artifacts/lighthouse'
const mode = process.argv[2] || 'mobile'
const url = process.argv[3] || baseUrl
const preset = mode === 'desktop' ? 'desktop' : 'perf'
mkdirSync(outDir, { recursive: true })

const outputPath = path.join(outDir, `${mode}.html`)
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

const result = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' })
if (result.status !== 0) {
  console.error(`Lighthouse failed. Make sure the app is running at ${url}.`)
  process.exit(result.status || 1)
}
console.log(`Lighthouse ${mode} report saved to ${outputPath}`)
