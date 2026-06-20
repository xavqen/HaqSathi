export const complaintTypes = [
  'Refund not received',
  'Defective product',
  'Wrong item delivered',
  'Bank debit issue',
  'UPI wrong transfer',
  'UPI fraud',
  'Mobile recharge failed',
  'Electricity bill issue',
  'Delivery scam',
  'Education fee refund',
  'Travel booking refund',
  'Insurance claim delay'
] as const

export const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Start karne ke liye basic tools',
    features: ['3 complaint drafts/month', 'Basic checklist', 'Basic scheme search']
  },
  {
    name: 'Pro',
    price: '₹99/month',
    description: 'Regular users ke liye',
    features: ['Unlimited drafts', 'PDF download ready', 'Save history', 'Follow-up reminders']
  },
  {
    name: 'Family',
    price: '₹299/month',
    description: 'Family documents aur complaints',
    features: ['5 family profiles', 'Shared family document vault (Aadhaar, PAN, certificates) — coming soon', 'Priority templates']
  },
  {
    name: 'Agent',
    price: '₹999/month',
    description: 'Cyber cafe/local service agents',
    features: ['Multiple client cases', 'Agent dashboard', 'Export reports']
  }
]

export const trustPoints = [
  'Official authority nahi hai — guidance tool hai',
  'Cyber fraud me official emergency channels ko priority do',
  'AI links hallucinate nahi karega; official portal verify karna zaroori hai',
  'Simple Hinglish drafts with copy/share actions'
]


export const upiIssues = [
  'Wrong UPI transfer',
  'UPI fraud/scam',
  'Money deducted but not received',
  'Merchant payment failed',
  'Bank not responding'
] as const

export const documentTypes = [
  'Income certificate',
  'Caste certificate',
  'Domicile certificate',
  'Ration card',
  'PAN correction',
  'Aadhaar update',
  'Ayushman card',
  'Scholarship application',
  'School admission',
  'College admission',
  'Pension application',
  'Bank KYC',
  'Passport basics'
] as const

export const indianStates = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'
] as const

export const schemePurposes = ['Scholarship', 'Health', 'Pension', 'Business loan', 'Farming', 'Housing', 'Job seeker support', 'Women support'] as const
