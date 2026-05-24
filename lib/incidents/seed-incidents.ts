export const incidentReportSeeds = [
  { title: 'Production payment not tested yet', severity: 'MEDIUM', status: 'OPEN', impact: 'Paid plan upgrade should remain disabled until sandbox/live test passes.', rootCause: 'Launch QA pending.', actionItems: ['Set Razorpay keys', 'Create test order', 'Verify signature', 'Confirm plan update'] },
  { title: 'Official links need monthly verification', severity: 'LOW', status: 'OPEN', impact: 'Users may see stale official resource guidance if links change.', rootCause: 'Government portals change URLs and forms.', actionItems: ['Review official sources monthly', 'Mark broken links', 'Update guides'] }
]
