import { normalizeLanguageCode, type AppLanguageCode } from './languages'

export type ShellDictionary = {
  nav: {
    complaint: string
    smartWizard: string
    scamRadar: string
    upiHelp: string
    schemes: string
    documents: string
    tools: string
    allTools: string
    search: string
    login: string
    start: string
    startFree: string
    appSubline: string
  }
  account: {
    dashboard: string
    allTools: string
    profile: string
    billing: string
    language: string
    googleConnected: string
  }
  disclaimer: {
    prefix: string
    message: string
    link: string
  }
  home: {
    badge: string
    title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    proofPoints: string[]
    liveBadge: string
    liveTitle: string
    liveSteps: string[]
    toolsCountLabel: string
    mobileLabel: string
    coreBadge: string
    coreTitle: string
    coreSubtitle: string
    allToolsCta: string
    openTool: string
    actionBadge: string
    actionTitle: string
    actionSubtitle: string
    trustBadge: string
    trustTitle: string
    trustSubtitle: string
    disclaimerCta: string
    howSteps: [string, string, string][]
    pricingBadge: string
    pricingTitle: string
    fullPricing: string
    finalBadge: string
    finalTitle: string
    finalSubtitle: string
    getStarted: string
    faqs: [string, string][]
  }
  tools: {
    badge: string
    title: string
    subtitle: string
    startComplaint: string
    searchPlaceholder: string
    categories: Record<string, string>
    metrics: string[]
    openWorkflow: string
    noResult: string
  }
  footer: {
    description: string
    pills: string[]
    tools: string
    company: string
  }
}

const english: ShellDictionary = {
  nav: {
    complaint: 'Complaint',
    smartWizard: 'Smart Wizard',
    scamRadar: 'Scam Radar',
    upiHelp: 'UPI Help',
    schemes: 'Schemes',
    documents: 'Documents',
    tools: 'Tools',
    allTools: 'All tools',
    search: 'Search',
    login: 'Login',
    start: 'Start',
    startFree: 'Start Free',
    appSubline: 'Complaint • Refund • Documents'
  },
  account: {
    dashboard: 'Dashboard',
    allTools: 'All tools',
    profile: 'Profile settings',
    billing: 'Billing & plan',
    language: 'Language',
    googleConnected: 'Google connected'
  },
  disclaimer: {
    prefix: 'Guidance only:',
    message: 'HaqSathi AI is not a government, legal, bank, or official authority. Verify final action on the official portal or with a qualified expert.',
    link: 'Disclaimer'
  },
  home: {
    badge: 'India-first AI life-admin helper',
    title: 'Resolve complaints, refunds, UPI issues and documents faster.',
    subtitle: 'HaqSathi AI helps users prepare complaint drafts, evidence lists, follow-ups, scheme guidance and document checklists in a clean mobile-first workflow.',
    primaryCta: 'Start Free',
    secondaryCta: 'Explore tools',
    proofPoints: ['Guidance-first product with clear disclaimers', 'Mobile-first forms and copy-ready output', 'Dashboard for drafts, reminders, cases and evidence', 'Admin, SEO, payment-ready and storage-ready structure'],
    liveBadge: 'Live workflow',
    liveTitle: 'Complaint command center',
    liveSteps: ['Issue details captured', 'Evidence checklist created', 'Complaint + follow-up draft ready', 'Reminder and escalation planned'],
    toolsCountLabel: 'Tools',
    mobileLabel: 'Mobile optimized UI',
    coreBadge: 'Core tools',
    coreTitle: 'Start with the most common problems',
    coreSubtitle: 'Every card opens a focused, mobile-friendly workflow with copy-ready output.',
    allToolsCta: 'View all tools',
    openTool: 'Open tool',
    actionBadge: 'Smart action system',
    actionTitle: 'From confusion to a clear next step',
    actionSubtitle: 'The platform is built around short steps, readable output, reminders, evidence and escalation routes.',
    trustBadge: 'Trust and safety',
    trustTitle: 'Guidance with safeguards',
    trustSubtitle: 'HaqSathi AI does not claim official authority or guaranteed outcomes. It helps users organize facts, wording and evidence before they verify official channels.',
    disclaimerCta: 'Read disclaimer',
    howSteps: [['1', 'Choose your issue', 'Refund, UPI, bank, document, scheme or safety problem.'], ['2', 'Fill simple details', 'Add amount, date, company, proof and desired result.'], ['3', 'Copy and act', 'Use the draft, checklist, call script and reminders.']],
    pricingBadge: 'Pricing',
    pricingTitle: 'Start free, upgrade when needed',
    fullPricing: 'See full pricing',
    finalBadge: 'Ready for mobile users',
    finalTitle: 'Open the all-tools hub and choose the exact workflow.',
    finalSubtitle: 'Use complaint drafting, scam checking, OCR autofill, submission packs, case coaching, proof scanning, chargeback help and more.',
    getStarted: 'Get started',
    faqs: [['Is HaqSathi AI an official government website?', 'No. It is a guidance and drafting tool. Always verify final action with the official portal, bank, company, or expert.'], ['What is the default language?', 'The default product language is English. Users can choose other Indian and global languages from profile settings.'], ['What happens when I tap Start Free?', 'Logged-out users go to login. Logged-in users go directly to the all-tools hub.']]
  },
  tools: {
    badge: 'All public workflows',
    title: 'Choose the right tool for your issue',
    subtitle: 'Search across complaint drafting, UPI help, refund negotiation, OCR autofill, scam safety, evidence, legal-style escalation and more. Optimized for mobile first.',
    startComplaint: 'Start complaint',
    searchPlaceholder: 'Search complaint, UPI, refund, document, scam...',
    categories: { 'All': 'All', 'Most used': 'Most used', 'Complaint': 'Complaint', 'Money & UPI': 'Money & UPI', 'Documents': 'Documents', 'Safety': 'Safety', 'Legal & escalation': 'Legal & escalation', 'Productivity': 'Productivity', 'Agent': 'Agent' },
    metrics: ['Tools', 'Categories', 'Mobile first', 'English default'],
    openWorkflow: 'Open workflow',
    noResult: 'No tool found. Try refund, UPI, document, scam, proof or legal.'
  },
  footer: {
    description: 'Complaint, refund, UPI, documents and scheme guidance in a simple mobile-first workflow. Guidance only, not legal or official advice.',
    pills: ['English default', 'Multi-language support', 'Mobile optimized'],
    tools: 'Tools',
    company: 'Company'
  }
}

