export type FinalQaStatus = 'CODE_READY' | 'READY_TO_RUN' | 'MANUAL_EVIDENCE_REQUIRED'

export type FinalQaItem = {
  id: string
  pillar: string
  status: FinalQaStatus
  command: string
  evidence: string
  failureRisk: string
}

export const finalQaMatrix: FinalQaItem[] = [
  {
    id: 'quality-release-build',
    pillar: 'Clean scalable code architecture',
    status: 'READY_TO_RUN',
    command: 'npm install && npm run quality:release && npm run build',
    evidence: 'Terminal screenshot/log with all audits and Next build passing on the same ZIP that is deployed.',
    failureRisk: 'A stale audit or TypeScript/build error can reach Vercel even if feature routes look fine locally.'
  },
  {
    id: 'full-project-code-scan',
    pillar: 'Full project code integrity',
    status: 'READY_TO_RUN',
    command: 'npm run scan:full',
    evidence: 'artifacts/code-scan/full-project-code-scan.json showing zero blocking issues for imports, literal links, API fetches, env coverage, setup-route exposure and contact persistence.',
    failureRisk: 'A missing import, exposed setup route, false-success API response or undocumented env can slip past visual QA and break production only after deployment.'
  },
  {
    id: 'deep-project-code-scan',
    pillar: 'Deep code safety scan',
    status: 'READY_TO_RUN',
    command: 'npm run scan:complete',
    evidence: 'artifacts/code-scan/deep-project-code-scan.json plus full-project-code-scan.json showing zero blocking issues across imports, scripts, user-facing dev-copy leaks, password-reset dev links, seed secret logs, client env boundaries, public assets and SEO title suffixes.',
    failureRisk: 'A release can pass feature audits but still leak local-dev copy, expose reset tokens during email misconfiguration, print seed passwords, reference broken scripts or ship duplicate title suffixes.'
  },
  {
    id: 'live-route-smoke',
    pillar: 'Production reliability',
    status: 'READY_TO_RUN',
    command: 'LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa',
    evidence: 'artifacts/live-launch-qa/live-launch-qa-report.json with zero blockers for public routes, SEO titles, fraud blocks and prompt-leak checks.',
    failureRisk: 'Live deployment can serve wrong env/cached pages even when local code is correct.'
  },
  {
    id: 'payment-storage-live-check',
    pillar: 'Backend maintenance readiness',
    status: 'READY_TO_RUN',
    command: 'npm run launch:payment-storage-check',
    evidence: 'artifacts/live-launch-qa/payment-storage-readiness.json showing Razorpay, Supabase storage and webhook config are present and masked.',
    failureRisk: 'Paid users or document vault users can fail after launch due to missing env keys, unsafe public secrets or bucket misconfiguration.'
  },
  {
    id: 'lighthouse-core-web-vitals',
    pillar: 'Performance / Core Web Vitals',
    status: 'READY_TO_RUN',
    command: 'LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch',
    evidence: 'Mobile + desktop Lighthouse HTML reports saved under artifacts/lighthouse for home, tools, complaint, UPI help and pricing.',
    failureRisk: 'Slow first load, layout shifts or SEO/accessibility regressions can hurt conversion and indexing.'
  },
  {
    id: 'playwright-public-e2e',
    pillar: 'Smart professional frontend',
    status: 'READY_TO_RUN',
    command: 'PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e',
    evidence: 'Playwright report/screenshots showing no horizontal overflow, correct SEO titles, public legal pages and fraud escalation visibility.',
    failureRisk: 'Mobile UI, title tags, critical public copy or navigation can break only in the browser.'
  },
  {
    id: 'ai-and-ocr-live-keys',
    pillar: 'Seamless AI workflows',
    status: 'MANUAL_EVIDENCE_REQUIRED',
    command: 'Use /complaint, /chat and /tools/ocr-autofill on production with test-safe data only.',
    evidence: 'Screenshots of a complaint draft, chat response and OCR output showing redaction, safe disclaimers and no OTP/PIN/CVV leakage.',
    failureRisk: 'Fallback mode may hide broken real AI keys, or live prompts may produce unsafe output without redaction evidence.'
  },
  {
    id: 'vercel-final-env',
    pillar: 'Security + production reliability',
    status: 'MANUAL_EVIDENCE_REQUIRED',
    command: 'Open Vercel project → Settings → Environment Variables and compare against .env.example.',
    evidence: 'Masked screenshot/checklist for production-only env values: AUTH_SECRET, DB, Supabase, Razorpay, Resend, AI and Upstash.',
    failureRisk: 'A missing or preview-only variable can break auth, payment, storage, email or rate-limits only after deploy.'
  },

  {
    id: 'launch-artifact-integrity',
    pillar: 'Production evidence integrity',
    status: 'READY_TO_RUN',
    command: 'npm run launch:artifact-manifest',
    evidence: 'artifacts/live-launch-qa/launch-artifact-manifest.json and CSV with SHA-256 hashes for QA, payment/storage, Lighthouse, Playwright and final evidence files.',
    failureRisk: 'Without artifact hashes and secret scanning, screenshots/reports can be mixed from different runs or shared with leaked secrets.'
  },

  {
    id: 'production-ops-snapshot',
    pillar: 'Production operations readiness',
    status: 'READY_TO_RUN',
    command: 'OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot',
    evidence: 'artifacts/live-launch-qa/production-ops-snapshot.json and CSV showing /api/health, /api/ready, /status and /launch-readiness status, latency, cache headers and blockers.',
    failureRisk: 'A site can pass build and still be operationally unsafe if readiness, DB connectivity or health cache headers fail after deploy.'
  },

  {
    id: 'incident-rollback-runbook',
    pillar: 'Incident response and rollback readiness',
    status: 'READY_TO_RUN',
    command: 'npm run launch:rollback-drill',
    evidence: 'artifacts/live-launch-qa/rollback-drill.json and CSV showing last known-good deployment, owners, backup confirmation, rollback test and maintenance notice readiness.',
    failureRisk: 'A failed production deploy can become a long outage if no owner, backup, rollback target or maintenance message is ready.'
  },

  {
    id: 'postlaunch-support-gate',
    pillar: 'Post-launch support and abuse readiness',
    status: 'READY_TO_RUN',
    command: 'POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support',
    evidence: 'artifacts/live-launch-qa/postlaunch-support-check.json and CSV showing support email, contact page, urgent abuse lane, safe reply macros and first-24h review ownership.',
    failureRisk: 'Users can hit payment, login, fraud or document-vault problems after launch without a tested human support path.'
  },

  {
    id: 'final-deploy-package',
    pillar: 'Final deploy package integrity',
    status: 'READY_TO_RUN',
    command: 'npm run launch:final-ready',
    evidence: 'artifacts/final-deploy/final-deploy-ready-check.json showing version sync, pinned dependencies, patched lockfile, safe dev-link defaults and final deploy files.',
    failureRisk: 'A final ZIP can look complete but still ship an out-of-sync lockfile, unsafe local-dev verification links, stale service-worker cache or unpinned dependency updates.'
  },
  {
    id: 'final-evidence-gate',
    pillar: 'Final go/no-go evidence gate',
    status: 'READY_TO_RUN',
    command: 'npm run launch:evidence-gate',
    evidence: 'artifacts/live-launch-qa/final-evidence-gate.json and CSV showing GO only after live QA, payment/storage, Lighthouse, Playwright, owners and manual approvals are complete.',
    failureRisk: 'Without a final no-go gate, you can accidentally launch with missing production artifacts, untested payment/storage, or no rollback owner.'
  }
]

export function getFinalQaMatrix() {
  return finalQaMatrix
}
