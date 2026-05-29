import { cookies } from 'next/headers'
import { normalizeLanguageCode, type AppLanguageCode } from '@/lib/i18n/languages'

type PageHeroCopy = {
  kicker: string
  title: string
  description: string
  primaryCta?: string
  secondaryCta?: string
}

type CorePageKey = 'complaint' | 'upi' | 'scheme' | 'documents' | 'refund' | 'pricing' | 'login' | 'register'

type CorePageCopy = Record<CorePageKey, PageHeroCopy>

const english: CorePageCopy = {
  complaint: {
    kicker: 'Free AI tool',
    title: 'AI Complaint Generator',
    description: 'Choose a complaint type, add basic details, and generate copy-ready email, support chat and follow-up drafts.'
  },
  upi: {
    kicker: 'Urgent helper',
    title: 'UPI Fraud / Wrong Transfer Helper',
    description: 'Generate bank messages, NPCI-style drafts, evidence checklists and safe follow-up plans.'
  },
  scheme: {
    kicker: 'Scheme guidance',
    title: 'Government Scheme Finder',
    description: 'Get possible schemes, eligibility clues, required documents and apply steps. Always verify final details on the official portal.'
  },
  documents: {
    kicker: 'Document helper',
    title: 'Document Checklist Generator',
    description: 'Choose a document type and get required documents, optional proof, process steps, common mistakes and time estimate.'
  },
  refund: {
    kicker: 'Refund tool',
    title: 'Refund Complaint Generator',
    description: 'Use the complaint engine for refund issues. Select “Refund not received” in the complaint type field.',
    primaryCta: 'Amazon refund guide',
    secondaryCta: 'Flipkart refund guide'
  },
  pricing: {
    kicker: 'Simple pricing',
    title: 'Start free. Upgrade when you need more.',
    description: 'Free users can create basic drafts. Pro, Family and Agent plans are ready for serious users and local service providers.'
  },
  login: {
    kicker: 'Welcome back',
    title: 'Login',
    description: 'Access your dashboard, saved drafts, reminders and case history with Google or email.'
  },
  register: {
    kicker: 'Create your account',
    title: 'Create account',
    description: 'Create a free account with Google or email, then save complaints, checklists and searches.'
  }
}

const hindi: CorePageCopy = {
  complaint: { kicker: 'मुफ़्त AI टूल', title: 'AI शिकायत जनरेटर', description: 'शिकायत का प्रकार चुनें, basic details डालें, और email, support chat तथा follow-up drafts तैयार करें।' },
  upi: { kicker: 'तुरंत मदद', title: 'UPI फ्रॉड / गलत ट्रांसफर हेल्पर', description: 'Bank message, NPCI-style draft, evidence checklist और safe follow-up plan तैयार करें।' },
  scheme: { kicker: 'योजना मार्गदर्शन', title: 'सरकारी योजना फाइंडर', description: 'Possible schemes, eligibility, documents और apply steps देखें। Final details official portal पर verify करें।' },
  documents: { kicker: 'दस्तावेज़ हेल्पर', title: 'Document Checklist Generator', description: 'Document type चुनें और required documents, optional proof, process steps, mistakes और time estimate पाएं।' },
  refund: { kicker: 'Refund tool', title: 'Refund Complaint Generator', description: 'Refund issues के लिए complaint engine use करें। Complaint type में “Refund not received” चुनें।', primaryCta: 'Amazon refund guide', secondaryCta: 'Flipkart refund guide' },
  pricing: { kicker: 'Simple pricing', title: 'Free शुरू करें, जरूरत पर upgrade करें।', description: 'Free users basic drafts बना सकते हैं। Pro, Family और Agent plans serious users और local service providers के लिए हैं।' },
  login: { kicker: 'Welcome back', title: 'Login', description: 'Google या email से dashboard, saved drafts, reminders और case history access करें।' },
  register: { kicker: 'Create your account', title: 'Create account', description: 'Google या email से free account बनाएं, फिर complaints, checklists और searches save करें।' }
}

