import type { SchemeInput } from '@/lib/validators/scheme'

export type OfficialSchemeRecord = {
  slug: string
  name: string
  state: 'All India' | string
  purposes: string[]
  profiles: string[]
  officialUrl: string
  authority: string
  why: string
  documents: string[]
  applySteps: string[]
  freshness: string
}

export const officialSchemeCatalog: OfficialSchemeRecord[] = [
  {
    slug: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    state: 'All India',
    purposes: ['Farming'],
    profiles: ['farmer', 'agriculture', 'kisan'],
    officialUrl: 'https://pmkisan.gov.in/',
    authority: 'Ministry of Agriculture & Farmers Welfare',
    why: 'Central farmer-income support route to verify for eligible farmer families.',
    documents: ['Aadhaar', 'bank account', 'land/farmer details as required', 'mobile number'],
    applySteps: ['Open the official PM-KISAN portal', 'Check farmer registration/e-KYC/status options', 'Verify land and bank details before submission', 'Save acknowledgement/status screenshot'],
    freshness: 'Official portal URL verified in June 2026; scheme rules must still be checked on portal.'
  },
  {
    slug: 'national-scholarship-portal',
    name: 'National Scholarship Portal',
    state: 'All India',
    purposes: ['Scholarship'],
    profiles: ['student', 'school', 'college', 'scholarship'],
    officialUrl: 'https://scholarships.gov.in/',
    authority: 'Government of India scholarship portal',
    why: 'Common portal for central/state scholarship discovery and applications.',
    documents: ['Aadhaar/OTR where applicable', 'marksheet', 'bank details', 'income/caste certificate if applicable', 'bonafide/fee receipt'],
    applySteps: ['Create/check OTR as required', 'Search eligible scholarship by class/category/state', 'Upload clear documents', 'Track institute/district/state verification status'],
    freshness: 'Official portal URL verified in June 2026; deadlines change every session.'
  },
  {
    slug: 'ayushman-bharat-pmjay',
    name: 'Ayushman Bharat PM-JAY',
    state: 'All India',
    purposes: ['Health'],
    profiles: ['family', 'health', 'hospital', 'medical'],
    officialUrl: 'https://pmjay.gov.in/',
    authority: 'National Health Authority',
    why: 'Health cover eligibility and hospital-network route to verify for eligible families.',
    documents: ['Aadhaar/family ID as required', 'mobile number', 'ration/family proof if required', 'hospital documents for treatment cases'],
    applySteps: ['Check eligibility on official PM-JAY/NHA channels', 'Verify beneficiary/family details', 'Use empanelled hospital route if eligible', 'Keep treatment and approval papers safely'],
    freshness: 'Official portal URL verified in June 2026; eligibility is database/portal dependent.'
  },
  {
    slug: 'pmay-g',
    name: 'Pradhan Mantri Awaas Yojana - Gramin',
    state: 'All India',
    purposes: ['Housing'],
    profiles: ['rural', 'housing', 'awas', 'home'],
    officialUrl: 'https://pmayg.dord.gov.in/',
    authority: 'Ministry of Rural Development',
    why: 'Rural housing assistance route to verify through official PMAY-G/state/local body process.',
    documents: ['Aadhaar', 'bank account', 'residence proof', 'land/household details as required', 'SECC/Awaas+ status where applicable'],
    applySteps: ['Check official PMAY-G portal/status', 'Verify local panchayat/block route', 'Keep survey/beneficiary status proof', 'Avoid agents asking for unofficial fees'],
    freshness: 'Official portal URL verified in June 2026; survey and beneficiary rules change by notification.'
  },
  {
    slug: 'e-shram',
    name: 'e-Shram',
    state: 'All India',
    purposes: ['Job seeker support', 'Business loan', 'Women support'],
    profiles: ['worker', 'labour', 'unorganised', 'gig', 'daily wage'],
    officialUrl: 'https://eshram.gov.in/',
    authority: 'Ministry of Labour & Employment',
    why: 'National database/registration route for unorganised workers and linked welfare information.',
    documents: ['Aadhaar', 'mobile linked with Aadhaar if required', 'bank account', 'occupation details'],
    applySteps: ['Use only the official e-Shram portal or authorized CSC', 'Do not install APKs from WhatsApp links', 'Verify mobile/Aadhaar and bank details carefully', 'Save UAN/e-Shram card safely'],
    freshness: 'Official portal URL verified in June 2026; linked benefits vary by scheme/state.'
  },
  {
    slug: 'jan-suraksha-insurance',
    name: 'Jan Suraksha Insurance Schemes',
    state: 'All India',
    purposes: ['Pension', 'Health', 'Women support'],
    profiles: ['bank account', 'insurance', 'low income', 'family'],
    officialUrl: 'https://jansuraksha.gov.in/',
    authority: 'Department of Financial Services, Ministry of Finance',
    why: 'Official route for PMJJBY/PMSBY/APY information, forms, rules and bank-led enrolment guidance.',
    documents: ['bank account', 'Aadhaar/KYC as required by bank', 'nominee details', 'mobile number'],
    applySteps: ['Read rules/forms on official Jan Suraksha portal', 'Apply through your bank/official digital route', 'Check premium, nominee and renewal details', 'Save certificate/acknowledgement'],
    freshness: 'Official portal URL verified in June 2026; premium/cover rules can change by notification.'
  }
]

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function matchOfficialSchemes(input: SchemeInput, limit = 3) {
  const haystack = normalize(`${input.purpose} ${input.profile} ${input.educationLevel || ''} ${input.category || ''} ${input.state}`)
  const scored = officialSchemeCatalog.map((scheme) => {
    let score = 0
    if (scheme.state === 'All India' || scheme.state === input.state) score += 2
    if (scheme.purposes.includes(input.purpose)) score += 5
    for (const profile of scheme.profiles) if (haystack.includes(normalize(profile))) score += 2
    if (input.purpose === 'Scholarship' && /student|school|college|class|scholarship/.test(haystack)) score += 2
    return { scheme, score }
  })
  return scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((item) => item.scheme)
}
