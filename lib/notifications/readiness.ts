export type NotificationReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type NotificationChannelReadiness = {
  id: string
  label: string
  status: NotificationReadinessStatus
  userValue: string
  adminValue: string
  launchNote: string
}

function env(name: string) {
  return process.env[name] || ''
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost-only|haqsathi\.local/i.test(value))
}

export function getNotificationReadinessChannels(): NotificationChannelReadiness[] {
  const dryRun = enabled('NOTIFICATION_DRY_RUN') || !env('NOTIFICATION_DRY_RUN')
  const pwaEnabled = enabled('NEXT_PUBLIC_ENABLE_PWA')
  const vapidConfigured = configured('NEXT_PUBLIC_VAPID_PUBLIC_KEY') && configured('VAPID_PRIVATE_KEY') && configured('VAPID_SUBJECT')
  const emailConfigured = configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL')
  const whatsappConfigured = configured('WHATSAPP_PROVIDER_API_KEY') && configured('WHATSAPP_PROVIDER_URL')
  const smsConfigured = configured('SMS_PROVIDER_API_KEY') && configured('SMS_PROVIDER_URL')
  const ownerConfigured = configured('NOTIFICATION_ALERT_OWNER')

  return [
    {
      id: 'notification-dry-run-control',
      label: 'Dry-run launch control',
      status: dryRun ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      userValue: dryRun ? 'Notification providers are protected from accidental live sends.' : 'Live notification sending can be tested.',
      adminValue: `NOTIFICATION_DRY_RUN=${dryRun ? 'true' : 'false'}`,
      launchNote: 'Keep dry-run enabled until every provider has a saved test evidence screenshot.'
    },
    {
      id: 'email-reminders',
      label: 'Email reminders',
      status: emailConfigured ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'Users should receive complaint follow-up and account emails in inbox.',
      adminValue: emailConfigured ? 'Resend API key and sender are configured.' : 'RESEND_API_KEY or RESEND_FROM_EMAIL is missing.',
      launchNote: 'Verify sender domain, inbox delivery and spam placement before sending marketing traffic.'
    },
    {
      id: 'pwa-web-push',
      label: 'PWA web push readiness',
      status: pwaEnabled && vapidConfigured ? 'READY_TO_TEST' : pwaEnabled ? 'MANUAL_REQUIRED' : 'BLOCKED',
      userValue: 'Installed app users can be prepared for reminder push notifications.',
      adminValue: pwaEnabled ? (vapidConfigured ? 'PWA and VAPID envs are configured.' : 'PWA is enabled but VAPID keys are missing.') : 'PWA is disabled.',
      launchNote: 'Push permissions must be tested on deployed HTTPS domain, Android Chrome and desktop Chrome.'
    },
    {
      id: 'whatsapp-alerts',
      label: 'WhatsApp alert provider',
      status: whatsappConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Optional WhatsApp reminders can be added for urgent case follow-ups.',
      adminValue: whatsappConfigured ? 'WhatsApp provider key and URL are configured.' : 'WhatsApp provider envs are not configured.',
      launchNote: 'Use approved templates only. Do not send legal/financial sensitive details in WhatsApp body.'
    },
    {
      id: 'sms-alerts',
      label: 'SMS alert provider',
      status: smsConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Optional SMS fallback can notify users when email/push fails.',
      adminValue: smsConfigured ? 'SMS provider key and URL are configured.' : 'SMS provider envs are not configured.',
      launchNote: 'Keep SMS messages short, consent-based and avoid private complaint details.'
    },
    {
      id: 'notification-owner',
      label: 'Notification operations owner',
      status: ownerConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'A responsible reviewer should monitor failed sends and provider limits.',
      adminValue: ownerConfigured ? `Owner: ${env('NOTIFICATION_ALERT_OWNER')}` : 'NOTIFICATION_ALERT_OWNER is empty.',
      launchNote: 'Assign one owner before public launch so failures do not remain invisible.'
    },
    {
      id: 'channel-consent-policy',
      label: 'Consent and privacy policy',
      status: 'MANUAL_REQUIRED',
      userValue: 'Users should control which channels they receive notifications on.',
      adminValue: 'Consent UI exists through privacy operations; channel-level enforcement needs final QA.',
      launchNote: 'Do not enable WhatsApp/SMS defaults without explicit user consent and unsubscribe path.'
    }
  ]
}

export function getNotificationReadinessReport() {
  const channels = getNotificationReadinessChannels()
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.21-notification-readiness',
    dryRun: enabled('NOTIFICATION_DRY_RUN') || !env('NOTIFICATION_DRY_RUN'),
    summary: {
      total: channels.length,
      ready: channels.filter((channel) => channel.status === 'PASS' || channel.status === 'READY_TO_TEST').length,
      manualRequired: channels.filter((channel) => channel.status === 'MANUAL_REQUIRED').length,
      blocked: channels.filter((channel) => channel.status === 'BLOCKED').length
    },
    channels,
    minimumEvidence: [
      'Email reminder test received in real inbox',
      'PWA install + notification permission screenshot from mobile Chrome',
      'VAPID keys stored only in env, never hardcoded in client source',
      'WhatsApp/SMS provider dry-run or sandbox response screenshot',
      'Failed-send monitoring screenshot from /admin/notifications',
      'Admin readiness screenshot from /admin/notification-readiness'
    ],
    safeLaunchRules: [
      'Keep NOTIFICATION_DRY_RUN=true until provider tests are saved.',
      'Never include OTP, password, full Aadhaar/PAN, bank account or private complaint evidence in push/SMS/WhatsApp text.',
      'Send only reminder titles and dashboard links for sensitive cases.',
      'Respect privacy consent before enabling WhatsApp or SMS.'
    ]
  }
}