const dictionaries: Partial<Record<AppLanguageCode, ShellDictionary>> = {
  ENGLISH: english,
  HINGLISH: {
    ...english,
    nav: { ...english.nav, startFree: 'Free Start', allTools: 'All tools' },
    disclaimer: { prefix: 'Guidance only:', message: 'HaqSathi AI government, legal, bank ya official authority nahi hai. Final action se pehle official portal ya expert se verify karein.', link: 'Disclaimer' },
    home: { ...english.home, title: 'Complaints, refunds, UPI issues aur documents ko faster resolve karein.', subtitle: 'HaqSathi AI complaint drafts, evidence list, follow-ups, scheme guidance aur document checklists ko simple mobile-first flow me ready karta hai.' },
    tools: { ...english.tools, title: 'Apne issue ke liye right tool choose karein', subtitle: 'Complaint, UPI, refund, OCR, scam safety, evidence aur escalation tools ko mobile-first workflow me use karein.' }
  },
  HINDI: {
    ...english,
    nav: { ...english.nav, complaint: 'शिकायत', smartWizard: 'स्मार्ट विज़ार्ड', scamRadar: 'स्कैम रडार', upiHelp: 'UPI सहायता', schemes: 'योजनाएँ', documents: 'दस्तावेज़', tools: 'टूल्स', allTools: 'सभी टूल्स', search: 'खोजें', login: 'लॉगिन', start: 'शुरू करें', startFree: 'मुफ़्त शुरू करें', appSubline: 'शिकायत • रिफंड • दस्तावेज़' },
    account: { ...english.account, dashboard: 'डैशबोर्ड', allTools: 'सभी टूल्स', profile: 'प्रोफ़ाइल सेटिंग', billing: 'बिलिंग और प्लान', language: 'भाषा' },
    disclaimer: { prefix: 'केवल मार्गदर्शन:', message: 'HaqSathi AI सरकारी, कानूनी, बैंक या आधिकारिक संस्था नहीं है। अंतिम कार्रवाई से पहले आधिकारिक पोर्टल या योग्य विशेषज्ञ से सत्यापित करें।', link: 'डिस्क्लेमर' },
    home: { ...english.home, badge: 'भारत-फर्स्ट AI हेल्पर', title: 'शिकायत, रिफंड, UPI समस्या और दस्तावेज़ तेज़ी से संभालें।', subtitle: 'HaqSathi AI आपको शिकायत ड्राफ्ट, सबूत सूची, फॉलो-अप, योजना गाइड और दस्तावेज़ चेकलिस्ट तैयार करने में मदद करता है।', primaryCta: 'मुफ़्त शुरू करें', secondaryCta: 'टूल्स देखें', allToolsCta: 'सभी टूल्स देखें', getStarted: 'शुरू करें' },
    tools: { ...english.tools, badge: 'सभी पब्लिक वर्कफ़्लो', title: 'अपनी समस्या के लिए सही टूल चुनें', subtitle: 'शिकायत, UPI, रिफंड, दस्तावेज़, स्कैम सुरक्षा और एस्केलेशन टूल्स खोजें।', startComplaint: 'शिकायत शुरू करें', searchPlaceholder: 'शिकायत, UPI, रिफंड, दस्तावेज़ खोजें...', openWorkflow: 'वर्कफ़्लो खोलें', noResult: 'कोई टूल नहीं मिला। रिफंड, UPI, दस्तावेज़ या स्कैम खोजें।' },
    footer: { ...english.footer, description: 'शिकायत, रिफंड, UPI, दस्तावेज़ और योजना मार्गदर्शन के लिए मोबाइल-फर्स्ट वर्कफ़्लो। यह केवल मार्गदर्शन है।' }
  },
  BENGALI: {
    ...english,
    nav: { ...english.nav, complaint: 'অভিযোগ', upiHelp: 'UPI সহায়তা', schemes: 'স্কিম', documents: 'ডকুমেন্ট', tools: 'টুলস', allTools: 'সব টুল', login: 'লগইন', startFree: 'ফ্রি শুরু করুন' },
    disclaimer: { prefix: 'শুধু নির্দেশনা:', message: 'HaqSathi AI সরকার, আইন, ব্যাংক বা অফিসিয়াল কর্তৃপক্ষ নয়। চূড়ান্ত পদক্ষেপের আগে অফিসিয়াল পোর্টাল বা বিশেষজ্ঞের সঙ্গে যাচাই করুন।', link: 'ডিসক্লেমার' },
    home: { ...english.home, title: 'অভিযোগ, রিফান্ড, UPI সমস্যা এবং ডকুমেন্ট দ্রুত সামলান।', subtitle: 'HaqSathi AI অভিযোগ ড্রাফট, প্রমাণ তালিকা, ফলো-আপ, স্কিম গাইড এবং ডকুমেন্ট চেকলিস্ট তৈরি করতে সাহায্য করে।', primaryCta: 'ফ্রি শুরু করুন', secondaryCta: 'টুলস দেখুন' },
    tools: { ...english.tools, title: 'আপনার সমস্যার জন্য সঠিক টুল বেছে নিন', startComplaint: 'অভিযোগ শুরু করুন' }
  },
  MARATHI: {
    ...english,
    nav: { ...english.nav, complaint: 'तक्रार', upiHelp: 'UPI मदत', schemes: 'योजना', documents: 'दस्तऐवज', tools: 'टूल्स', allTools: 'सर्व टूल्स', login: 'लॉगिन', startFree: 'फ्री सुरू करा' },
    disclaimer: { prefix: 'फक्त मार्गदर्शन:', message: 'HaqSathi AI सरकारी, कायदेशीर, बँक किंवा अधिकृत संस्था नाही. अंतिम कृतीपूर्वी अधिकृत पोर्टल किंवा तज्ज्ञांकडून पडताळणी करा.', link: 'डिस्क्लेमर' },
    home: { ...english.home, title: 'तक्रारी, रिफंड, UPI समस्या आणि दस्तऐवज जलद हाताळा.', subtitle: 'HaqSathi AI तक्रार ड्राफ्ट, पुरावा यादी, फॉलो-अप, योजना मार्गदर्शन आणि दस्तऐवज चेकलिस्ट तयार करण्यात मदत करते.', primaryCta: 'फ्री सुरू करा', secondaryCta: 'टूल्स पहा' },
    tools: { ...english.tools, title: 'तुमच्या समस्येसाठी योग्य टूल निवडा', startComplaint: 'तक्रार सुरू करा' }
  },
  TAMIL: {
    ...english,
    nav: { ...english.nav, complaint: 'புகார்', upiHelp: 'UPI உதவி', schemes: 'திட்டங்கள்', documents: 'ஆவணங்கள்', tools: 'கருவிகள்', allTools: 'அனைத்து கருவிகள்', login: 'உள்நுழை', startFree: 'இலவசமாக தொடங்கு' },
    disclaimer: { prefix: 'வழிகாட்டல் மட்டும்:', message: 'HaqSathi AI அரசு, சட்ட, வங்கி அல்லது அதிகாரப்பூர்வ நிறுவனம் அல்ல. இறுதி நடவடிக்கைக்கு முன் அதிகாரப்பூர்வ தளம் அல்லது நிபுணருடன் சரிபார்க்கவும்.', link: 'மறுப்பு' },
    home: { ...english.home, title: 'புகார், ரீபண்ட், UPI பிரச்சனை மற்றும் ஆவணங்களை வேகமாக கையாளுங்கள்.', subtitle: 'HaqSathi AI புகார் வரைவு, சான்று பட்டியல், follow-up, scheme guidance மற்றும் document checklist உருவாக்க உதவுகிறது.', primaryCta: 'இலவசமாக தொடங்கு', secondaryCta: 'கருவிகளை பார்க்க' },
    tools: { ...english.tools, title: 'உங்கள் பிரச்சனைக்கு சரியான கருவியை தேர்வு செய்யுங்கள்', startComplaint: 'புகார் தொடங்கு' }
  },
  TELUGU: {
    ...english,
    nav: { ...english.nav, complaint: 'ఫిర్యాదు', upiHelp: 'UPI సహాయం', schemes: 'పథకాలు', documents: 'డాక్యుమెంట్లు', tools: 'టూల్స్', allTools: 'అన్ని టూల్స్', login: 'లాగిన్', startFree: 'ఉచితంగా ప్రారంభించండి' },
    disclaimer: { prefix: 'మార్గదర్శకత్వం మాత్రమే:', message: 'HaqSathi AI ప్రభుత్వ, చట్టపరమైన, బ్యాంక్ లేదా అధికారిక సంస్థ కాదు. తుది చర్యకు ముందు అధికారిక పోర్టల్ లేదా నిపుణుడితో ధృవీకరించండి.', link: 'డిస్క్లెయిమర్' },
    home: { ...english.home, title: 'ఫిర్యాదులు, రీఫండ్లు, UPI సమస్యలు మరియు డాక్యుమెంట్లను వేగంగా పరిష్కరించండి.', subtitle: 'HaqSathi AI complaint drafts, evidence lists, follow-ups, scheme guidance మరియు document checklists సిద్ధం చేయడంలో సహాయపడుతుంది.', primaryCta: 'ఉచితంగా ప్రారంభించండి', secondaryCta: 'టూల్స్ చూడండి' },
    tools: { ...english.tools, title: 'మీ సమస్యకు సరైన టూల్ ఎంచుకోండి', startComplaint: 'ఫిర్యాదు ప్రారంభించండి' }
  },
  URDU: {
    ...english,
    nav: { ...english.nav, complaint: 'شکایت', upiHelp: 'UPI مدد', schemes: 'اسکیمیں', documents: 'دستاویزات', tools: 'ٹولز', allTools: 'تمام ٹولز', login: 'لاگ اِن', startFree: 'مفت شروع کریں' },
    disclaimer: { prefix: 'صرف رہنمائی:', message: 'HaqSathi AI حکومت، قانونی، بینک یا سرکاری اتھارٹی نہیں ہے۔ حتمی کارروائی سے پہلے سرکاری پورٹل یا ماہر سے تصدیق کریں۔', link: 'ڈسکلیمر' },
    home: { ...english.home, title: 'شکایات، ریفنڈ، UPI مسائل اور دستاویزات کو تیزی سے سنبھالیں۔', subtitle: 'HaqSathi AI شکایت ڈرافٹ، ثبوت کی فہرست، follow-up، scheme guidance اور document checklists بنانے میں مدد کرتا ہے۔', primaryCta: 'مفت شروع کریں', secondaryCta: 'ٹولز دیکھیں' },
    tools: { ...english.tools, title: 'اپنے مسئلے کے لیے صحیح ٹول منتخب کریں', startComplaint: 'شکایت شروع کریں' }
  }
}

export function getShellDictionary(code?: string | null): ShellDictionary {
  return dictionaries[normalizeLanguageCode(code)] || english
}

export function translateCategory(category: string, dictionary: ShellDictionary) {
  return dictionary.tools.categories[category] || category
}
