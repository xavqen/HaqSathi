import { existsSync, rmSync } from 'node:fs'

const targets = ['middleware.ts', '.next']

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true })
    console.log(`Removed ${target}`)
  }
}

console.log('Cleaned middleware/proxy conflict and .next cache')
