export type SeoSeedPage = {
  type: 'complaint' | 'refund' | 'documents' | 'scheme' | 'bank-complaint' | 'upi-help'
  slug: string
  title: string
  metaDescription: string
  h1: string
  intro: string
  steps: string[]
  documents: string[]
  complaintFormat: string
  faqs: { question: string; answer: string }[]
}

export const seoSeedPages: SeoSeedPage[] = [
  {
    type: 'refund',
    slug: 'amazon-refund-not-received',
    title: 'Amazon Refund Not Received Complaint Format | HaqSathi AI',
    metaDescription: 'Amazon refund not received? Simple steps, documents, complaint format and follow-up draft in Hinglish.',
    h1: 'Amazon refund not received - kya karein?',
    intro: 'Agar Amazon refund delay ho raha hai, pehle order status, bank statement aur support chat proof collect karo.',
    steps: ['Order refund status check karo', 'Bank statement me credit verify karo', 'Amazon support ko written complaint bhejo', 'Ticket number save karo', '3-7 din baad follow-up karo'],
    documents: ['Order invoice', 'Refund confirmation screenshot', 'Bank statement', 'Support chat/email proof'],
    complaintFormat: 'Dear Amazon Support, mera refund abhi tak receive nahi hua. Order ID: __. Amount: __. Please check and provide refund status.',
    faqs: [{ question: 'Amazon refund kitne din me aata hai?', answer: 'Timeline payment method par depend karta hai. App/support page par official timeline verify karein.' }]
  },
  {
    type: 'refund', slug: 'flipkart-refund-complaint', title: 'Flipkart Refund Complaint Format | HaqSathi AI', metaDescription: 'Flipkart refund complaint draft, proof checklist and follow-up steps.', h1: 'Flipkart refund complaint format', intro: 'Flipkart refund issue me order ID, return pickup proof aur bank statement important hota hai.', steps: ['Order details note karo', 'Return/refund status ka screenshot lo', 'Support ticket raise karo', 'Written response save karo'], documents: ['Order ID', 'Return pickup proof', 'Bank statement', 'Support screenshots'], complaintFormat: 'Dear Flipkart Support, mera refund pending hai. Order ID: __. Amount: __. Please process/refund status share karein.', faqs: [{ question: 'Refund pending ho to kya kare?', answer: 'Support ticket create karke written status lo aur proof save rakho.' }]
  },
  {
    type: 'upi-help', slug: 'paytm-upi-wrong-transfer', title: 'Paytm UPI Wrong Transfer Help | HaqSathi AI', metaDescription: 'Paytm UPI wrong transfer ke baad urgent steps, bank complaint draft and documents.', h1: 'Paytm UPI wrong transfer - urgent steps', intro: 'Galat UPI transfer me turant bank/payment app support ko report karna zaroori hai.', steps: ['Transaction screenshot save karo', 'Bank/app support ko immediately report karo', 'Recipient details note karo', 'Official dispute process follow karo'], documents: ['UPI transaction screenshot', 'Bank statement', 'UPI ID/mobile number', 'Complaint ticket ID'], complaintFormat: 'Dear Support, maine galti se wrong UPI transfer kiya. UTR: __. Amount: __. Please help as per official dispute process.', faqs: [{ question: 'Wrong UPI transfer reverse ho sakta hai?', answer: 'Guarantee nahi hoti. Bank/app ke official dispute process par depend karta hai.' }]
  },
  {
    type: 'upi-help', slug: 'phonepe-money-deducted', title: 'PhonePe Money Deducted But Not Received | HaqSathi AI', metaDescription: 'PhonePe money deducted issue ke liye complaint message, documents and follow-up steps.', h1: 'PhonePe money deducted but not received', intro: 'Aise case me UTR, status screenshot aur bank statement ready rakho.', steps: ['Transaction status check karo', 'Beneficiary se confirmation lo', 'PhonePe/bank support ticket raise karo', 'Written timeline maango'], documents: ['UTR', 'Transaction screenshot', 'Bank statement', 'Merchant/receiver confirmation'], complaintFormat: 'Dear PhonePe Support, amount deduct hua but receiver ko nahi mila. UTR: __. Please check and resolve.', faqs: [{ question: 'Pending UPI payment ka kya kare?', answer: 'Official app support status aur bank statement match karein.' }]
  },
  {
    type: 'upi-help', slug: 'google-pay-payment-failed', title: 'Google Pay Payment Failed Complaint | HaqSathi AI', metaDescription: 'Google Pay failed payment issue ke liye practical guide and complaint format.', h1: 'Google Pay payment failed complaint', intro: 'Payment failed but debit hua to UTR aur statement check karke support me complaint karein.', steps: ['Payment status screenshot lo', 'Bank debit check karo', 'GPay help/support me issue report karo', 'Bank ko bhi complaint bhejo'], documents: ['UPI reference number', 'Bank statement', 'Payment screenshot'], complaintFormat: 'Dear Support, Google Pay payment failed show ho raha hai but amount deduct hua. UTR: __. Please resolve.', faqs: [{ question: 'Failed payment auto refund hota hai?', answer: 'Often hota hai, par timeline official app/bank se verify karein.' }]
  },
  {
    type: 'bank-complaint', slug: 'sbi-complaint-format', title: 'SBI Complaint Format | HaqSathi AI', metaDescription: 'SBI complaint email/message format for debit, refund, UPI and service issues.', h1: 'SBI complaint format', intro: 'SBI complaint me account details public jagah share na karein; only last 4 digits/reference use karein.', steps: ['Issue details likho', 'Reference number add karo', 'Branch/support ko complaint bhejo', 'Acknowledgement save karo'], documents: ['Transaction proof', 'Statement', 'Complaint screenshot'], complaintFormat: 'Dear SBI Support, I request resolution for issue: __. Ref: __. Kindly investigate and update.', faqs: [{ question: 'SBI complaint me kya likhna chahiye?', answer: 'Issue, date, amount, reference ID and expected resolution clearly likhein.' }]
  },
  {
    type: 'bank-complaint', slug: 'hdfc-bank-complaint-format', title: 'HDFC Bank Complaint Format | HaqSathi AI', metaDescription: 'HDFC Bank complaint draft for debit/refund/card/payment issue.', h1: 'HDFC Bank complaint format', intro: 'Bank complaint written form me bhejna better hota hai taaki proof rahe.', steps: ['Date/amount/ref collect karo', 'Support complaint raise karo', 'Ticket ID save karo'], documents: ['Statement', 'Transaction ID', 'Screenshots'], complaintFormat: 'Dear HDFC Bank Support, please resolve my issue: __. Ref: __. Amount: __.', faqs: [{ question: 'Bank complaint ka proof kaise rakhe?', answer: 'Email/ticket ID/screenshot save rakhein.' }]
  },
  {
    type: 'bank-complaint', slug: 'icici-bank-debit-issue', title: 'ICICI Bank Debit Issue Complaint | HaqSathi AI', metaDescription: 'ICICI debit issue complaint format with checklist and next steps.', h1: 'ICICI Bank debit issue complaint', intro: 'Unknown debit ya failed payment debit me turant bank support ko inform karein.', steps: ['Statement verify karo', 'Merchant/app status check karo', 'Complaint raise karo'], documents: ['Debit screenshot', 'Statement', 'Merchant proof'], complaintFormat: 'Dear ICICI Bank Support, amount debit hua but service/payment complete nahi hua. Ref: __.', faqs: [{ question: 'Debit issue me kya proof chahiye?', answer: 'Statement, reference number aur app/merchant screenshot.' }]
  },
  {
    type: 'documents', slug: 'bihar-scholarship-documents', title: 'Bihar Scholarship Documents Checklist | HaqSathi AI', metaDescription: 'Bihar scholarship application ke documents, common mistakes and process checklist.', h1: 'Bihar scholarship documents checklist', intro: 'Scholarship apply karne se pehle caste/income/residence/marksheet details verify karein.', steps: ['Official portal eligibility check karo', 'Documents scan karo', 'Application carefully fill karo', 'Final submit se pehle preview check karo'], documents: ['Aadhaar', 'Bank passbook', 'Income certificate', 'Caste certificate if applicable', 'Domicile', 'Marksheet'], complaintFormat: 'Application issue ho to portal support ko application ID ke saath message bhejein.', faqs: [{ question: 'Scholarship ke liye income certificate chahiye?', answer: 'Bahut schemes me chahiye hota hai, but official notification verify karein.' }]
  },
  {
    type: 'documents', slug: 'up-scholarship-documents', title: 'UP Scholarship Documents Checklist | HaqSathi AI', metaDescription: 'UP scholarship documents, eligibility reminder, mistakes and application steps.', h1: 'UP scholarship documents checklist', intro: 'UP scholarship me mismatch details rejection ka common reason ho sakta hai.', steps: ['Eligibility read karo', 'Aadhaar-bank linking verify karo', 'Documents upload quality check karo'], documents: ['Aadhaar', 'Bank passbook', 'Income certificate', 'Caste certificate', 'Previous marksheet', 'Fee receipt'], complaintFormat: 'Portal issue ke liye application number ke saath support complaint draft karein.', faqs: [{ question: 'Documents mismatch ho to kya kare?', answer: 'Official correction window/college verification process check karein.' }]
  },
  {
    type: 'documents', slug: 'ayushman-card-documents', title: 'Ayushman Card Documents Checklist | HaqSathi AI', metaDescription: 'Ayushman card documents and verification checklist in simple Hinglish.', h1: 'Ayushman card documents', intro: 'Ayushman card eligibility official list/portal par verify karna important hai.', steps: ['Eligibility verify karo', 'Aadhaar/mobile ready rakho', 'CSC/official portal process follow karo'], documents: ['Aadhaar card', 'Ration card/family ID if required', 'Mobile number', 'Identity proof'], complaintFormat: 'Ayushman card issue ke liye official helpdesk/CSC par application/reference detail ke saath contact karein.', faqs: [{ question: 'Sabko Ayushman card milta hai?', answer: 'Eligibility government criteria par depend karti hai; official portal verify karein.' }]
  },
  {
    type: 'documents', slug: 'income-certificate-documents', title: 'Income Certificate Documents Checklist | HaqSathi AI', metaDescription: 'Income certificate required documents, online/offline process and common mistakes.', h1: 'Income certificate documents', intro: 'Income certificate ke liye state ke hisaab se requirements change ho sakti hain.', steps: ['State portal check karo', 'Income proof ready rakho', 'Application fill karo', 'Acknowledgement save karo'], documents: ['Aadhaar', 'Address proof', 'Income proof/salary slip', 'Self declaration', 'Photo'], complaintFormat: 'Application delay ke liye acknowledgement number ke saath office/portal support se contact karein.', faqs: [{ question: 'Income certificate kitne din me banta hai?', answer: 'State/service center par depend karta hai.' }]
  }
]

