export const productionQaSeeds = [
  {
    area: 'Mobile UX', device: 'Android 360x800', browser: 'Chrome', status: 'WARNING',
    checklist: ['Homepage visible above fold', 'Form inputs usable', 'CTA thumb friendly', 'Dashboard sidebar scrolls'],
    issues: ['Manual real-device pass required before launch']
  },
  {
    area: 'Payment', device: 'Desktop', browser: 'Chrome', status: 'NOT_TESTED',
    checklist: ['Razorpay key set', 'Signature verify passes', 'Plan upgrades after payment'],
    issues: ['Needs live/sandbox Razorpay order test']
  },
  {
    area: 'Storage', device: 'Desktop', browser: 'Chrome', status: 'NOT_TESTED',
    checklist: ['Bucket exists', 'Upload works', 'Signed URL works', 'Private docs are not public'],
    issues: ['Needs Supabase service role key and bucket policy check']
  }
]
