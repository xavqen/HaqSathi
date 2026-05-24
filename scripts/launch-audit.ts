import { getLaunchChecks } from '../lib/launch/checks'
const checks=await getLaunchChecks(); const passed=checks.filter((check)=>check.ok).length; for(const check of checks) console.log(`${check.ok?'✅':'❌'} [${check.area}] ${check.item} - ${check.note}`); console.log(`
Launch audit: ${passed}/${checks.length} checks passed.`); if(passed<checks.length) process.exitCode=1