const more = [
  'defective-product-complaint', 'wrong-item-delivered-complaint', 'mobile-recharge-failed-refund', 'electricity-bill-issue-complaint', 'travel-booking-refund', 'education-fee-refund-complaint', 'insurance-claim-delay-complaint', 'delivery-scam-complaint'
]

for (const slug of more) {
  seoSeedPages.push({
    type: 'complaint',
    slug,
    title: `${slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} | HaqSathi AI`,
    metaDescription: `Simple complaint format, documents and follow-up steps for ${slug.replaceAll('-', ' ')}.`,
    h1: slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    intro: `Is issue ke liye proof collect karke written complaint bhejna best first step hota hai.`,
    steps: ['Issue timeline likho', 'Proof screenshots save karo', 'Company support ko complaint bhejo', 'Ticket number save karo', 'Follow-up reminder set karo'],
    documents: ['Invoice/receipt', 'Payment proof', 'Support chat', 'Photos/screenshots if applicable'],
    complaintFormat: 'Dear Support Team, I am raising a complaint about __. Reference: __. Please resolve and provide written update.',
    faqs: [{ question: 'Complaint me kya details add karein?', answer: 'Date, amount, reference ID, issue and desired resolution clearly add karein.' }]
  })
}


const extraDocuments = [
  'pan-correction-documents', 'aadhaar-update-documents', 'ration-card-documents', 'domicile-certificate-documents', 'caste-certificate-documents', 'passport-basics-documents', 'bank-kyc-documents', 'school-admission-documents'
]

