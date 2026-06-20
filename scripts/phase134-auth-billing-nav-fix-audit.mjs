import fs from 'node:fs'

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : ''
}

let failed = false
function pass(name, ok) {
  if (ok) console.log(`✅ ${name}`)
  else {
    failed = true
    console.error(`❌ ${name}`)
  }
}

const pkg = JSON.parse(read('package.json'))
const loginPage = read('app/login/page.tsx')
const registerPage = read('app/register/page.tsx')
const homePage = read('app/page.tsx')
const navbar = read('components/layout/navbar.tsx')
const desktopNav = read('components/layout/desktop-scroll-nav.tsx')
const checkoutButton = read('components/forms/checkout-button.tsx')
const checkoutApi = read('app/api/billing/checkout/route.ts')
const verifyApi = read('app/api/billing/verify/route.ts')
const billingPage = read('app/dashboard/billing/page.tsx')
const session = read('lib/auth/session.ts')
const entitlements = read('lib/billing/entitlements.ts')
const planUtils = read('lib/billing/plans.ts')
const authMe = read('app/api/auth/me/route.ts')
const sw = read('public/sw.js')
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const allAppComponents = [...walk('app'), ...walk('components')]
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .map((file) => [file, read(file)])

function* walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

pass('version bumped to v3.0.105 auth billing nav fix', pkg.version === '3.0.105-motion-hydration-stability')
pass('login page redirects already logged-in users to safe next path', loginPage.includes('getCurrentUser') && loginPage.includes('if (user) redirect(next)') && loginPage.includes('safeRedirectPath'))
pass('register page redirects already logged-in users to safe next path', registerPage.includes('getCurrentUser') && registerPage.includes('if (user) redirect(next)') && registerPage.includes('safeRedirectPath'))
pass('homepage start CTAs are auth-aware and target tools without forcing login', homePage.includes('AuthAwareCtaLink') && homePage.includes('const startHref = "/tools"') && !homePage.includes('const startHref = "/login?next=/tools"'))
pass('desktop navbar supports mouse-wheel horizontal scrolling', navbar.includes('DesktopScrollNav') && desktopNav.includes('onWheel={handleWheel}') && desktopNav.includes('element.scrollLeft += verticalDelta') && desktopNav.includes('overflow-x-auto'))
pass('checkout button redirects guests to login and marks current/included plans', checkoutButton.includes('buildLoginPath(returnTo)') && checkoutButton.includes('Current plan') && checkoutButton.includes('Included in current plan') && checkoutButton.includes('comparePlans'))
pass('billing checkout API returns 401 loginPath instead of throwing server redirect', checkoutApi.includes('getCurrentUser') && checkoutApi.includes('status: 401') && checkoutApi.includes('loginPath: buildLoginPath'))
pass('billing verify API returns 401 loginPath instead of throwing server redirect', verifyApi.includes('getCurrentUser') && verifyApi.includes('status: 401') && verifyApi.includes('loginPath: buildLoginPath'))
pass('session resolves effective plan from active subscription and paid order', session.includes('subscriptions:') && session.includes('paymentOrders:') && session.includes('resolveEffectivePlan'))
pass('billing entitlement sync repairs stale FREE plan display after paid subscription', billingPage.includes('syncUserPlanFromBilling') && billingPage.includes('entitlement.source') && billingPage.includes('currentPlan={currentPlan}'))
pass('billing utility modules separate client plan math from server DB entitlement logic', planUtils.includes('PLAN_RANK') && entitlements.includes("import 'server-only'") && entitlements.includes('getBillingEntitlement'))
pass('auth/me exposes effective plan source for navbar and pricing UI', authMe.includes('entitlementSource') && authMe.includes('plan: user.plan'))
pass('direct app/admin/dashboard login redirects are removed in favor of guarded helpers', !allAppComponents.some(([file, body]) => !['app/login/page.tsx'].includes(file) && /redirect\(['\"]\/login/.test(body)))
pass('env health ready and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.105"') && health.includes('3.0.105-motion-hydration-stability') && ready.includes('3.0.105-motion-hydration-stability') && sw.includes('haqsathi-ai-v3-0-105-motion-hydration-stability'))
pass('quality release includes phase134', String(pkg.scripts['quality:release'] || '').includes('phase134:audit') && pkg.scripts['phase134:audit'] === 'node scripts/phase134-auth-billing-nav-fix-audit.mjs')

if (failed) process.exit(1)
