import { existsSync, rmSync } from 'node:fs'

for (const target of ['node_modules', 'package-lock.json']) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true })
    console.log(`Removed ${target}`)
  }
}

console.log('Clean install cleanup complete')