const simpleOverrides: Partial<Record<AppLanguageCode, Partial<CorePageCopy>>> = {
  HINDI: hindi,
  HINGLISH: {
    complaint: { kicker: 'Free AI tool', title: 'AI Complaint Generator', description: 'Complaint type choose karo, basic details add karo, aur email, support chat aur follow-up drafts ready karo.' },
    upi: { kicker: 'Urgent helper', title: 'UPI Fraud / Wrong Transfer Helper', description: 'Bank messages, NPCI-style draft, evidence checklist aur safe follow-up plan generate karo.' },
    scheme: { kicker: 'Scheme guidance', title: 'Government Scheme Finder', description: 'Possible schemes, eligibility, documents aur apply steps samjho. Final details official portal par verify karo.' },
    documents: { kicker: 'Document helper', title: 'Document Checklist Generator', description: 'Document type choose karo aur required documents, optional proof, process steps, mistakes aur time estimate dekho.' },
    pricing: { kicker: 'Simple pricing', title: 'Free start karo. Zarurat par upgrade karo.', description: 'Free users basic drafts bana sakte hain. Pro, Family aur Agent plans serious use ke liye ready hain.' }
  },
  BENGALI: {
    complaint: { kicker: 'Free AI tool', title: 'AI Complaint Generator', description: 'Complaint type বেছে basic details দিন এবং email, support chat ও follow-up drafts তৈরি করুন।' },
    upi: { kicker: 'Urgent helper', title: 'UPI Fraud / Wrong Transfer Helper', description: 'Bank message, NPCI-style draft, evidence checklist এবং safe follow-up plan তৈরি করুন।' },
    scheme: { kicker: 'Scheme guidance', title: 'Government Scheme Finder', description: 'Possible schemes, eligibility, documents এবং apply steps দেখুন। Final details official portal-এ verify করুন।' },
    documents: { kicker: 'Document helper', title: 'Document Checklist Generator', description: 'Document type বেছে required documents, optional proof, process steps ও time estimate পান।' }
  },
  MARATHI: {
    complaint: { kicker: 'Free AI tool', title: 'AI Complaint Generator', description: 'Complaint type निवडा, basic details भरा आणि email, support chat व follow-up drafts तयार करा.' },
    upi: { kicker: 'Urgent helper', title: 'UPI Fraud / Wrong Transfer Helper', description: 'Bank message, NPCI-style draft, evidence checklist आणि safe follow-up plan तयार करा.' },
    scheme: { kicker: 'Scheme guidance', title: 'Government Scheme Finder', description: 'Possible schemes, eligibility, documents आणि apply steps पाहा. Final details official portal वर verify करा.' },
    documents: { kicker: 'Document helper', title: 'Document Checklist Generator', description: 'Document type निवडा आणि required documents, optional proof, process steps व time estimate मिळवा.' }
  },
  TAMIL: {
    complaint: { kicker: 'Free AI tool', title: 'AI Complaint Generator', description: 'Complaint type தேர்வு செய்து basic details சேர்த்து email, support chat மற்றும் follow-up drafts உருவாக்குங்கள்.' },
    upi: { kicker: 'Urgent helper', title: 'UPI Fraud / Wrong Transfer Helper', description: 'Bank message, NPCI-style draft, evidence checklist மற்றும் safe follow-up plan உருவாக்குங்கள்.' },
    scheme: { kicker: 'Scheme guidance', title: 'Government Scheme Finder', description: 'Possible schemes, eligibility, documents மற்றும் apply steps பார்க்கவும். Final details official portal-ல் verify செய்யவும்.' },
    documents: { kicker: 'Document helper', title: 'Document Checklist Generator', description: 'Document type தேர்வு செய்து required documents, optional proof, process steps மற்றும் time estimate பெறுங்கள்.' }
  },
  TELUGU: {
    complaint: { kicker: 'Free AI tool', title: 'AI Complaint Generator', description: 'Complaint type ఎంచుకుని basic details ఇచ్చి email, support chat మరియు follow-up drafts తయారు చేయండి.' },
    upi: { kicker: 'Urgent helper', title: 'UPI Fraud / Wrong Transfer Helper', description: 'Bank message, NPCI-style draft, evidence checklist మరియు safe follow-up plan తయారు చేయండి.' },
    scheme: { kicker: 'Scheme guidance', title: 'Government Scheme Finder', description: 'Possible schemes, eligibility, documents మరియు apply steps చూడండి. Final details official portal లో verify చేయండి.' },
    documents: { kicker: 'Document helper', title: 'Document Checklist Generator', description: 'Document type ఎంచుకుని required documents, optional proof, process steps మరియు time estimate పొందండి.' }
  },
  URDU: {
    complaint: { kicker: 'Free AI tool', title: 'AI Complaint Generator', description: 'Complaint type منتخب کریں، basic details شامل کریں، اور email، support chat اور follow-up drafts تیار کریں۔' },
    upi: { kicker: 'Urgent helper', title: 'UPI Fraud / Wrong Transfer Helper', description: 'Bank message، NPCI-style draft، evidence checklist اور safe follow-up plan تیار کریں۔' },
    scheme: { kicker: 'Scheme guidance', title: 'Government Scheme Finder', description: 'Possible schemes، eligibility، documents اور apply steps دیکھیں۔ Final details official portal پر verify کریں۔' },
    documents: { kicker: 'Document helper', title: 'Document Checklist Generator', description: 'Document type منتخب کریں اور required documents، optional proof، process steps اور time estimate حاصل کریں۔' }
  }
}

export function getCorePageCopy(code?: string | null): CorePageCopy {
  const normalized = normalizeLanguageCode(code)
  return { ...english, ...(simpleOverrides[normalized] || {}) }
}

export async function getCurrentPageCopy() {
  const store = await cookies()
  return getCorePageCopy(store.get('haqsathi_language')?.value)
}
