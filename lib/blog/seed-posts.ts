export type BlogSeedPost = {
  slug: string
  title: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  category: string
  tags: string[]
  content: {
    intro: string
    sections: { heading: string; body: string; bullets?: string[] }[]
  }
  faqs: { question: string; answer: string }[]
}

export const blogSeedPosts: BlogSeedPost[] = [
  {
    slug: 'upi-wrong-transfer-kya-kare',
    title: 'UPI Galat Number Pe Chala Gaya To Kya Kare?',
    excerpt: 'Wrong UPI transfer ke baad bank, NPCI aur receiver side par kaun se steps lene chahiye, simple Hinglish guide.',
    metaTitle: 'UPI Wrong Transfer Help - Step by Step Guide',
    metaDescription: 'UPI galat number pe transfer ho gaya? Bank complaint draft, document checklist aur urgent steps samjhein.',
    category: 'UPI Help',
    tags: ['UPI', 'Wrong transfer', 'Bank complaint'],
    content: {
      intro: 'UPI wrong transfer me sabse important cheez hai proof save karna aur bank ko jaldi complaint dena. HaqSathi AI official authority nahi hai, par aapko safe next steps aur draft message de sakta hai.',
      sections: [
        { heading: 'Sabse pehle kya save karein', body: 'Transaction screenshot, UTR/reference ID, date-time, amount, receiver UPI ID aur bank SMS/email save karein.', bullets: ['UPI app screenshot', 'Bank statement entry', 'Receiver UPI ID', 'Complaint ticket number'] },
        { heading: 'Bank ko complaint kaise bhejein', body: 'Apne bank ke support email/app/helpdesk me clear message bhejein. Galti se transfer hai ya fraud hai, ye clearly mention karein.' },
        { heading: 'Follow-up kab karein', body: 'Complaint ID milne ke baad 24-48 hours me follow-up karein. Agar fraud case hai to emergency cyber channel par immediately report karein.' }
      ]
    },
    faqs: [
      { question: 'Kya wrong UPI transfer guaranteed reverse ho jayega?', answer: 'Nahi. Reversal bank/receiver cooperation, policy aur case facts par depend karta hai.' },
      { question: 'Fraud case me kya karna chahiye?', answer: 'Bank ko block/report karein aur official cyber fraud emergency channel par immediately complaint karein.' }
    ]
  },
  {
    slug: 'flipkart-refund-not-received-complaint-format',
    title: 'Flipkart Refund Nahi Aaya: Complaint Format',
    excerpt: 'Flipkart refund delay ke liye email, support message aur consumer complaint format ka simple guide.',
    metaTitle: 'Flipkart Refund Not Received Complaint Format',
    metaDescription: 'Flipkart refund not received complaint format, documents, steps and follow-up message in simple Hinglish.',
    category: 'Refund',
    tags: ['Flipkart', 'Refund', 'Consumer complaint'],
    content: {
      intro: 'Refund delay me order ID, refund date, payment proof aur support chat proof ready rakhna chahiye. Pehle company support ko written complaint bhejna best hai.',
      sections: [
        { heading: 'Required details', body: 'Order ID, refund amount, payment method, expected refund date, support ticket/chat screenshots.', bullets: ['Order ID', 'Payment screenshot', 'Refund promise screenshot', 'Bank statement if needed'] },
        { heading: 'Complaint message me kya likhein', body: 'Issue ko short rakhein, date mention karein, desired resolution clear likhein: refund credit, written confirmation, or escalation.' },
        { heading: 'Consumer helpline format', body: 'Agar company respond nahi karti, complaint format ko consumer helpline ke liye structured rakhein. Official portal details verify karein.' }
      ]
    },
    faqs: [
      { question: 'Refund delay me kitna wait karein?', answer: 'Company ke promised timeline ke baad written complaint aur follow-up karein.' },
      { question: 'Kya legal notice bhejna chahiye?', answer: 'Serious/high amount cases me qualified legal professional se advice lena better hai.' }
    ]
  },
  {
    slug: 'scholarship-application-documents-checklist',
    title: 'Scholarship Application Documents Checklist',
    excerpt: 'School/college scholarship ke liye common documents, mistakes aur status tracking guide.',
    metaTitle: 'Scholarship Documents Checklist India',
    metaDescription: 'Scholarship apply karne ke liye documents checklist, common mistakes, process steps and reminders.',
    category: 'Documents',
    tags: ['Scholarship', 'Documents', 'Students'],
    content: {
      intro: 'Scholarship applications me document mismatch, bank details error aur deadline miss hona common problem hai. Checklist se application reject hone ka risk kam hota hai.',
      sections: [
        { heading: 'Common documents', body: 'Aadhaar, bank passbook, income certificate, caste certificate if applicable, domicile, previous marksheet, admission/fee receipt.', bullets: ['Aadhaar card', 'Bank passbook', 'Income certificate', 'Marksheet', 'Fee receipt'] },
        { heading: 'Common mistakes', body: 'Name spelling mismatch, bank IFSC error, expired certificate, blurry upload, wrong course/session details.' },
        { heading: 'Status reminder', body: 'Application submit hone ke baad acknowledgement number save karein aur dashboard me reminder set karein.' }
      ]
    },
    faqs: [
      { question: 'Income certificate kitna recent hona chahiye?', answer: 'Ye state/scheme rules par depend karta hai; official notification verify karein.' },
      { question: 'Bank account student ke naam se hona zaroori hai?', answer: 'Kaafi schemes me yes, par exact rule official scheme portal se confirm karein.' }
    ]
  }
]
