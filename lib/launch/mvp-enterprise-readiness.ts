export type MvpReadinessPillar = {
  title: string
  status: 'Implemented' | 'Ready to test' | 'Needs live QA'
  summary: string
  evidence: string[]
}

export function getMvpEnterpriseReadiness(): MvpReadinessPillar[] {
  return [
    {
      title: 'Smart + professional frontend',
      status: 'Implemented',
      summary: 'Mobile-first shell, polished public pages, motion-safe interactions, install prompts and trust/legal copy are in place.',
      evidence: ['phase110-113 motion audits', 'phase122 public content SEO fixpack', 'public Playwright smoke routes']
    },
    {
      title: 'Seamless AI workflows',
      status: 'Implemented',
      summary: 'Complaint, chat, UPI, OCR and scheme workflows now use safer prompts, language preference, fallback drafts and official-fraud escalation.',
      evidence: ['language-aware complaint generation', 'AI safety review metadata', 'OCR redaction and fraud next-steps']
    },
    {
      title: 'Performance / Core Web Vitals',
      status: 'Ready to test',
      summary: 'Performance regression scan blocks heavy motion/cache mistakes. Lighthouse and Playwright commands are wired for local and Vercel QA.',
      evidence: ['npm run perf:regression-scan', 'npm run lighthouse:local', 'npm run test:e2e']
    },
    {
      title: 'Security + production reliability',
      status: 'Ready to test',
      summary: 'Global API origin guard, CSRF helper, Upstash-compatible rate limits, document-vault safety scan, secret redaction and signed downloads are installed.',
      evidence: ['phase121 API origin guard', 'rateLimitAsync on AI/contact/translation routes', 'document vault safety controls']
    },
    {
      title: 'Clean scalable architecture',
      status: 'Implemented',
      summary: 'Official scheme catalog, fraud escalation constants, AI safety helper and MVP readiness metadata are centralized instead of duplicated in pages/routes.',
      evidence: ['lib/official-schemes/catalog.ts', 'lib/safety/fraud-escalation.ts', 'lib/ai/safety.ts', 'lib/launch/mvp-enterprise-readiness.ts']
    },
    {
      title: 'Final launch QA',
      status: 'Needs live QA',
      summary: 'Live Vercel checks still require real production env keys, payment sandbox/live evidence, Supabase bucket test, email test and Lighthouse report.',
      evidence: ['npm run quality:release', 'npm run build', 'npm run deployment:qa-readiness', 'Vercel production smoke test']
    }
  ]
}
