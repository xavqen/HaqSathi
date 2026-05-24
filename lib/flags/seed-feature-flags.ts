export const featureFlagSeeds = [
  { key: 'agent-client-workspace', name: 'Agent client workspace', description: 'Enable cyber cafe/local agent client handling features.', status: 'ENABLED', audience: ['AGENT', 'ADMIN'], rolloutPercent: 100 },
  { key: 'ai-safety-review', name: 'AI safety review', description: 'Route low confidence AI outputs to admin review queue.', status: 'INTERNAL', audience: ['ADMIN'], rolloutPercent: 0 },
  { key: 'public-success-stories', name: 'Public success stories', description: 'Show anonymous educational outcomes for SEO/trust.', status: 'ENABLED', audience: ['PUBLIC'], rolloutPercent: 100 },
  { key: 'live-payments', name: 'Live payments', description: 'Enable production Razorpay checkout after final testing.', status: 'DISABLED', audience: ['PRODUCTION'], rolloutPercent: 0 }
]
