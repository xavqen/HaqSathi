export type SecretsReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type SecretsReadinessPriority = 'P0' | 'P1' | 'P2'

export type SecretsReadinessControl = {
  id: string
  label: string
  status: SecretsReadinessStatus
  priority: SecretsReadinessPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type SecretLane = {
  id: string
  label: string
  priority: SecretsReadinessPriority
  secrets: string[]
  rotationCadence: string
  owner: string
  leakRisk: string
  verification: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

function secretConfigured(name: string) {
  const value = env(name)
  return Boolean(value && value.length >= 16 && !/change-this|secret|password|example|YOUR_|placeholder|test_test_test/i.test(value))
}

function validMode(name: string, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'active', 'enforced'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: SecretsReadinessStatus,
  priority: SecretsReadinessPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): SecretsReadinessControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const secretLanes: SecretLane[] = [
  {
    id: 'auth-session-secrets',
    label: 'Auth and session secrets',
    priority: 'P0',
    secrets: ['AUTH_SECRET', 'NEXTAUTH_SECRET', 'JWT_SECRET if used'],
    rotationCadence: 'Rotate before public launch, after any suspected leak, and every 90 days for high-risk launch periods.',
    owner: 'Security/Admin',
    leakRisk: 'Stolen sessions, forged tokens, account takeover and admin impersonation.',
    verification: 'Production env screenshot with values hidden and one forced logout/session refresh test.'
  },
  {
    id: 'database-secrets',
    label: 'Database and Supabase service secrets',
    priority: 'P0',
    secrets: ['DATABASE_URL', 'DIRECT_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    rotationCadence: 'Rotate on team member/device change, leak suspicion, or before moving from test data to real users.',
    owner: 'Developer/Ops',
    leakRisk: 'Full user data exposure, destructive writes, private document metadata access and irreversible privacy breach.',
    verification: 'Supabase dashboard screenshot, RLS/storage review, deploy build proof after rotation.'
  },
  {
    id: 'payment-webhook-secrets',
    label: 'Payment and webhook secrets',
    priority: 'P0',
    secrets: ['RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
    rotationCadence: 'Rotate when switching test/live mode, after webhook mismatch incidents, and after contractor access changes.',
    owner: 'Finance/Founder',
    leakRisk: 'Fake paid upgrades, webhook replay, refund abuse and invoice/payment record mismatch.',
    verification: 'Sandbox webhook replay proof, invalid signature rejection screenshot and live/test key separation evidence.'
  },
  {
    id: 'email-notification-secrets',
    label: 'Email and notification provider secrets',
    priority: 'P1',
    secrets: ['RESEND_API_KEY', 'WHATSAPP_PROVIDER_API_KEY', 'SMS_PROVIDER_API_KEY', 'VAPID_PRIVATE_KEY'],
    rotationCadence: 'Rotate after provider migration, sender-domain change, bounce/abuse incident or team access change.',
    owner: 'Growth/Ops',
    leakRisk: 'Spam sent from your brand, account suspension, user phishing and high provider bills.',
    verification: 'Provider key scope screenshot, dry-run disabled only after inbox/provider evidence is saved.'
  },
  {
    id: 'cron-admin-secrets',
    label: 'Cron, admin and internal operation secrets',
    priority: 'P0',
    secrets: ['CRON_SECRET', 'ADMIN_BACKUP_SECRET', 'ERROR_ALERT_WEBHOOK_URL', 'OBSERVABILITY_ALERT_WEBHOOK_URL'],
    rotationCadence: 'Rotate before launch and after any logged unauthorized cron/admin attempt.',
    owner: 'Ops/Admin',
    leakRisk: 'Unauthorized cron runs, fake alert noise, backup exports and operational disruption.',
    verification: 'Protected cron returns 401 without secret and succeeds only with configured secret.'
  },
  {
    id: 'public-env-boundary',
    label: 'Public environment variable boundary',
    priority: 'P0',
    secrets: ['No secret under NEXT_PUBLIC_*'],
    rotationCadence: 'Review on every new env var and before every public deployment.',
    owner: 'Developer/Security',
    leakRisk: 'Private API keys shipped to browser bundle and impossible to fully revoke from client caches.',
    verification: 'Manual grep/build review showing service role, private keys and webhook secrets are server-only.'
  }
]

const controls: SecretsReadinessControl[] = [
  control(
    'secrets-owner-assigned',
    'Secrets owner assigned',
    configured('SECRETS_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `SECRETS_OWNER=${env('SECRETS_OWNER') || 'empty'}`,
    'A named owner approves secret creation, storage, rotation and revocation before public launch.',
    'Owner name plus /admin/secrets-readiness screenshot.',
    'Nobody is accountable when a key leaks, expires, is over-permissioned or blocks deployment.'
  ),
  control(
    'secrets-mode-safe',
    'Secrets readiness mode is safe',
    validMode('SECRETS_ROTATION_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `SECRETS_ROTATION_MODE=${env('SECRETS_ROTATION_MODE', 'manual_review')}`,
    'Mode is dry_run/manual_review/active/enforced and matches launch stage.',
    'Readiness report with selected mode and signoff note.',
    'Unknown mode can hide required rotations or accidentally force rotations during launch.'
  ),
  control(
    'auth-secret-strong',
    'Auth/session secret is configured',
    secretConfigured('AUTH_SECRET') || secretConfigured('NEXTAUTH_SECRET') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `AUTH_SECRET=${secretConfigured('AUTH_SECRET') ? 'configured' : 'empty'}; NEXTAUTH_SECRET=${secretConfigured('NEXTAUTH_SECRET') ? 'configured' : 'empty'}`,
    'Session/auth secret is long, non-placeholder and only stored in server environment variables.',
    'Hidden Vercel/Supabase env screenshot and one login/logout/session persistence proof.',
    'Weak or missing session secret can break auth or allow token/session forgery.'
  ),
  control(
    'database-secrets-server-only',
    'Database/service role secrets are server-only',
    configured('DATABASE_URL') && configured('DIRECT_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `DATABASE_URL=${configured('DATABASE_URL') ? 'configured' : 'empty'}; DIRECT_URL=${configured('DIRECT_URL') ? 'configured' : 'empty'}; SUPABASE_SERVICE_ROLE_KEY=${configured('SUPABASE_SERVICE_ROLE_KEY') ? 'configured' : 'empty'}`,
    'Database and service role keys are configured only in server env and never exposed via NEXT_PUBLIC.',
    'Env screenshot with values hidden and grep proof that service role is not client-exposed.',
    'Service role exposure can bypass user permissions and expose private documents/data.'
  ),
  control(
    'payment-secret-reviewed',
    'Payment secrets reviewed',
    configured('RAZORPAY_KEY_SECRET') && configured('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `RAZORPAY_KEY_SECRET=${configured('RAZORPAY_KEY_SECRET') ? 'configured' : 'empty'}; RAZORPAY_WEBHOOK_SECRET=${configured('RAZORPAY_WEBHOOK_SECRET') ? 'configured' : 'empty'}`,
    'Razorpay secret and webhook secret are configured for the correct test/live environment and verified by signature tests.',
    'Payment readiness evidence plus invalid webhook signature rejection proof.',
    'Payment status can be spoofed or webhook events can be accepted incorrectly.'
  ),
  control(
    'cron-secrets-reviewed',
    'Cron/admin operation secrets reviewed',
    configured('CRON_SECRET') || configured('ADMIN_BACKUP_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P1',
    `CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}; ADMIN_BACKUP_SECRET=${configured('ADMIN_BACKUP_SECRET') ? 'configured' : 'empty'}`,
    'Protected cron/admin operation secrets are configured and fail closed without valid secret.',
    '401 screenshot without secret and success screenshot with secret on staging/deployed URL.',
    'Anyone who finds a cron URL can trigger costly or sensitive background operations.'
  ),
  control(
    'public-env-boundary-reviewed',
    'NEXT_PUBLIC boundary reviewed',
    enabled('SECRETS_PUBLIC_ENV_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `SECRETS_PUBLIC_ENV_REVIEWED=${env('SECRETS_PUBLIC_ENV_REVIEWED', 'false')}`,
    'Only safe browser values are prefixed with NEXT_PUBLIC; all private tokens stay server-only.',
    'Manual grep/build review screenshot or saved report.',
    'Private secrets can be bundled into JavaScript and exposed to every visitor.'
  ),
  control(
    'rotation-runbook-reviewed',
    'Rotation runbook reviewed',
    enabled('SECRETS_ROTATION_RUNBOOK_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `SECRETS_ROTATION_RUNBOOK_REVIEWED=${env('SECRETS_ROTATION_RUNBOOK_REVIEWED', 'false')}`,
    'Team knows how to rotate auth, database, payment, email, storage, cron and alert secrets without downtime.',
    'Saved rotation checklist and rollback note.',
    'A key leak or emergency rotation can turn into a long outage.'
  ),
  control(
    'least-privilege-reviewed',
    'Least privilege reviewed',
    enabled('SECRETS_LEAST_PRIVILEGE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `SECRETS_LEAST_PRIVILEGE_REVIEWED=${env('SECRETS_LEAST_PRIVILEGE_REVIEWED', 'false')}`,
    'Provider keys use the narrowest scopes/modes possible and live/test keys are separated.',
    'Provider dashboard screenshots with values hidden and scope/mode notes.',
    'Over-permissioned keys increase damage from a leak or compromised account.'
  ),
  control(
    'leak-response-reviewed',
    'Secret leak response reviewed',
    enabled('SECRETS_LEAK_RESPONSE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `SECRETS_LEAK_RESPONSE_REVIEWED=${env('SECRETS_LEAK_RESPONSE_REVIEWED', 'false')}`,
    'Leak response checklist covers revoke, rotate, invalidate sessions, review logs, notify owners and preserve evidence.',
    'Incident runbook link and drill evidence.',
    'A leaked key can remain active for days because nobody knows the exact revoke/rotate sequence.'
  )
]

const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
const blocked = controls.filter((item) => item.status === 'BLOCKED').length

export function getSecretsReadinessReport() {
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.50-secrets-rotation-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      secretLanes: secretLanes.length,
      p0Controls: controls.filter((item) => item.priority === 'P0').length,
      p1Controls: controls.filter((item) => item.priority === 'P1').length
    },
    controls,
    secretLanes,
    publicEnvRules: [
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY can be public when Supabase policies are correct.',
      'Never expose SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, DIRECT_URL, AUTH_SECRET, webhook secrets, private provider keys or alert webhooks.',
      'Never paste secrets into screenshots, support tickets, analytics events, client error payloads or AI prompts.',
      'Use separate test/live provider keys and label evidence clearly.'
    ],
    rotationRunbook: [
      { step: 'Inventory', owner: 'Developer/Ops', action: 'List all server, public, provider and webhook secrets with owner and environment.' },
      { step: 'Generate', owner: 'Owner', action: 'Create a new secret in the provider dashboard without deleting the old one first.' },
      { step: 'Deploy', owner: 'Developer', action: 'Update Vercel/Supabase envs, deploy, run quality:release and smoke P0 flows.' },
      { step: 'Verify', owner: 'QA/Admin', action: 'Confirm auth, payment, email, storage, cron and observability still work.' },
      { step: 'Revoke', owner: 'Security/Ops', action: 'Disable the old secret only after new secret evidence is saved.' },
      { step: 'Document', owner: 'Admin', action: 'Save masked screenshots, time, owner and affected services in launch evidence.' }
    ],
    leakResponse: [
      'Immediately revoke or disable leaked token/key in provider dashboard.',
      'Rotate dependent sessions/webhook secrets and invalidate active risky sessions if auth secret leaked.',
      'Search logs, repository, CI, screenshots and chat messages for the leaked value fingerprint.',
      'Review audit/error/payment/storage logs for suspicious access during exposure window.',
      'Create an incident record and save masked evidence before cleanup.'
    ],
    nextAction: blocked
      ? 'Fix blocked P0 secrets before running public auth/payment/storage tests.'
      : manualRequired
        ? 'Complete manual rotation, NEXT_PUBLIC boundary, least-privilege and leak-response evidence.'
        : 'Secrets readiness gates are complete for launch review.'
  }
}
