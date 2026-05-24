export const CONSENT_TYPES = [
  { key: 'EMAIL_REMINDERS', label: 'Email reminders', help: 'Complaint follow-up aur document expiry reminders email par bhejne ki permission.' },
  { key: 'PRODUCT_UPDATES', label: 'Product updates', help: 'Naye tools, pricing aur feature update messages.' },
  { key: 'ANALYTICS', label: 'Basic analytics', help: 'App improve karne ke liye non-sensitive usage signals.' },
  { key: 'AI_HISTORY', label: 'AI history save', help: 'Dashboard me generated drafts aur chat history save karne ki permission.' }
] as const

export type ConsentType = typeof CONSENT_TYPES[number]['key']
