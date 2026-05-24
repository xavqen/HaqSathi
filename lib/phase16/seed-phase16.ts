export const playbookSeeds = [
  {
    slug: 'refund-follow-up-after-seven-days',
    title: 'Refund follow-up after 7 days',
    category: 'Refund',
    summary: 'Company ne refund promise kiya but paisa nahi aaya, to polite follow-up + evidence kaise bhejna hai.',
    steps: ['Order/transaction ID ready rakho', 'Refund promise screenshot attach karo', 'Short follow-up message bhejo', '24-48 hours response wait karo', 'No response ho to escalation draft banao'],
    disclaimer: 'Ye legal advice nahi hai. Official policy aur support response verify karein.'
  },
  {
    slug: 'upi-wrong-transfer-first-hour',
    title: 'UPI wrong transfer: first hour checklist',
    category: 'UPI',
    summary: 'Galat UPI transfer ke turant baad kya-kya save/report karna chahiye.',
    steps: ['Transaction ID save karo', 'Bank/app support ko immediately report karo', 'Receiver details/screenshot save karo', 'Fraud suspicion ho to emergency official channel use karo', 'Complaint number note karo'],
    disclaimer: 'Cyber fraud case me official emergency channel par turant report karein.'
  },
  {
    slug: 'scheme-application-rejected-next-steps',
    title: 'Scheme application rejected: next steps',
    category: 'Scheme',
    summary: 'Scholarship/scheme rejection ke baad reason, document gap aur appeal route kaise organize karein.',
    steps: ['Rejection reason screenshot save karo', 'Document mismatch check karo', 'Deadline verify karo', 'Correction/appeal option find karo', 'Department helpdesk message draft karo'],
    disclaimer: 'Eligibility final official portal/department ke rule se decide hoti hai.'
  }
]

export const learningSeeds = [
  {
    slug: 'how-to-write-strong-complaint',
    title: 'Strong complaint ka basic formula',
    category: 'Complaint',
    level: 'BASIC',
    durationMin: 6,
    content: { lessons: ['Facts short rakho', 'Evidence mention karo', 'Clear resolution demand karo', 'Deadline polite way me do'], action: 'Aaj apni complaint me order ID, date, amount aur desired resolution add karo.' }
  },
  {
    slug: 'evidence-before-escalation',
    title: 'Escalation se pehle evidence pack',
    category: 'Evidence',
    level: 'BASIC',
    durationMin: 5,
    content: { lessons: ['Screenshots', 'Payment proof', 'Support ticket number', 'Email/chat history'], action: 'Evidence pack page me ek case ka proof list save karo.' }
  },
  {
    slug: 'avoid-fake-government-links',
    title: 'Fake government links se kaise bachein',
    category: 'Safety',
    level: 'IMPORTANT',
    durationMin: 4,
    content: { lessons: ['Official domain verify karo', 'OTP kisi ko mat do', 'Payment demand pe suspicious raho', 'URL spelling check karo'], action: 'Official sources page se trusted resource save karo.' }
  }
]

export const experimentSeeds = [
  { key: 'homepage_primary_cta', name: 'Homepage primary CTA test', hypothesis: 'Complaint CTA ko Hinglish me rakhne se generator start rate badhega.', status: 'RUNNING', variants: [{ key: 'A', label: 'Generate Complaint' }, { key: 'B', label: 'Meri Complaint Banao' }], targetMetric: 'complaint_start_rate', rolloutPercent: 50 },
  { key: 'pricing_agent_highlight', name: 'Agent plan highlight', hypothesis: 'Cyber cafe use-case highlight karne se Agent plan clicks badhenge.', status: 'DRAFT', variants: [{ key: 'A', label: 'Normal pricing' }, { key: 'B', label: 'Agent card highlighted' }], targetMetric: 'checkout_click_rate', rolloutPercent: 0 }
]
