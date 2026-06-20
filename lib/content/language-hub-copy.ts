import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

const nativeCopy: Record<string, string> = {
  ENGLISH: 'HaqSathi AI works in English by default. Describe your refund, UPI, document or scheme issue and get a clear, copy-ready draft and checklist.',
  HINGLISH: 'HaqSathi AI Hinglish mein bhi kaam karta hai. Apni refund, UPI, document ya scheme problem simple Hindi-English mein likhiye aur copy-ready draft paaiye.',
  HINDI: 'HaqSathi AI अब Hindi में भी available है. अपनी refund, UPI, document या scheme की problem Hindi में लिखिए — आपको clear draft और checklist मिलेगी.',
  BENGALI: 'HaqSathi AI বাংলাতেও সাহায্য করে। refund, UPI, document বা scheme সমস্যা লিখুন — পরিষ্কার draft এবং checklist পান।',
  MARATHI: 'HaqSathi AI मराठीतही मदत करते. refund, UPI, document किंवा scheme समस्या लिहा आणि स्पष्ट draft व checklist मिळवा.',
  TAMIL: 'HaqSathi AI தமிழிலும் உதவுகிறது. refund, UPI, document அல்லது scheme பிரச்சினையை எழுதுங்கள் — தெளிவான draft மற்றும் checklist கிடைக்கும்.',
  TELUGU: 'HaqSathi AI తెలుగులో కూడా సహాయం చేస్తుంది. refund, UPI, document లేదా scheme సమస్యను రాయండి — స్పష్టమైన draft మరియు checklist పొందండి.',
  GUJARATI: 'HaqSathi AI ગુજરાતીમાં પણ મદદ કરે છે. refund, UPI, document અથવા scheme સમસ્યા લખો અને clear draft/checklist મેળવો.',
  URDU: 'HaqSathi AI اردو میں بھی مدد کرتا ہے۔ refund، UPI، document یا scheme کا مسئلہ لکھیں اور clear draft/checklist حاصل کریں۔',
  KANNADA: 'HaqSathi AI ಕನ್ನಡದಲ್ಲೂ ಸಹಾಯ ಮಾಡುತ್ತದೆ. refund, UPI, document ಅಥವಾ scheme ಸಮಸ್ಯೆಯನ್ನು ಬರೆಯಿರಿ — ಸ್ಪಷ್ಟ draft ಮತ್ತು checklist ಪಡೆಯಿರಿ.',
  MALAYALAM: 'HaqSathi AI മലയാളത്തിലും സഹായിക്കുന്നു. refund, UPI, document അല്ലെങ്കിൽ scheme പ്രശ്നം എഴുതുക — വ്യക്തമായ draft, checklist ലഭിക്കും.',
  ODIA: 'HaqSathi AI ଓଡ଼ିଆରେ ମଧ୍ୟ ସହାୟତା କରେ। refund, UPI, document କିମ୍ବା scheme ସମସ୍ୟା ଲେଖନ୍ତୁ — clear draft/checklist ପାଆନ୍ତୁ।',
  PUNJABI: 'HaqSathi AI ਪੰਜਾਬੀ ਵਿੱਚ ਵੀ ਮਦਦ ਕਰਦਾ ਹੈ। refund, UPI, document ਜਾਂ scheme ਦੀ problem ਲਿਖੋ ਤੇ clear draft/checklist ਲਵੋ.',
  ASSAMESE: 'HaqSathi AI অসমীয়াতো সহায় কৰে। refund, UPI, document বা scheme সমস্যা লিখক — clear draft আৰু checklist লাভ কৰক।',
  MAITHILI: 'HaqSathi AI मैथिली में सेहो मदद करैत अछि. refund, UPI, document वा scheme समस्या लिखू — साफ draft आ checklist भेटत.',
  SANTALI: 'HaqSathi AI Santali users को refund, UPI, document और scheme issues में simple guidance, drafts और checklist देता है.',
  KASHMIRI: 'HaqSathi AI Kashmiri users ke liye refund, UPI, document aur scheme issues par clear guidance, drafts aur checklist deta hai.',
  NEPALI: 'HaqSathi AI नेपालीमा पनि मद्दत गर्छ। refund, UPI, document वा scheme समस्या लेख्नुहोस् — clear draft र checklist पाउनुहोस्।',
  KONKANI: 'HaqSathi AI Konkani users ke liye refund, UPI, document aur scheme issues par simple drafts aur checklist deta hai.',
  SINDHI: 'HaqSathi AI Sindhi users ke liye refund, UPI, document aur scheme problems par clear draft aur checklist banata hai.',
  DOGRI: 'HaqSathi AI Dogri users ke liye refund, UPI, document aur scheme issues par simple guidance aur copy-ready draft deta hai.',
  MANIPURI: 'HaqSathi AI Manipuri users ke liye refund, UPI, document aur scheme issues par clear guidance, drafts aur checklist deta hai.',
  BODO: 'HaqSathi AI Bodo users ke liye refund, UPI, document aur scheme problems par simple draft aur checklist banata hai.',
  SANSKRIT: 'HaqSathi AI Sanskrit users ke liye refund, UPI, document aur scheme issues par simple guidance, drafts aur checklist deta hai.'
}

export function getLanguageHubCopy(code: string) {
  const language = LANGUAGE_OPTIONS.find((item) => item.code === code)
  if (!language) return nativeCopy.ENGLISH
  return nativeCopy[language.code] || `HaqSathi AI can respond in ${language.label}. Describe your issue to get guidance, drafts and checklists in ${language.label}.`
}
