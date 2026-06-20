export type PostLaunchSupportItem = {
  id: string
  title: string
  owner: string
  command: string
  evidence: string
  launchRule: string
}

export const postLaunchSupportChecklist: PostLaunchSupportItem[] = [
  {
    id: 'contact-support-intake',
    title: 'Public contact and support intake',
    owner: 'Support owner',
    command: 'POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support',
    evidence: 'postlaunch-support-check.json records /contact reachability, support email visibility and contact/ticket readiness controls.',
    launchRule: 'Do not run paid traffic until users have a tested path to ask for help.'
  },
  {
    id: 'urgent-abuse-escalation',
    title: 'Urgent fraud/abuse escalation lane',
    owner: 'Abuse review owner',
    command: 'Set LAUNCH_ABUSE_REVIEW_OWNER and LAUNCH_ABUSE_REPORT_FLOW_TESTED=true after review.',
    evidence: 'Support intake can classify fraud, payment, login and vault issues as urgent support tickets without exposing secrets.',
    launchRule: 'UPI fraud, payment failure, account access and document-vault reports need same-day human review.'
  },
  {
    id: 'support-macro-review',
    title: 'Safe support macro review',
    owner: 'Founder / support owner',
    command: 'Set LAUNCH_SUPPORT_MACROS_REVIEWED=true after checking reply templates.',
    evidence: 'Macros remind users not to share OTP/PIN/CVV/passwords and avoid legal/financial outcome guarantees.',
    launchRule: 'Every reply must stay guidance-only and privacy-safe.'
  },
  {
    id: 'first-24h-review',
    title: 'First 24h post-launch review',
    owner: 'Launch owner',
    command: 'Set LAUNCH_FIRST_24H_REVIEW_CONFIRMED=true when a real person is watching support after launch.',
    evidence: 'Named owner, response SLA and review window are recorded in postlaunch-support-check.json.',
    launchRule: 'Public launch needs someone watching early fraud/payment/login failures.'
  }
]

export function getPostLaunchSupportChecklist() {
  return postLaunchSupportChecklist
}