for (const slug of extraDocuments) {
  seoSeedPages.push({
    type: 'documents',
    slug,
    title: `${slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} | HaqSathi AI`,
    metaDescription: `Required documents, steps, common mistakes and checklist for ${slug.replaceAll('-', ' ')}.`,
    h1: slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    intro: 'Documents state/portal ke hisaab se change ho sakte hain. Final submission se pehle official portal verify karein.',
    steps: ['Eligibility/service rules check karo', 'Required documents scan karo', 'Application carefully fill karo', 'Acknowledgement save karo', 'Status reminder set karo'],
    documents: ['Aadhaar/ID proof', 'Address proof', 'Photo', 'Supporting certificate/proof', 'Mobile number'],
    complaintFormat: 'Application delay/issue ke liye acknowledgement/reference number ke saath support ya office me written complaint karein.',
    faqs: [{ question: 'Original documents chahiye?', answer: 'Usually verification ke liye original dikhana pad sakta hai; exact rule official portal/office se confirm karein.' }]
  })
}

const extraRefunds = ['myntra-refund-not-received', 'zomato-refund-delay', 'swiggy-refund-complaint', 'irctc-refund-delay']
for (const slug of extraRefunds) {
  seoSeedPages.push({
    type: 'refund',
    slug,
    title: `${slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} | HaqSathi AI`,
    metaDescription: `Refund delay complaint format and follow-up steps for ${slug.replaceAll('-', ' ')}.`,
    h1: slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    intro: 'Refund delay me written ticket, transaction proof aur bank statement important proof hote hain.',
    steps: ['Order/booking ID note karo', 'Refund status screenshot lo', 'Support ticket raise karo', 'Written timeline maango', 'Reminder set karo'],
    documents: ['Order/booking ID', 'Payment proof', 'Refund screenshot', 'Bank statement', 'Support ticket ID'],
    complaintFormat: 'Dear Support, mera refund pending hai. Reference: __. Amount: __. Please refund status and timeline share karein.',
    faqs: [{ question: 'Refund delay me kya karein?', answer: 'Support ticket raise karke proof save rakhein; official timeline verify karein.' }]
  })
}
