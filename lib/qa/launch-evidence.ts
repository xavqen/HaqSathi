export type LaunchGateStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type LaunchEvidenceGate = {
  area: string
  status: LaunchGateStatus
  owner: string
  commandOrCheck: string
  passCondition: string
  evidenceToSave: string
  productionNotes: string
}

function hasEnv(name: string) {
  const value = process.env[name]
  return Boolean(value && !/change-this|PROJECT_REF|YOUR-PASSWORD|haqsathi\.local|example/i.test(value))
}

export function getLaunchEvidenceGates(): LaunchEvidenceGate[] {
  return [
    {
      area: 'Build + TypeScript',
      status: 'READY_TO_TEST',
      owner: 'Developer',
      commandOrCheck: 'npm run db:generate && npm run typecheck && npm run build',
      passCondition: 'No Prisma client, TypeScript, route, or Next build error.',
      evidenceToSave: 'Terminal screenshot or CI logs from a clean install.',
      productionNotes: 'Run from a fresh folder, not only from a previously generated local cache.'
    },
    {
      area: 'Mobile/Desktop Playwright',
      status: 'READY_TO_TEST',
      owner: 'QA',
      commandOrCheck: 'npm run test:e2e:install && npm run test:e2e',
      passCondition: 'Home, tools, complaint and dashboard smoke flows pass at mobile and desktop viewport.',
      evidenceToSave: 'Playwright HTML report or terminal output.',
      productionNotes: 'Set E2E_BASE_URL to deployed Vercel URL for final launch QA.'
    },
    {
      area: 'Lighthouse Speed',
      status: 'READY_TO_TEST',
      owner: 'QA',
      commandOrCheck: 'LIGHTHOUSE_BASE_URL=https://your-domain.com npm run lighthouse:local',
      passCondition: 'No critical performance/accessibility/SEO regression on homepage and key tool pages.',
      evidenceToSave: 'Generated Lighthouse JSON/HTML output under artifacts/lighthouse.',
      productionNotes: 'Run only after Vercel deployment because local scores can hide CDN/cache issues.'
    },
    {
      area: 'Razorpay Subscription Lifecycle',
      status: hasEnv('RAZORPAY_KEY_ID') && hasEnv('RAZORPAY_KEY_SECRET') && hasEnv('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Founder/Admin',
      commandOrCheck: 'Create test checkout → pay → verify webhook → confirm plan upgrade and payment status.',
      passCondition: 'PaymentOrder becomes PAID/FAILED correctly and user plan changes only after valid signature.',
      evidenceToSave: 'Razorpay event ID, user email, DB payment row, webhook response log.',
      productionNotes: 'Use test mode first. Never mark paid from frontend-only callback without server verification.'
    },
    {
      area: 'Resend Email Delivery',
      status: hasEnv('RESEND_API_KEY') && hasEnv('RESEND_FROM_EMAIL') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Founder/Admin',
      commandOrCheck: 'Register, verify email, forgot password, reminder/test email.',
      passCondition: 'Inbox receives links, links expire/use once, EmailLog records status.',
      evidenceToSave: 'Inbox screenshot, EmailLog row, API response without dev links.',
      productionNotes: 'Use a verified sending domain before production launch.'
    },
    {
      area: 'Supabase Storage Vault',
      status: hasEnv('NEXT_PUBLIC_SUPABASE_URL') && hasEnv('SUPABASE_SERVICE_ROLE_KEY') && hasEnv('SUPABASE_STORAGE_BUCKET') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Developer',
      commandOrCheck: 'Open /api/document-vault/self-test after login/admin test or run upload/download from dashboard.',
      passCondition: 'Upload, list metadata, signed download and owner-only access work.',
      evidenceToSave: 'Self-test JSON, uploaded file row, signed URL access proof.',
      productionNotes: 'Bucket must stay private. Service role key must never be NEXT_PUBLIC.'
    },
    {
      area: 'Automated Official Link Monitor',
      status: hasEnv('CRON_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Vercel Cron → /api/cron/link-checks or run npm run link-checks:local.',
      passCondition: 'Reachability report is generated and DB link statuses update to VERIFIED, NEEDS_REVIEW or BROKEN.',
      evidenceToSave: 'Cron response JSON, local CSV/JSON report, screenshot from /admin/link-checks.',
      productionNotes: 'Automated link checks confirm reachability only. Manual content review is still required for deadlines, eligibility and filing instructions.'
    },
    {
      area: 'Official Link Verification',
      status: 'MANUAL_REQUIRED',
      owner: 'Content/Admin',
      commandOrCheck: 'Admin → Source Verification / Link Checks. Open every official URL and verify deep paths.',
      passCondition: 'Every public official link is marked VERIFIED or NEEDS_REVIEW with a note.',
      evidenceToSave: 'Verification date, reviewer name, source screenshot, notes for changed links.',
      productionNotes: 'Do not publish date/deadline-specific scheme claims without same-day official verification.'
    },
    {
      area: 'Translation Coverage',
      status: 'MANUAL_REQUIRED',
      owner: 'Content/Admin',
      commandOrCheck: 'Admin → Language Coverage and Localization. Review top 20 traffic pages first.',
      passCondition: 'Core shell + top tool pages are human-reviewed in priority languages.',
      evidenceToSave: 'Language coverage export, reviewer notes, before/after screenshots.',
      productionNotes: 'Machine translated text should be treated as draft until reviewed.'
    },
    {
      area: 'Security Headers + CSRF',
      status: 'READY_TO_TEST',
      owner: 'Developer',
      commandOrCheck: 'Open /admin/security-hardening and test POST requests with/without same-origin headers.',
      passCondition: 'Security hardening page passes and cross-origin unsafe writes are blocked.',
      evidenceToSave: 'Header screenshot, failed cross-origin request, successful same-origin request.',
      productionNotes: 'Recheck after domain/proxy changes.'
    },

    {
      area: 'Error Monitoring + Incident Triage',
      status: hasEnv('ERROR_MONITORING_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Open /api/system/heartbeat, trigger a safe test error, then review /admin/error-monitoring.',
      passCondition: 'Client errors are rate-limited, redacted, fingerprinted, logged and visible to admin without exposing secrets.',
      evidenceToSave: 'Heartbeat JSON, admin error-monitoring screenshot, local evidence from npm run error-monitor:local.',
      productionNotes: 'Keep CLIENT_ERROR_LOG_DRY_RUN=false only after privacy review. Optional webhook alerts can be connected later.'
    },

    {
      area: 'Backup + Restore Readiness',
      status: hasEnv('ADMIN_BACKUP_SECRET') && hasEnv('CRON_SECRET') && hasEnv('BACKUP_RESTORE_TEST_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Run npm run backups:readiness, then call /api/cron/backup-readiness on the deployed URL and perform a staging restore drill.',
      passCondition: 'Backup readiness JSON is generated, admin export is protected, Supabase backup exists, storage restore is tested and restore drill evidence is saved.',
      evidenceToSave: 'artifacts/backup-readiness JSON/CSV, cron response JSON, backup export filename/date, staging restore screenshots.',
      productionNotes: 'Do not trust backups until a restore drill has been completed successfully. Use Supabase managed backups as the primary source and app JSON export as secondary evidence.'
    },
    {
      area: 'Data Export + Deletion Readiness',
      status: hasEnv('PRIVACY_REVIEW_OWNER') && hasEnv('PRIVACY_EVIDENCE_DIR') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Admin/Privacy reviewer',
      commandOrCheck: 'Run npm run privacy:readiness, test /api/dashboard/export/data, submit a deletion request, then review /admin/privacy-ops.',
      passCondition: 'User export downloads, DataExport row is created, deletion request is recorded, admin review workflow is visible and privacy evidence is saved.',
      evidenceToSave: 'artifacts/privacy-ops JSON/CSV, export JSON screenshot, deletion request row, /admin/privacy-ops screenshot.',
      productionNotes: 'Deletion is intentionally manual-review first. Verify identity, payment/legal retention and support records before irreversible deletion.'
    },
    {
      area: '2FA + Passkey Readiness',
      status: hasEnv('ACCOUNT_SECURITY_ALERT_EMAIL') || hasEnv('ERROR_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Run npm run account-security:readiness, review /admin/account-security, then test /dashboard/security on mobile and desktop.',
      passCondition: '2FA rollout plan, backup codes, passkey domain validation, security event alerting and session review evidence are saved before enforcement.',
      evidenceToSave: 'artifacts/account-security JSON/CSV, admin page screenshot, user security page screenshot, test alert proof.',
      productionNotes: 'Keep TWO_FACTOR_ENFORCEMENT=optional or admin_only until recovery and backup-code flows are tested. Do not force passkeys before final HTTPS domain QA.'
    },
    {
      area: 'Document Vault Safety',
      status: hasEnv('NEXT_PUBLIC_SUPABASE_URL') && hasEnv('SUPABASE_SERVICE_ROLE_KEY') && hasEnv('SUPABASE_STORAGE_BUCKET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Run npm run vault-safety:readiness, upload safe PDF/image, then verify unsafe files are blocked before storage.',
      passCondition: 'Allowed files pass signature/MIME checks, unsafe extensions and mismatches are blocked, bucket remains private and signed URLs expire.',
      evidenceToSave: 'artifacts/document-vault-safety JSON/CSV, /admin/document-vault-safety screenshot, safe upload proof, blocked unsafe upload proof, Supabase private bucket screenshot.',
      productionNotes: 'Built-in safety scan blocks obvious unsafe files. Connect ClamAV/cloud malware scanner before high-volume document uploads or sensitive-scale launch.'
    },

    {
      area: 'Notification Readiness',
      status: hasEnv('RESEND_API_KEY') || hasEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || hasEnv('WHATSAPP_PROVIDER_API_KEY') || hasEnv('SMS_PROVIDER_API_KEY') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Run npm run notification:readiness, test email reminders, PWA install permission, WhatsApp/SMS dry-run, then review /admin/notification-readiness.',
      passCondition: 'Email, web push, WhatsApp/SMS channels are either tested or explicitly marked dry-run/manual before launch.',
      evidenceToSave: 'artifacts/notification-readiness JSON/CSV, admin readiness screenshot, device permission screenshot, email/WhatsApp/SMS test proof.',
      productionNotes: 'Keep NOTIFICATION_DRY_RUN=true until the deployed HTTPS domain, sender domain and provider quotas are verified.'
    },

    {
      area: 'Support Triage Readiness',
      status: hasEnv('SUPPORT_AGENT_OWNER') || hasEnv('SUPPORT_ESCALATION_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Support/Admin',
      commandOrCheck: 'Run npm run support:readiness, create guest + logged-in tickets, then review /admin/support-triage.',
      passCondition: 'Support owner, SLA, escalation path, privacy-safe reply rules and ticket triage evidence are saved before public traffic.',
      evidenceToSave: 'artifacts/support-triage JSON/CSV, /admin/support-triage screenshot, guest ticket proof, logged-in ticket proof, escalation test proof.',
      productionNotes: 'Keep SUPPORT_CHAT_MODE=ticket until third-party live chat privacy/cookie review is complete. Never ask users for OTPs, passwords or full identity/bank secrets.'
    },

    {
      area: 'Analytics Growth Readiness',
      status: hasEnv('NEXT_PUBLIC_GA_ID') || hasEnv('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') || hasEnv('NEXT_PUBLIC_POSTHOG_KEY') || process.env.NEXT_PUBLIC_FIRST_PARTY_ANALYTICS === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Growth/Admin',
      commandOrCheck: 'Run npm run analytics:readiness, verify cookie consent behavior, test first-party page_view event and check provider dashboard on deployed URL.',
      passCondition: 'No optional analytics fires before consent, first-party events are allowlisted/redacted, UTM campaign URL is captured safely and provider dashboard receives deployed-domain test data.',
      evidenceToSave: 'artifacts/analytics-readiness JSON/CSV, /admin/analytics-readiness screenshot, network tab consent proof, provider dashboard screenshot, UTM test screenshot.',
      productionNotes: 'Keep NEXT_PUBLIC_FIRST_PARTY_ANALYTICS=false and ANALYTICS_EVENT_API_ENABLED=false until privacy policy, consent banner and deployed-domain analytics QA pass. Never send complaint text, document data, phone/email/UPI/bank details or IDs into analytics.'
    },


    {
      area: 'Referral Growth Readiness',
      status: process.env.REFERRAL_PROGRAM_ENABLED === 'false' ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      owner: 'Growth/Admin',
      commandOrCheck: 'Run npm run referral:readiness, create a referral link, test signup/ref preservation, review /admin/referral-readiness and confirm fraud/reward controls.',
      passCondition: 'Referral creation, conversion tracking, reward disclosure, fraud review and evidence output are verified before public promotion.',
      evidenceToSave: 'artifacts/referral-growth JSON/CSV, /admin/referral-readiness screenshot, referral link test proof, conversion status proof, reward terms screenshot.',
      productionNotes: 'Keep REFERRAL_PAYOUT_MODE=bonus_usage and REFERRAL_FRAUD_REVIEW_REQUIRED=true for MVP. Cash payouts need KYC, tax, refund-abuse and anti-fraud review.'
    },


    {
      area: 'Newsletter Campaign Readiness',
      status: process.env.NEWSLETTER_DRY_RUN === 'false' && hasEnv('RESEND_API_KEY') && hasEnv('RESEND_FROM_EMAIL') && hasEnv('NEXT_PUBLIC_UNSUBSCRIBE_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Growth/Admin',
      commandOrCheck: 'Run npm run newsletter:readiness, subscribe from /newsletter, verify double opt-in, seed-list test and unsubscribe/preference URL on deployed domain.',
      passCondition: 'Newsletter opt-in, dry-run guard, consent, segment review, sender domain, seed-list test and unsubscribe evidence are saved before real campaigns.',
      evidenceToSave: 'artifacts/newsletter-readiness JSON/CSV, /admin/newsletter-readiness screenshot, inbox proof, provider dashboard screenshot, unsubscribe URL screenshot.',
      productionNotes: 'Keep NEWSLETTER_DRY_RUN=true until double opt-in, unsubscribe, sender reputation, copy review and segment review pass. Never send complaint text, document data, UPI/bank details or sensitive IDs in campaign payloads.'
    },




    {
      area: 'Rent Deposit Dispute Planner Readiness',
      status: process.env.RENT_DEPOSIT_PLANNER_MODE === 'enabled' && process.env.RENT_DEPOSIT_COPY_REVIEWED === 'true' && process.env.RENT_DEPOSIT_LEGAL_REVIEWED === 'true' && process.env.RENT_DEPOSIT_PRIVACY_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Support',
      commandOrCheck: 'Run npm run rent-deposit:readiness, test /tools/rent-deposit-dispute-planner on mobile and desktop, then review /admin/rent-deposit-readiness.',
      passCondition: 'Rent/deposit copy, proof checklist, guidance-only disclaimer, address/privacy warnings and mobile UX are reviewed before public launch.',
      evidenceToSave: 'artifacts/rent-deposit-readiness JSON/CSV, admin page screenshot, mobile tool screenshot, copy-ready message proof.',
      productionNotes: 'Keep RENT_DEPOSIT_PLANNER_MODE=local_only or dry_run until local legal guidance language and privacy redaction warnings are reviewed.'
    },
    {
      area: 'Voice Input Readiness',
      status: process.env.NEXT_PUBLIC_VOICE_INPUT_ENABLED === 'false' ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      owner: 'Product/QA',
      commandOrCheck: 'Run npm run voice:readiness, test /complaint voice input on Chrome Android and desktop Chrome, then verify unsupported-browser fallback.',
      passCondition: 'Voice input never auto-starts, transcript preview works, sensitive-data warning is visible, unsupported browsers fall back to typing and complaint generation still works.',
      evidenceToSave: 'artifacts/voice-input-readiness JSON/CSV, /admin/voice-input-readiness screenshot, Android Chrome voice screenshot, desktop voice screenshot, fallback screenshot.',
      productionNotes: 'Voice input uses browser speech recognition where available and must remain optional. Do not ask users to speak OTPs, passwords, full bank details or secret IDs.'
    },


    {
      area: 'Advanced Search Readiness',
      status: process.env.SEARCH_PROVIDER === 'algolia' || process.env.SEARCH_PROVIDER === 'meilisearch' ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      owner: 'Product/QA',
      commandOrCheck: 'Run npm run search:readiness, test /search with refund, UPI wrong transfer, income certificate and scheme queries, then verify /admin/search-readiness.',
      passCondition: 'Local search fallback works, hosted provider credentials are verified if selected, synonyms/typo plan is reviewed and no private complaint/document/support/user data is indexed.',
      evidenceToSave: 'artifacts/search-readiness JSON/CSV, /admin/search-readiness screenshot, search result screenshots, public-only index proof.',
      productionNotes: 'Keep SEARCH_PROVIDER=local and SEARCH_INDEX_DRY_RUN=true for MVP. Switch to Algolia or Meilisearch only after PII-safe index review and deployed-domain QA.'
    },

    {
      area: 'Application Status Tracking Readiness',
      status: process.env.STATUS_TRACKING_MODE === 'external' ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      owner: 'Product/QA',
      commandOrCheck: 'Run npm run status-tracking:readiness, test /dashboard/status-tracker on mobile/desktop, then review /admin/status-tracking.',
      passCondition: 'Users can track safe reference numbers and visible statuses without OTP/password/UPI PIN collection, unsafe scraping, or private data indexing.',
      evidenceToSave: 'artifacts/status-tracking JSON/CSV, /dashboard/status-tracker screenshot, /admin/status-tracking screenshot, one manual consumer/bank/UPI/scheme dry-run proof.',
      productionNotes: 'Keep STATUS_TRACKING_MODE=readiness and STATUS_TRACKING_DRY_RUN=true for MVP. External portal automation needs official API approval, privacy review and user consent.'
    },

    {
      area: 'Official Data Refresh Readiness',
      status: process.env.OFFICIAL_DATA_SYNC_MODE === 'auto_publish' && process.env.OFFICIAL_DATA_SYNC_DRY_RUN === 'false' ? 'BLOCKED' : 'READY_TO_TEST',
      owner: 'Content/QA',
      commandOrCheck: 'Run npm run official-data:readiness, open /admin/official-data-refresh, then run /api/cron/official-data-refresh in dry-run mode on deployed URL.',
      passCondition: 'Official sources, authorities, resources and link seeds have reviewer ownership, freshness SLA, domain allowlist and manual evidence before public copy changes.',
      evidenceToSave: 'artifacts/official-data-refresh JSON/CSV, /admin/official-data-refresh screenshot, cron dry-run JSON, source screenshots, reviewer/date proof.',
      productionNotes: 'Keep OFFICIAL_DATA_SYNC_MODE=readiness and OFFICIAL_DATA_SYNC_DRY_RUN=true for MVP. Do not auto-publish deadlines, eligibility, authority contacts or legal-style guidance without human review.'
    },


    {
      area: 'AI Quality Safety Readiness',
      status: process.env.AI_GUARDRAILS_MODE === 'off' ? 'BLOCKED' : 'READY_TO_TEST',
      owner: 'AI Safety/QA',
      commandOrCheck: 'Run npm run ai-safety:readiness, open /admin/ai-safety-readiness, review /admin/ai-reviews, then test one low-rating AI review.',
      passCondition: 'High-risk AI lanes have guardrails, PII masking, hallucination/source review, owner assignment and escalation rules before public scaling.',
      evidenceToSave: 'artifacts/ai-safety-readiness JSON/CSV, /admin/ai-safety-readiness screenshot, flagged output sample, reviewer/date proof.',
      productionNotes: 'Keep AI_GUARDRAILS_MODE=review for MVP. Do not mark AI outputs verified unless official source review and human QA evidence are saved.'
    },


    {
      area: 'Email Delivery Readiness',
      status: hasEnv('RESEND_API_KEY') && hasEnv('RESEND_FROM_EMAIL') && (process.env.EMAIL_DELIVERY_DKIM_VERIFIED === 'true' || process.env.EMAIL_DELIVERY_MODE === 'readiness') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Developer/Admin',
      commandOrCheck: 'Run npm run email:readiness, send /api/email/test from deployed domain, then verify signup verification and forgot-password inbox delivery.',
      passCondition: 'Resend key, verified sender, SPF/DKIM/DMARC evidence, test inbox delivery, EmailLog status and suppression/bounce review are saved.',
      evidenceToSave: 'artifacts/email-delivery JSON/CSV, /admin/email-delivery-readiness screenshot, real inbox screenshot, Resend DNS screenshot, EmailLog SENT/FAILED proof.',
      productionNotes: 'Keep EMAIL_DELIVERY_MODE=readiness and EMAIL_DELIVERY_DRY_RUN=true until verification, reset, receipt, reminder and newsletter lanes have real inbox proof.'
    },



    {
      area: 'Live Deployment QA Readiness',
      status: process.env.VERCEL_PRODUCTION_URL && process.env.PLAYWRIGHT_PRODUCTION_PASSED === 'true' && process.env.LIGHTHOUSE_PRODUCTION_PASSED === 'true' && process.env.MOBILE_VIEWPORT_QA_PASSED === 'true' && process.env.DESKTOP_VIEWPORT_QA_PASSED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/QA',
      commandOrCheck: 'Run npm run deployment:qa-readiness, open /admin/deployment-qa, then run Playwright and Lighthouse against VERCEL_PRODUCTION_URL.',
      passCondition: 'Production URL, Vercel build/runtime logs, mobile screenshots, desktop screenshots, Playwright report, Lighthouse report, cron dry-run and SEO indexing evidence are saved.',
      evidenceToSave: 'artifacts/deployment-qa JSON/CSV, /admin/deployment-qa screenshot, Vercel build log, runtime logs, Playwright report, Lighthouse report, mobile/desktop screenshots, sitemap/robots proof.',
      productionNotes: 'Do not send ads, SEO traffic or public launch announcements until deployed-domain QA evidence is saved. Localhost checks are not enough for final launch.'
    },



    {
      area: 'Launch Command Center',
      status: process.env.LAUNCH_FOUNDER_SIGNOFF === 'true' && process.env.LAUNCH_GO_NO_GO_COMPLETED === 'true' && process.env.LAUNCH_DEPLOYMENT_QA_APPROVED === 'true' && process.env.LAUNCH_ROLLBACK_OWNER && process.env.LAUNCH_INCIDENT_OWNER ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/QA',
      commandOrCheck: 'Run npm run launch:command-center, open /admin/launch-command-center, then close all P0/P1 launch actions before public traffic.',
      passCondition: 'Founder signoff, go/no-go decision, deployment evidence, rollback owner, incident owner and all launch evidence gates are reviewed in one final command center.',
      evidenceToSave: 'artifacts/launch-command-center JSON/CSV, /admin/launch-command-center screenshot, founder signoff proof, rollback owner proof, incident monitoring proof.',
      productionNotes: 'This is the final launch-control gate. Do not set LAUNCH_FOUNDER_SIGNOFF=true or LAUNCH_GO_NO_GO_COMPLETED=true until real deployed-domain evidence is saved.'
    },


    {
      area: 'Translation Review Readiness',
      status: process.env.TRANSLATION_HUMAN_REVIEW_REQUIRED === 'true' && process.env.TRANSLATION_REVIEW_OWNER && process.env.TRANSLATION_RTL_REVIEW_PASSED === 'true' && process.env.TRANSLATION_LEGAL_REVIEW_PASSED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Content/QA',
      commandOrCheck: 'Run npm run translation:readiness, open /admin/translation-review, then review P0 pages in priority languages with mobile and desktop screenshots.',
      passCondition: 'Priority launch languages, P0 pages, RTL layouts, legal/privacy copy and glossary-locked terms have human reviewer evidence before public scaling.',
      evidenceToSave: 'artifacts/translation-review JSON/CSV, /admin/translation-review screenshot, mobile/desktop screenshots for P0 pages, reviewer/date notes.',
      productionNotes: 'Machine translations are draft. Do not mark translation review complete until official warnings, OTP/PIN safety copy and legal/privacy pages are checked by a human.'
    },


    {
      area: 'SEO Indexing Readiness',
      status: hasEnv('NEXT_PUBLIC_APP_URL') && process.env.SEARCH_CONSOLE_PROPERTY_VERIFIED === 'true' && process.env.SEARCH_CONSOLE_SITEMAP_SUBMITTED === 'true' && process.env.ROBOTS_TXT_REVIEWED === 'true' && process.env.SEO_CANONICAL_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/SEO QA',
      commandOrCheck: 'Run npm run seo:indexing-readiness, open /admin/seo-indexing, submit sitemap in Search Console and inspect P0 routes on production URL.',
      passCondition: 'Production domain, Search Console ownership, sitemap success, robots review, canonical metadata and core URL inspection evidence are saved.',
      evidenceToSave: 'artifacts/seo-indexing JSON/CSV, /admin/seo-indexing screenshot, Search Console property screenshot, sitemap success screenshot, robots.txt screenshot, URL inspection proof.',
      productionNotes: 'Localhost SEO checks are not enough. Do not send SEO/ads/social traffic until Search Console and deployed-domain indexing evidence is saved.'
    },

    {
      area: 'Performance Readiness',
      status: process.env.PERFORMANCE_MOBILE_THROTTLE_REVIEWED === 'true' && process.env.PERFORMANCE_BUNDLE_REVIEWED === 'true' && process.env.PERFORMANCE_IMAGE_REVIEWED === 'true' && process.env.PERFORMANCE_FONT_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Performance QA',
      commandOrCheck: 'Run npm run performance:readiness, npm run lighthouse:local, open /admin/performance-readiness, then capture mobile and desktop production evidence.',
      passCondition: 'Core Web Vitals, Lighthouse budgets, low-end mobile behavior, route speed, bundle size, image/font delivery and third-party script inventory have saved evidence.',
      evidenceToSave: 'artifacts/performance-readiness JSON/CSV, Lighthouse report, /admin/performance-readiness screenshot, low-end Android screenshot/recording, desktop screenshot, bundle output proof.',
      productionNotes: 'Do not send SEO/ads/social traffic until mobile-first speed evidence is saved on the deployed domain. Localhost speed is not final proof.'
    },


    {
      area: 'PWA Offline Readiness',
      status: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true' && process.env.PWA_OFFLINE_FALLBACK_REVIEWED === 'true' && process.env.PWA_INSTALL_FLOW_REVIEWED === 'true' && process.env.PWA_UPDATE_FLOW_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Mobile QA',
      commandOrCheck: 'Run npm run pwa:readiness, open /admin/pwa-readiness, install the app on Android Chrome and desktop, then test offline fallback on deployed HTTPS domain.',
      passCondition: 'Manifest, icons, service worker, offline page, install flow, update flow and push-permission UX have saved real-device evidence.',
      evidenceToSave: 'artifacts/pwa-readiness JSON/CSV, /admin/pwa-readiness screenshot, Android install screenshot, desktop install screenshot, offline fallback screenshot, service worker cache screenshot.',
      productionNotes: 'Do not treat localhost PWA checks as final proof. Never cache API, private document vault files or authenticated user data in the service worker.'
    },


    {
      area: 'Legal Compliance Readiness',
      status: process.env.LEGAL_GUIDANCE_DISCLAIMER_REVIEWED === 'true' && process.env.LEGAL_PRIVACY_POLICY_REVIEWED === 'true' && process.env.LEGAL_TERMS_REVIEWED === 'true' && process.env.LEGAL_DPDP_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Legal reviewer',
      commandOrCheck: 'Run npm run legal:readiness, open /admin/legal-compliance-readiness, then review privacy, terms, disclaimer, pricing and high-risk tool copy on mobile and desktop.',
      passCondition: 'Guidance-only disclaimers, privacy behavior, terms/refund language, ads/affiliate disclosure, minor safety and high-risk tool claims are reviewed with saved evidence.',
      evidenceToSave: 'artifacts/legal-compliance JSON/CSV, /admin/legal-compliance-readiness screenshot, mobile/desktop screenshots for P0 pages, reviewer/date notes, copy approval diff.',
      productionNotes: 'Do not launch public ads or SEO traffic until the app avoids official-authority claims, guaranteed-outcome claims and secret-data requests, and privacy/terms copy matches real behavior.'
    },



    {
      area: 'Abuse Prevention Readiness',
      status: process.env.ABUSE_PROTECTION_MODE && (process.env.ABUSE_RATE_LIMIT_REVIEWED === 'true' || hasEnv('UPSTASH_REDIS_REST_URL')) && process.env.ABUSE_SECRET_REDACTION_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Security Ops',
      commandOrCheck: 'Run npm run abuse:readiness, open /admin/abuse-prevention, then test rate-limit, secret redaction, payment/upload/AI misuse and spam/referral/newsletter abuse cases.',
      passCondition: 'High-risk routes and APIs have throttling/redaction/safe-error evidence, payment/upload/AI abuse cases are reviewed, and escalation ownership is saved before public traffic.',
      evidenceToSave: 'artifacts/abuse-prevention JSON/CSV, /admin/abuse-prevention screenshot, 429/API proof, blocked secret-data screenshot, failed payment/webhook proof, unsafe upload proof, reviewer/date notes.',
      productionNotes: 'Keep ABUSE_PROTECTION_MODE=dry_run or monitor until false-positive risk is reviewed. Do not send public ads/referrals/signup traffic without abuse prevention evidence.'
    },

    {
      area: 'Data Retention Readiness',
      status: process.env.DATA_RETENTION_POLICY_REVIEWED === 'true' && process.env.DATA_RETENTION_HOLDS_REVIEWED === 'true' && process.env.DATA_RETENTION_EXPORT_DELETE_TESTED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Privacy/Ops/Admin',
      commandOrCheck: 'Run npm run retention:readiness, test export/delete request flow, review /admin/data-retention and confirm purge mode before launch.',
      passCondition: 'Retention matrix, deletion holds, audit-log redaction, export/delete evidence and backup alignment are reviewed before destructive purge automation is enabled.',
      evidenceToSave: 'artifacts/data-retention JSON/CSV, /admin/data-retention screenshot, export JSON proof, deletion decision proof, backup alignment note.',
      productionNotes: 'Keep DATA_RETENTION_PURGE_MODE=dry_run or manual_review for MVP. Do not auto-delete payment, refund, abuse, legal-hold or security audit records without human review.'
    },



    {
      area: 'Dependency Security Readiness',
      status: process.env.DEPENDENCY_LOCKFILE_REVIEWED === 'true' && process.env.DEPENDENCY_AUDIT_REVIEWED === 'true' && process.env.DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED === 'true' && process.env.DEPENDENCY_CI_INSTALL_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Security/Founder',
      commandOrCheck: 'Run npm run dependency:readiness, npm audit, npm run quality:release and save Vercel clean install/build logs after package changes.',
      passCondition: 'Lockfile drift, high/critical advisories, license obligations, package overrides, clean install and CI/Vercel build proof are reviewed before public launch.',
      evidenceToSave: 'artifacts/dependency-readiness JSON/CSV, dependency inventory CSV, npm audit output, license review notes, Vercel install/build screenshot and package-lock diff proof.',
      productionNotes: 'Do not ship runtime high/critical advisories, unreviewed license changes or major package upgrades without founder/security approval and rollback evidence.'
    },
    
    {
      area: 'Incident Response Readiness',
      status: process.env.INCIDENT_COMMANDER && (process.env.INCIDENT_ALERT_WEBHOOK_URL || process.env.INCIDENT_ALERT_EMAIL) && process.env.INCIDENT_ROLLBACK_DRILL_REVIEWED === 'true' && process.env.INCIDENT_EVIDENCE_PRESERVATION_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Ops/Security',
      commandOrCheck: 'Run npm run incident:readiness, review /admin/incident-response, send a test alert, run a rollback drill and save masked evidence before public traffic.',
      passCondition: 'Incident owner, alert channel, SEV map, rollback drill, status/support response, postmortem template and evidence preservation are reviewed for launch.',
      evidenceToSave: 'artifacts/incident-response JSON/CSV, /admin/incident-response screenshot, test alert proof, rollback drill screenshot, status/support macro proof and masked evidence folder sample.',
      productionNotes: 'Keep INCIDENT_RESPONSE_MODE=manual_review until on-call and rollback evidence are complete. During SEV0/SEV1, pause marketing traffic and preserve masked evidence before destructive fixes.'
    },


    {
      area: 'Final Vercel Deployment QA',
      status: 'MANUAL_REQUIRED',
      owner: 'Founder/Admin',
      commandOrCheck: 'Deploy to Vercel → run quality:release locally → run e2e/lighthouse against production URL.',
      passCondition: 'No critical error in Vercel logs, API routes, auth, storage, payment, email, mobile UI and SEO pages.',
      evidenceToSave: 'Vercel deployment URL, build log, e2e report, Lighthouse report, manual QA checklist.',
      productionNotes: 'Only after this gate should ads/SEO/marketing traffic be sent.'
    },

    {
      area: 'Payment Lifecycle Readiness',
      status: hasEnv('RAZORPAY_KEY_ID') && hasEnv('RAZORPAY_KEY_SECRET') && hasEnv('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'BLOCKED',
      owner: 'Founder/Finance',
      commandOrCheck: 'Run npm run payment:readiness, create sandbox checkout, test success/failure, replay webhook and review /admin/payment-lifecycle.',
      passCondition: 'Plan upgrades only after valid signature, invalid webhook is rejected, failed payment is marked failed, refund/cancel runbook is documented and receipt evidence is saved.',
      evidenceToSave: 'artifacts/payment-lifecycle JSON/CSV, /admin/payment-lifecycle screenshot, Razorpay sandbox event IDs, DB order screenshots, invalid signature 401 proof.',
      productionNotes: 'Keep PAYMENT_LIFECYCLE_MODE=readiness and PAYMENT_REFUND_MODE=manual_review until payment, refund, cancellation, invoice and webhook replay evidence is complete.'
    },

    {
      area: 'Mobile App Readiness',
      status: hasEnv('NEXT_PUBLIC_APP_URL') && (process.env.NATIVE_APP_STRATEGY === 'pwa_first' || hasEnv('ANDROID_PACKAGE_NAME') || hasEnv('IOS_BUNDLE_ID')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Product',
      commandOrCheck: 'Run npm run mobile-app:readiness, review /admin/mobile-app-readiness, then save Android/iOS/store evidence only after production web QA passes.',
      passCondition: 'PWA-first or native wrapper strategy is selected, production URL, app name, support/privacy URLs, permission prompts, store assets and mobile payment policy are reviewed.',
      evidenceToSave: 'artifacts/mobile-app-readiness JSON/CSV, /admin/mobile-app-readiness screenshot, Android install/build screenshot, iOS/TestFlight screenshot, store listing draft screenshots.',
      productionNotes: 'Do not submit a native wrapper before web launch QA, privacy policy, support route, payment policy and permission UX are verified on real devices.'
    },

    {
      area: 'Real Device QA Readiness',
      status: (process.env.ANDROID_CHROME_QA_REVIEWED === 'true' && process.env.DESKTOP_QA_REVIEWED === 'true') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/QA',
      commandOrCheck: 'Run npm run device-qa:readiness, open /admin/real-device-qa, then capture screenshots on Android, iPhone/Safari, tablet, laptop and wide desktop.',
      passCondition: 'P0 device routes have screenshots, bottom navigation and dropdowns are verified, bug reports include route/viewport/evidence and P0/P1 responsive issues are closed.',
      evidenceToSave: 'artifacts/real-device-qa JSON/CSV, /admin/real-device-qa screenshot, Android Chrome screenshots, iPhone Safari/BrowserStack proof, tablet proof, desktop dropdown proof, bug tracker screenshot.',
      productionNotes: 'Do not rely only on static responsive audits. Real devices can still break due to mobile browser chrome, keyboards, safe areas, long Hinglish text and sticky UI overlap.'
    },

    {
      area: 'Accessibility Readiness',
      status: process.env.ACCESSIBILITY_KEYBOARD_REVIEWED === 'true' && process.env.ACCESSIBILITY_FOCUS_REVIEWED === 'true' && process.env.ACCESSIBILITY_FORM_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/QA',
      commandOrCheck: 'Run npm run accessibility:readiness, open /admin/accessibility-readiness, then capture keyboard, focus, form, contrast and screen-reader evidence on the deployed URL.',
      passCondition: 'P0 routes pass keyboard navigation, visible focus, form label/error checks, readable contrast and basic screen-reader semantics before public launch.',
      evidenceToSave: 'artifacts/accessibility-readiness JSON/CSV, /admin/accessibility-readiness screenshot, keyboard walkthrough, mobile focus screenshots, Lighthouse/axe accessibility report, screen-reader smoke proof.',
      productionNotes: 'Do not launch only on visual responsive checks. Users using keyboard, low vision, screen readers or reduced motion still need the complaint, UPI, documents, tools and dashboard flows to work.'
    },

    {
      area: 'Audit Trail Readiness',
      status: process.env.AUDIT_TRAIL_P0_EVENTS_REVIEWED === 'true' && process.env.AUDIT_TRAIL_REDACTION_REVIEWED === 'true' && process.env.AUDIT_TRAIL_WRITE_PATH_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Security/Ops/Admin',
      commandOrCheck: 'Run npm run audit-trail:readiness, review /admin/audit-trail-readiness and save sample P0 audit rows from staging.',
      passCondition: 'Admin auth/RBAC, official-data/content edits, payments, privacy deletion/export, vault and support/incident actions have audit coverage and redaction evidence.',
      evidenceToSave: 'artifacts/audit-trail-readiness JSON/CSV, /admin/audit-trail-readiness screenshot, masked sample audit rows, alert proof and retention alignment note.',
      productionNotes: 'Keep AUDIT_TRAIL_MODE=log_only or dry_run until all P0 write paths are instrumented and redaction is verified. Never store OTPs, passwords, UPI PINs, CVV, tokens, signed URLs or raw document text in audit logs.'
    },
    
    {
      area: 'Database Integrity Readiness',
      status: hasEnv('DATABASE_URL') && hasEnv('DIRECT_URL') && process.env.DATABASE_SCHEMA_VALIDATE_REVIEWED === 'true' && process.env.DATABASE_MIGRATION_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Developer/Ops/Admin',
      commandOrCheck: 'Run npm run database:integrity-readiness, npm run prisma:validate, npm run db:generate and review /admin/database-integrity before production traffic.',
      passCondition: 'Production database URLs are configured, Prisma schema validates, staging migration/db push is tested, seed idempotency is reviewed, backups/restore and RLS/storage policies have evidence.',
      evidenceToSave: 'artifacts/database-integrity JSON/CSV, /admin/database-integrity screenshot, Prisma validate/generate logs, staging migration proof, restore drill proof and RLS/storage policy screenshots.',
      productionNotes: 'Keep DATABASE_INTEGRITY_MODE=dry_run/manual_review until migration, backup restore, seed and RLS evidence are complete. Never run destructive repair or seed actions on production without manual review.'
    },

    {
      area: 'Observability SLO Readiness',
      status: (process.env.OBSERVABILITY_SLO_REVIEWED === 'true' && process.env.OBSERVABILITY_DASHBOARD_REVIEWED === 'true' && (hasEnv('OBSERVABILITY_UPTIME_URL') || hasEnv('VERCEL_PRODUCTION_URL'))) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Ops/QA/Admin',
      commandOrCheck: 'Run npm run observability:readiness, open /admin/observability-slo, verify /api/system/heartbeat and save uptime, error, latency and alert drill evidence from the deployed URL.',
      passCondition: 'Production availability, API latency, error-rate, cron health and P0 business-flow SLOs have owner, dashboard, alert and saved evidence before public launch.',
      evidenceToSave: 'artifacts/observability-slo JSON/CSV, /admin/observability-slo screenshot, uptime probe screenshot, heartbeat JSON, error dashboard screenshot, alert drill proof and SLO checklist.',
      productionNotes: 'Keep OBSERVABILITY_MODE=manual_review until production URL probes, alert drill, dashboard and error-budget evidence are complete. Observability must not store OTPs, passwords, UPI PINs, CVV, raw documents or signed URLs.'
    },

    {
      area: 'Secrets Rotation Readiness',
      status: (process.env.SECRETS_PUBLIC_ENV_REVIEWED === 'true' && process.env.SECRETS_ROTATION_RUNBOOK_REVIEWED === 'true' && process.env.SECRETS_LEAK_RESPONSE_REVIEWED === 'true' && (hasEnv('AUTH_SECRET') || hasEnv('NEXTAUTH_SECRET'))) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Security/Ops/Admin',
      commandOrCheck: 'Run npm run secrets:readiness, review /admin/secrets-readiness, verify server-only env boundaries and save masked Vercel/Supabase/provider evidence before public traffic.',
      passCondition: 'Auth/session, database, service role, payment webhook, email/notification, cron/admin and alert secrets have owner, rotation plan, least-privilege review and leak-response evidence.',
      evidenceToSave: 'artifacts/secrets-readiness JSON/CSV, /admin/secrets-readiness screenshot, masked Vercel env screenshot, provider key scope screenshots, NEXT_PUBLIC boundary grep proof and rotation runbook signoff.',
      productionNotes: 'Never expose SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, DIRECT_URL, AUTH_SECRET, webhook secrets, provider private keys or alert webhooks under NEXT_PUBLIC or inside screenshots, tickets, analytics, error logs or AI prompts.'
    },

    {
      area: 'Feature Flags Kill Switch Readiness',
      status: process.env.FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED === 'true' && process.env.FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED === 'true' && process.env.FEATURE_FLAG_AUDIT_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Ops/Security',
      commandOrCheck: 'Run npm run feature-flags:readiness, review /admin/feature-flags-readiness, then test AI/payment/vault/notification/admin kill switches on staging.',
      passCondition: 'P0 flags have owners, safe default states, rollback drill evidence, audit trail coverage and fallback UX proof before public traffic.',
      evidenceToSave: 'artifacts/feature-flags-readiness JSON/CSV, /admin/feature-flags-readiness screenshot, disabled-state screenshots for AI/payments/vault/admin writes, rollback drill notes and audit sample.',
      productionNotes: 'Never make core complaint guidance dependent on payments, analytics, referrals, notifications, voice or experimental PWA behavior. During incidents, disable risky lanes first and preserve masked evidence.'
    },

    {
      area: 'Release Governance Readiness',
      status: process.env.RELEASE_NOTES_REVIEWED === 'true' && process.env.RELEASE_ROLLBACK_TARGET_REVIEWED === 'true' && process.env.RELEASE_QUALITY_COMMAND_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Founder/Product/Ops',
      commandOrCheck: 'Run npm run release-governance:readiness, review /admin/release-governance, save release notes, rollback target, deployment tag and post-release watch evidence.',
      passCondition: 'Every release has one version source of truth, release note, rollback target, quality evidence, owner signoff and watch-window plan before public traffic increases.',
      evidenceToSave: 'artifacts/release-governance JSON/CSV/MD, /admin/release-governance screenshot, quality:release terminal proof, previous known-good deploy/zip and post-release watch checklist.',
      productionNotes: 'Do not promote a release if the rollback target is unknown, quality output is missing, or P0 manual gates are unsigned. Freeze growth/admin writes first during uncertain release incidents.'
    },
    {
      area: 'Feedback Reviews Readiness',
      status: process.env.FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED === 'true' && process.env.FEEDBACK_PII_REDACTION_REVIEWED === 'true' && process.env.FEEDBACK_DEFAMATION_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Growth/Support/Legal',
      commandOrCheck: 'Run npm run feedback:readiness, review /admin/feedback-readiness, then save consent, redaction, unsafe-claim and takedown evidence before publishing testimonials.',
      passCondition: 'Raw feedback stays private by default, public reviews are approved-only, testimonial consent is recorded, sensitive data is redacted and takedown ownership is ready.',
      evidenceToSave: 'artifacts/feedback-readiness JSON/CSV/MD, /admin/feedback-readiness screenshot, sample approved testimonial, redaction before-after proof and takedown support macro.',
      productionNotes: 'Never publish OTPs, passwords, UPI PINs, CVV, bank/card data, complaint IDs, private document text, screenshots with personal data, or unverified defamatory claims as social proof.'
    },
    {
      area: 'AI Onboarding Assistant Readiness',
      status: process.env.ONBOARDING_P0_ROUTES_REVIEWED === 'true' && process.env.ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Support/QA',
      commandOrCheck: 'Run npm run onboarding:readiness, review /admin/onboarding-assistant, test /dashboard/onboarding on mobile and desktop, then save first-run route evidence.',
      passCondition: 'New users can set goal, language and state; see one recommended next action; understand sensitive-data warnings; and reach complaint, UPI, documents, schemes or tools without broken layout.',
      evidenceToSave: 'artifacts/onboarding-assistant-readiness JSON/CSV/MD, /admin/onboarding-assistant screenshot, /dashboard/onboarding mobile+desktop screenshots, route test proof and unsafe prompt review notes.',
      productionNotes: 'Keep onboarding in guided/manual_review mode until P0 routes and warnings are reviewed. Never ask for OTPs, passwords, UPI PINs, CVV, full bank/card data, private IDs or raw documents during first-run setup.'
    },
    {
      area: 'Subscription Entitlement Readiness',
      status: process.env.ENTITLEMENT_QUOTA_RULES_REVIEWED === 'true' && process.env.ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED === 'true' && process.env.ENTITLEMENT_WEBHOOK_SYNC_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Finance/Support',
      commandOrCheck: 'Run npm run entitlement:readiness, review /admin/entitlement-readiness, then test free limit, paid access, failed renewal, cancellation and read-only history behavior.',
      passCondition: 'Plan limits, server-side subscription state, downgrade behavior, paywall copy and admin/test bypass policy are reviewed before enforcing premium entitlements.',
      evidenceToSave: 'artifacts/entitlement-readiness JSON/CSV/MD, /admin/entitlement-readiness screenshot, free limit screenshot, paid allow screenshot, failed payment/downgrade proof and pricing/paywall screenshots.',
      productionNotes: 'Keep entitlement enforcement in dry_run/manual_review until Razorpay webhook and billing lifecycle evidence is saved. Never gate emergency, privacy, disclaimer, official source, support or billing receipt routes.'
    },
    {
      area: 'Invoice Tax Readiness',
      status: process.env.INVOICE_TAX_SELLER_PROFILE_REVIEWED === 'true' && process.env.INVOICE_TAX_NUMBERING_REVIEWED === 'true' && process.env.INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Finance/Product/Support',
      commandOrCheck: 'Run npm run invoice-tax:readiness, review /admin/invoice-tax-readiness, then test receipt, invoice, refund note and billing export behavior with masked payment evidence.',
      passCondition: 'Seller profile, receipt/invoice numbering, receipt template, refund/credit-note flow, GST/tax policy and billing document access controls are reviewed before paid production traffic.',
      evidenceToSave: 'artifacts/invoice-tax-readiness JSON/CSV/MD, /admin/invoice-tax-readiness screenshot, sample receipt, sample invoice, refund note proof, billing export safety proof and finance/legal signoff.',
      productionNotes: 'Keep invoice/tax mode in dry_run/manual_review until payment lifecycle and finance/legal evidence are complete. Never expose OTPs, UPI PINs, CVV, full card/bank data, webhook signatures, raw gateway payloads or signed vault URLs in billing documents.'
    },
    {
      area: 'Refund Dispute Readiness',
      status: process.env.REFUND_POLICY_REVIEWED === 'true' && process.env.CANCELLATION_FLOW_REVIEWED === 'true' && process.env.FAILED_PAYMENT_FLOW_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Finance/Support/Product',
      commandOrCheck: 'Run npm run refund-dispute:readiness, review /admin/refund-dispute-readiness, then test cancellation, refund, failed payment, duplicate payment and chargeback support behavior with masked evidence.',
      passCondition: 'Refund policy, cancellation flow, failed-payment behavior, duplicate-payment handling, chargeback response and billing support macros are reviewed before paid production traffic.',
      evidenceToSave: 'artifacts/refund-dispute-readiness JSON/CSV/MD, /admin/refund-dispute-readiness screenshot, refund test proof, cancellation proof, failed payment proof, duplicate payment proof and support macro signoff.',
      productionNotes: 'Keep refund/dispute mode in dry_run/manual_review until payment lifecycle, invoice/tax and support evidence are complete. Never ask for OTPs, UPI PINs, CVV, passwords, full card/bank details or raw private documents during billing support.'
    },
    {
      area: 'Payment Reconciliation Readiness',
      status: process.env.PAYMENT_RECON_DASHBOARD_REVIEWED === 'true' && process.env.PAYMENT_RECON_DB_MATCH_REVIEWED === 'true' && process.env.PAYMENT_RECON_INVOICE_MATCH_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Finance/Engineering/Admin',
      commandOrCheck: 'Run npm run payment-reconciliation:readiness, review /admin/payment-reconciliation, then match Razorpay payment/export evidence against DB orders, invoices, refunds and payout reports.',
      passCondition: 'Gateway payments, DB orders, subscriptions, receipts/invoices, refunds, payouts and anomaly reviews have masked evidence before paid public traffic grows.',
      evidenceToSave: 'artifacts/payment-reconciliation-readiness JSON/CSV/MD, /admin/payment-reconciliation screenshot, masked Razorpay dashboard/export proof, DB row proof, invoice total proof, refund/payout review proof and anomaly checklist.',
      productionNotes: 'Keep payment reconciliation in dry_run/manual_review until real payment lifecycle, invoice/tax, entitlement and refund evidence is complete. Never store OTPs, UPI PINs, CVV, passwords, webhook signatures, raw gateway payloads, full card/bank data or signed vault URLs in reconciliation artifacts.'
    },
    {
      area: 'Community Safety Alerts Readiness',
      status: process.env.COMMUNITY_SAFETY_INTAKE_REVIEWED === 'true' && process.env.COMMUNITY_SAFETY_MODERATION_REVIEWED === 'true' && process.env.COMMUNITY_SAFETY_REDACTION_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Support/Safety/Legal',
      commandOrCheck: 'Run npm run community-safety:readiness, test /safety-alerts report intake, review /admin/community-safety, then save moderation, redaction and official-source evidence.',
      passCondition: 'Community scam reports are collected only with sensitive-data warnings, rate limit, CSRF, redaction preview, human moderation and aggregated public alert policy.',
      evidenceToSave: 'artifacts/community-safety-readiness JSON/CSV/MD, /safety-alerts mobile+desktop screenshots, report API dry-run response, /admin/community-safety screenshot and redaction sample.',
      productionNotes: 'Keep COMMUNITY_SAFETY_REPORT_DRY_RUN=true and COMMUNITY_SAFETY_ALERTS_MODE=dry_run/manual_review until moderation and legal review pass. Never publish raw reports, OTPs, UPI PINs, CVV, phone numbers, UPI IDs, private names, live scam links or unverified accusations.'
    },
    {
      area: 'Document Expiry Planner Readiness',
      status: process.env.DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED === 'true' && process.env.DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED === 'true' && process.env.DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Content/Support',
      commandOrCheck: 'Run npm run document-expiry:readiness, test /tools/document-expiry-planner on mobile and desktop, then review /admin/document-expiry-readiness.',
      passCondition: 'Document expiry planner works with document type + date only, shows official-only route warnings, creates renewal reminder dates and avoids collecting sensitive ID/bank secrets.',
      evidenceToSave: 'artifacts/document-expiry-readiness JSON/CSV/MD, /tools/document-expiry-planner mobile+desktop screenshots, generated plan screenshot and /admin/document-expiry-readiness screenshot.',
      productionNotes: 'Keep DOCUMENT_EXPIRY_PLANNER_MODE=local_only/dry_run until official route copy, translations, privacy wording and reminder delivery consent are reviewed. Never ask for OTPs, passwords, UPI PINs, CVV, Aadhaar/PAN numbers, full card/bank details or raw document scans.'
    },
    {
      area: 'Call Visit Logbook Readiness',
      status: process.env.CALL_LOGBOOK_PRIVACY_COPY_REVIEWED === 'true' && process.env.CALL_LOGBOOK_MOBILE_QA_REVIEWED === 'true' && process.env.CALL_LOGBOOK_ESCALATION_COPY_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Support/Safety',
      commandOrCheck: 'Run npm run call-logbook:readiness, test /tools/call-visit-logbook on mobile and desktop, then review /admin/call-logbook-readiness.',
      passCondition: 'Call and visit logs capture factual interaction details, show secret-data warnings, generate safe follow-up messages and remain usable on mobile.',
      evidenceToSave: 'artifacts/call-logbook-readiness JSON/CSV/MD, /tools/call-visit-logbook mobile+desktop screenshots, generated log screenshot, copied message proof and /admin/call-logbook-readiness screenshot.',
      productionNotes: 'Keep CALL_LOGBOOK_MODE=local_only/dry_run until privacy copy, export/copy behavior, translations and escalation tone are reviewed. Never store OTPs, passwords, UPI PINs, CVV, full card/bank details, full Aadhaar/PAN, private addresses or raw document scans in interaction logs.'
    },
    {
      area: 'Proof File Organizer Readiness',
      status: process.env.PROOF_FILE_REDACTION_REVIEWED === 'true' && process.env.PROOF_FILE_NAMING_REVIEWED === 'true' && process.env.PROOF_FILE_MOBILE_QA_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Support/Privacy',
      commandOrCheck: 'Run npm run proof-file-organizer:readiness, test /tools/proof-file-organizer on mobile and desktop, then review /admin/proof-file-organizer-readiness.',
      passCondition: 'Proof folder names, redaction warnings, missing proof logic and copy-ready proof index are reviewed for safe complaint submission packs.',
      evidenceToSave: 'artifacts/proof-file-organizer-readiness JSON/CSV/MD, /tools/proof-file-organizer mobile+desktop screenshots, generated organizer screenshot, copied proof index proof and /admin/proof-file-organizer-readiness screenshot.',
      productionNotes: 'Keep PROOF_FILE_ORGANIZER_MODE=local_only/dry_run until safe naming, redaction, translation and mobile QA are complete. Never store or share OTPs, passwords, UPI PINs, CVV, full card/bank details, full Aadhaar/PAN, private addresses or raw document scans in public proof packs.'
    },
    
    {
      area: 'Deadline Appeal Planner Readiness',
      status: process.env.DEADLINE_APPEAL_COPY_REVIEWED === 'true' && process.env.DEADLINE_APPEAL_LEGAL_REVIEWED === 'true' && process.env.DEADLINE_APPEAL_MOBILE_QA_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Support/Legal',
      commandOrCheck: 'Run npm run deadline-appeal:readiness, test /tools/deadline-appeal-planner on mobile and desktop, then review /admin/deadline-appeal-readiness.',
      passCondition: 'Deadline estimates, official-verification warnings, appeal copy, proof checklist and mobile timeline layout are reviewed before public launch.',
      evidenceToSave: 'artifacts/deadline-appeal-readiness JSON/CSV/MD, /tools/deadline-appeal-planner mobile+desktop screenshots, generated deadline plan screenshot, copied appeal proof and /admin/deadline-appeal-readiness screenshot.',
      productionNotes: 'Keep DEADLINE_APPEAL_PLANNER_MODE=local_only/dry_run until copy, legal/guidance disclaimer, translation and mobile QA are complete. Exact appeal or limitation dates must be verified from official portal, notice, order or expert where needed.'
    },



    {
      area: 'Warranty Claim Planner Readiness',
      status: 'READY_TO_TEST',
      owner: 'Product + Support',
      commandOrCheck: 'npm run warranty-claim:readiness',
      passCondition: 'Warranty claim copy, proof checklist, service-center safety and mobile QA evidence are reviewed.',
      evidenceToSave: 'artifacts/warranty-claim-readiness/warranty-claim-readiness.json and service-center checklist.',
      productionNotes: 'Keep warranty outcome language factual; never request OTP/password/PIN/device secrets.'
    },



    {
      area: 'Utility Bill Dispute Planner Readiness',
      status: 'READY_TO_TEST',
      owner: 'Product/Support/QA',
      commandOrCheck: 'Run npm run utility-bill:readiness, test /tools/utility-bill-dispute-planner on mobile, then review /admin/utility-bill-readiness.',
      passCondition: 'Bill dispute copy, meter/payment proof checklist, official provider route and secret-data warnings are reviewed before public promotion.',
      evidenceToSave: 'artifacts/utility-bill-readiness JSON/CSV, /tools/utility-bill-dispute-planner screenshot, /admin/utility-bill-readiness screenshot, sample bill dispute message proof.',
      productionNotes: 'Bill due dates and disconnection risk are planning guidance only. Users must verify official provider bill/policy and never share OTP, UPI PIN, CVV, passwords or screen-sharing access for corrections/refunds.'
    },

    {
      area: 'Return Pickup Planner Readiness',
      status: 'READY_TO_TEST',
      owner: 'Product/QA',
      commandOrCheck: 'Run npm run return-pickup:readiness, test /tools/return-pickup-planner on mobile, then review /admin/return-pickup-readiness.',
      passCondition: 'Return/refund copy, pickup proof checklist, refund scam warnings and mobile copy action are reviewed before public promotion.',
      evidenceToSave: 'artifacts/return-pickup-readiness JSON/CSV, /tools/return-pickup-planner screenshot, /admin/return-pickup-readiness screenshot, mobile form proof.',
      productionNotes: 'Return deadline is a planning estimate only. Users must verify official marketplace policy and never share OTP, UPI PIN, CVV, passwords or screen-sharing access for refunds.'
    },


    {
      area: 'Insurance Claim Planner Readiness',
      status: process.env.INSURANCE_CLAIM_PLANNER_MODE === 'enabled' && process.env.INSURANCE_CLAIM_COPY_REVIEWED === 'true' && process.env.INSURANCE_CLAIM_SECRET_WARNING_REVIEWED === 'true' && process.env.INSURANCE_CLAIM_PRIVACY_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Support',
      commandOrCheck: 'Run npm run insurance-claim:readiness, test /tools/insurance-claim-planner on mobile and desktop, then review /admin/insurance-claim-readiness.',
      passCondition: 'Insurance claim copy, proof checklist, official-channel guidance, secret warnings and mobile UX are reviewed before public promotion.',
      evidenceToSave: 'artifacts/insurance-claim-readiness JSON/CSV, admin page screenshot, mobile tool screenshot, copy-ready claim message proof.',
      productionNotes: 'Keep INSURANCE_CLAIM_PLANNER_MODE=local_only or dry_run until claim copy, privacy redaction and official-channel safety warnings are reviewed.'
    },


    {
      area: 'Loan App Harassment Planner Readiness',
      status: process.env.LOAN_APP_PLANNER_MODE === 'enabled' && process.env.LOAN_APP_COPY_REVIEWED === 'true' && process.env.LOAN_APP_SAFETY_REVIEWED === 'true' && process.env.LOAN_APP_PRIVACY_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Safety',
      commandOrCheck: 'Run npm run loan-app:readiness, test /tools/loan-app-harassment-planner on mobile and desktop, then review /admin/loan-app-readiness.',
      passCondition: 'Threat safety copy, proof checklist, official-channel guidance, secret warnings and mobile UX are reviewed before public promotion.',
      evidenceToSave: 'artifacts/loan-app-readiness JSON/CSV, admin page screenshot, mobile tool screenshot, copy-ready loan app message proof.',
      productionNotes: 'Keep LOAN_APP_PLANNER_MODE=local_only or dry_run until harassment copy, emergency guidance, privacy redaction and official-channel safety warnings are reviewed.'
    },


    {
      area: 'Job Salary Dispute Planner Readiness',
      status: process.env.JOB_SALARY_PLANNER_MODE === 'enabled' && process.env.JOB_SALARY_COPY_REVIEWED === 'true' && process.env.JOB_SALARY_SCAM_SAFETY_REVIEWED === 'true' && process.env.JOB_SALARY_PRIVACY_REVIEWED === 'true' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      owner: 'Product/Safety',
      commandOrCheck: 'Run npm run job-salary:readiness, test /tools/job-salary-dispute-planner on mobile and desktop, then review /admin/job-salary-readiness.',
      passCondition: 'Salary/job scam copy, proof checklist, official-channel guidance, scam warnings and mobile UX are reviewed before public promotion.',
      evidenceToSave: 'artifacts/job-salary-readiness JSON/CSV, admin page screenshot, mobile tool screenshot, copy-ready job salary message proof.',
      productionNotes: 'Keep JOB_SALARY_PLANNER_MODE=local_only or dry_run until salary copy, job fee scam warnings, privacy redaction and official-channel safety warnings are reviewed.'
    },


    {
      area: 'Education Form Correction Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Student safety',
      commandOrCheck: 'npm run education-form:readiness, then review /admin/education-form-readiness and /tools/education-form-correction-planner.',
      passCondition: 'Correction copy, official route warnings, deadline wording, privacy redaction and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/education-form-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample correction request.',
      productionNotes: 'This tool is guidance only. It must not promise correction, admission, scholarship, admit card, certificate approval or deadline extension.'
    },

    {
      area: 'Travel Refund Cancellation Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Payments safety',
      commandOrCheck: 'npm run travel-refund:readiness, then review /admin/travel-refund-readiness and /tools/travel-refund-cancellation-planner.',
      passCondition: 'Refund/cancellation copy, provider-policy wording, payment secret safety, travel document privacy and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/travel-refund-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample refund message.',
      productionNotes: 'This tool is guidance only. It must not promise refund, compensation, chargeback, fee reversal or provider approval.'
    },

    {
      area: 'Medical Bill Dispute Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Healthcare billing safety',
      commandOrCheck: 'npm run medical-bill:readiness, then review /admin/medical-bill-readiness and /tools/medical-bill-dispute-planner.',
      passCondition: 'Billing copy, medical disclaimer, health/payment privacy, insurance/TPA wording and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/medical-bill-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample billing message.',
      productionNotes: 'This tool is guidance only. It must not provide medical/legal/insurance advice, promise refund or ask for excessive medical or payment secrets.'
    },

    {
      area: 'Telecom SIM Complaint Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Telecom safety',
      commandOrCheck: 'npm run telecom-sim:readiness, then review /admin/telecom-sim-readiness and /tools/telecom-sim-complaint-planner.',
      passCondition: 'Recharge/bill/SIM/porting/KYC copy, OTP/SIM secret warnings, official-route wording and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/telecom-sim-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample telecom message.',
      productionNotes: 'This tool is guidance only. It must not promise refund, activation, porting approval, bill reversal or regulatory outcome and must never ask for OTP/SIM swap code/UPI PIN/CVV/password.'
    },

    {
      area: 'Courier Parcel Dispute Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Courier safety',
      commandOrCheck: 'npm run courier-parcel:readiness, then review /admin/courier-parcel-readiness and /tools/courier-parcel-dispute-planner.',
      passCondition: 'Lost/damaged/delivered/pickup/scam copy, proof privacy warnings, official-route wording and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/courier-parcel-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample courier message.',
      productionNotes: 'This tool is guidance only. It must not promise refund, replacement, delivery, trace success or compensation and must never ask for OTP/payment secrets/full address/full ID.'
    },

    {
      area: 'Bank Account Freeze Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Banking safety',
      commandOrCheck: 'npm run bank-freeze:readiness, then review /admin/bank-freeze-readiness and /tools/bank-account-freeze-planner.',
      passCondition: 'Freeze/lien/KYC/UPI/wrong-debit copy, banking secret warnings, official route wording and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/bank-freeze-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample bank freeze message.',
      productionNotes: 'This tool is guidance only. It must not promise unfreeze, refund, reversal or regulatory outcome and must never ask for OTP/UPI PIN/CVV/password/full account or card details.'
    },

    {
      area: 'Vehicle Challan Dispute Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Transport safety',
      commandOrCheck: 'npm run vehicle-challan:readiness, then review /admin/vehicle-challan-readiness and /tools/vehicle-challan-dispute-planner.',
      passCondition: 'Wrong/duplicate/paid/towing/vehicle-sold challan copy, official route wording, payment-link safety and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/vehicle-challan-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample vehicle challan message.',
      productionNotes: 'This tool is guidance only. It must not guarantee challan cancellation/refund/penalty removal and must warn against random payment links, agents, OTP, UPI PIN, CVV, password and remote access.'
    },

    {
      area: 'Identity Document Correction Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Document safety',
      commandOrCheck: 'npm run identity-document:readiness, then review /admin/identity-document-readiness and /tools/identity-document-correction-planner.',
      passCondition: 'Aadhaar/PAN/passport/voter/DL/certificate/bank KYC correction copy, official route wording, identity data safety and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/identity-document-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample identity correction message.',
      productionNotes: 'This tool is guidance only. It must not guarantee correction approval and must warn against agents, random links, OTP, passwords, full ID numbers, QR/barcodes, CVV, UPI PIN and remote access.'
    },

    {
      area: 'Lost Document Report Planner Readiness',
      status: 'MANUAL_REQUIRED',
      owner: 'Product/Identity safety',
      commandOrCheck: 'npm run lost-document:readiness, then review /admin/lost-document-readiness and /tools/lost-document-report-planner.',
      passCondition: 'Lost Aadhaar/PAN/passport/DL/bank/SIM/certificate report copy, official route wording, identity misuse warnings and mobile QA are reviewed.',
      evidenceToSave: 'artifacts/lost-document-readiness JSON/CSV, admin screenshot, mobile tool screenshot and sample lost document message.',
      productionNotes: 'This tool is guidance only. It must not guarantee police report, duplicate approval, recovery or faster authority action and must never ask for OTP/password/full ID/QR/barcode/CVV/UPI PIN/remote access.'
    },
  ]
}

export function getLaunchEvidenceSummary() {
  const gates = getLaunchEvidenceGates()
  return {
    total: gates.length,
    pass: gates.filter((gate) => gate.status === 'PASS').length,
    readyToTest: gates.filter((gate) => gate.status === 'READY_TO_TEST').length,
    manualRequired: gates.filter((gate) => gate.status === 'MANUAL_REQUIRED').length,
    blocked: gates.filter((gate) => gate.status === 'BLOCKED').length,
    gates
  }
}
