import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const issues: string[] = []

if (pkg.devDependencies?.prisma !== '6.19.3') issues.push('devDependency prisma must stay pinned to 6.19.3')
if (pkg.dependencies?.['@prisma/client'] !== '6.19.3') issues.push('@prisma/client must stay pinned to 6.19.3')
if (!pkg.dependencies?.next || pkg.dependencies.next === 'latest') issues.push('next should be pinned, not latest')
if (!pkg.devDependencies?.typescript || pkg.devDependencies.typescript === 'latest') issues.push('typescript should be pinned, not latest')
if (!pkg.overrides?.prisma || !pkg.overrides?.['@prisma/client']) issues.push('Prisma overrides missing')

console.log('\nDependency Guard\n')
if (issues.length) {
  issues.forEach((issue) => console.error(`❌ ${issue}`))
  process.exit(1)
}
console.log('✅ Critical runtime dependencies are pinned safely.\n')
