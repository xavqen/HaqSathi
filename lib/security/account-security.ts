export type AccountSecurityStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type SecurityFactor = {
  id: string
  label: string
  type: 'passkey' | 'totp' | 'backup_code' | 'email' | 'session' | 'risk'
  userValue: string
  adminValue: string
  status: AccountSecurityStatus
  launchNote: string
}

export type SecurityRolloutStep = {
  step: string
  owner: string
  status: AccountSecurityStatus
  evidence: string
  action: string
}

function env(name: string) {
  return process.env[name] || ''
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost-only/i.test(value))
}

export function getAccountSecurityFactors(): SecurityFactor[] {
  const passkeysEnabled = enabled('PASSKEYS_ENABLED')
  const twoFactorMode = env('TWO_FACTOR_ENFORCEMENT') || 'optional'
  const backupCodesEnabled = enabled('BACKUP_CODES_ENABLED')
  const sessionReviewEnabled = enabled('SESSION_REVIEW_ENABLED')
  const riskAlertsConfigured = configured('ACCOUNT_SECURITY_ALERT_EMAIL') || configured('ERROR_ALERT_WEBHOOK_URL')

  return [
    {
      id: 'passkeys',
      label: 'Passkeys / WebAuthn',
      type: 'passkey',
      userValue: passkeysEnabled ? 'Can be shown as beta security option' : 'Hidden until browser + domain QA passes',
      adminValue: 'Requires HTTPS production domain, RP ID check and recovery fallback.',
      status: passkeysEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      launchNote: 'Do not force passkeys until login recovery and multi-device testing are complete.'
    },
    {
      id: 'totp',
      label: 'Authenticator app 2FA',
      type: 'totp',
      userValue: twoFactorMode === 'required' ? 'Required for admins' : 'Optional rollout recommended first',
      adminValue: `Current enforcement mode: ${twoFactorMode}`,
      status: ['optional', 'admin_only', 'required'].includes(twoFactorMode) ? 'READY_TO_TEST' : 'BLOCKED',
      launchNote: 'Start with admin-only enforcement before requiring it for all users.'
    },
    {
      id: 'backup-codes',
      label: 'Backup recovery codes',
      type: 'backup_code',
      userValue: backupCodesEnabled ? 'Recovery code UX can be tested' : 'Needs rollout switch before live use',
      adminValue: 'Every 2FA user needs one-time backup codes stored hashed, never plain text.',
      status: backupCodesEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      launchNote: '2FA should not be enabled without backup codes and support recovery workflow.'
    },
    {
      id: 'email-verification',
      label: 'Email verification gate',
      type: 'email',
      userValue: 'Already present as account trust layer',
      adminValue: 'Verify Resend delivery and token expiry in production.',
      status: configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      launchNote: 'Use real inbox evidence before public launch.'
    },
    {
      id: 'session-review',
      label: 'Session review',
      type: 'session',
      userValue: 'Security page shows active sessions and account activity',
      adminValue: sessionReviewEnabled ? 'Session review enabled' : 'Enable production review switch after QA',
      status: sessionReviewEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      launchNote: 'Add revoke-all-sessions after testing DB/session cleanup on real accounts.'
    },
    {
      id: 'risk-alerts',
      label: 'Risk alerts',
      type: 'risk',
      userValue: 'Suspicious login/change alerts can be connected',
      adminValue: riskAlertsConfigured ? 'Alert channel configured' : 'No account security alert channel set',
      status: riskAlertsConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      launchNote: 'Send email/webhook alerts for admin login, password reset and security setting changes.'
    }
  ]
}

export function getAccountSecurityReadinessReport() {
  const factors = getAccountSecurityFactors()
  const rollout: SecurityRolloutStep[] = [
    {
      step: 'Admin-only 2FA pilot',
      owner: 'Founder/Admin',
      status: env('TWO_FACTOR_ENFORCEMENT') === 'admin_only' || env('TWO_FACTOR_ENFORCEMENT') === 'required' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      evidence: 'Admin login test, recovery test, support recovery note.',
      action: 'Enable TWO_FACTOR_ENFORCEMENT=admin_only before forcing any public user.'
    },
    {
      step: 'Passkey domain validation',
      owner: 'Developer',
      status: enabled('PASSKEYS_ENABLED') && configured('PASSKEY_RP_ID') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      evidence: 'Chrome Android, desktop Chrome and Safari-compatible browser screenshots on production HTTPS domain.',
      action: 'Set PASSKEY_RP_ID to the production root domain only after Vercel domain is final.'
    },
    {
      step: 'Recovery fallback',
      owner: 'Support/Admin',
      status: enabled('BACKUP_CODES_ENABLED') ? 'READY_TO_TEST' : 'BLOCKED',
      evidence: 'Backup code generate/download/use-once test evidence.',
      action: 'Keep backup codes disabled for users until hashed storage and one-time usage are verified.'
    },
    {
      step: 'Security event alerts',
      owner: 'Ops/Admin',
      status: configured('ACCOUNT_SECURITY_ALERT_EMAIL') || configured('ERROR_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      evidence: 'Alert received for login/password-reset/security-change test event.',
      action: 'Set ACCOUNT_SECURITY_ALERT_EMAIL or ERROR_ALERT_WEBHOOK_URL for production alerting.'
    }
  ]

  const ready = factors.filter((factor) => factor.status === 'PASS' || factor.status === 'READY_TO_TEST').length
  const manual = factors.filter((factor) => factor.status === 'MANUAL_REQUIRED').length
  const blocked = factors.filter((factor) => factor.status === 'BLOCKED').length

  return {
    version: '3.0.19-account-security-readiness',
    generatedAt: new Date().toISOString(),
    mode: env('ACCOUNT_SECURITY_MODE') || 'readiness',
    enforcement: env('TWO_FACTOR_ENFORCEMENT') || 'optional',
    passkeysEnabled: enabled('PASSKEYS_ENABLED'),
    backupCodesEnabled: enabled('BACKUP_CODES_ENABLED'),
    sessionReviewEnabled: enabled('SESSION_REVIEW_ENABLED'),
    summary: {
      totalFactors: factors.length,
      ready,
      manualRequired: manual,
      blocked,
      launchStatus: blocked > 0 ? 'NEEDS_SECURITY_WORK' : manual > 0 ? 'READY_FOR_MANUAL_QA' : 'READY_TO_TEST'
    },
    factors,
    rollout,
    minimumEvidence: [
      'Admin account 2FA setup and recovery screenshot',
      'Backup code generate + use-once proof',
      'Passkey HTTPS domain test on mobile and desktop, if enabled',
      'Security event alert delivery proof',
      'Session review screenshot from /dashboard/security',
      'Admin readiness screenshot from /admin/account-security'
    ]
  }
}
