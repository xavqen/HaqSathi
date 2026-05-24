export const templateSeedItems = [
  {
    slug: 'refund-follow-up-message',
    title: 'Refund Follow-up Message',
    category: 'Refund',
    intent: 'Company support follow-up when refund is delayed',
    language: 'HINGLISH',
    isPremium: false,
    variables: ['companyName', 'orderId', 'amount', 'daysPending'],
    body: `Hello {companyName} Support,\n\nMera refund abhi tak receive nahi hua hai. Order/Transaction ID: {orderId}. Refund amount: ₹{amount}. Refund pending hai approx {daysPending} days se.\n\nPlease refund status confirm karke expected credit date share karein. Agar refund initiate ho chuka hai to RRN/UTR/reference number provide karein.\n\nThank you.`
  },
  {
    slug: 'bank-debit-complaint-email',
    title: 'Bank Debit Complaint Email',
    category: 'Bank',
    intent: 'Bank se paisa debit hua but service/payment successful nahi hua',
    language: 'HINGLISH',
    isPremium: false,
    variables: ['bankName', 'transactionId', 'amount', 'date', 'issue'],
    body: `Subject: Complaint regarding failed transaction and amount debit\n\nDear {bankName} Support,\n\nMere account se ₹{amount} debit hua on {date}, but transaction/service successful nahi hua. Transaction ID: {transactionId}.\n\nIssue: {issue}\n\nPlease is transaction ko investigate karke refund/reversal process karein aur written confirmation share karein.\n\nRegards.`
  },
  {
    slug: 'upi-wrong-transfer-bank-message',
    title: 'UPI Wrong Transfer Bank Message',
    category: 'UPI',
    intent: 'Wrong UPI transfer ke baad bank/NPCI complaint draft',
    language: 'HINGLISH',
    isPremium: false,
    variables: ['bankName', 'upiId', 'utr', 'amount', 'date'],
    body: `Dear {bankName} Team,\n\nMere se galti se wrong UPI transfer ho gaya hai. Amount: ₹{amount}, Date: {date}, UTR/RRN: {utr}, Receiver UPI: {upiId}.\n\nPlease beneficiary bank se coordinate karke reversal/help process initiate karein. Main required documents/share screenshot provide kar sakta/sakti hoon.\n\nNote: Please complaint/reference number provide karein.`
  },
  {
    slug: 'cyber-fraud-first-report-note',
    title: 'Cyber Fraud First Report Note',
    category: 'Cyber Fraud',
    intent: 'Urgent first-response note for fraud reporting',
    language: 'HINGLISH',
    isPremium: true,
    variables: ['amount', 'date', 'fraudType', 'utr'],
    body: `Urgent cyber fraud report:\n\nMere saath {fraudType} hua hai. Amount: ₹{amount}, Date/Time: {date}, UTR/Reference: {utr}.\n\nI request immediate hold/block action wherever possible. Main transaction screenshot, phone number/chat details and bank statement provide kar raha/rahi hoon.\n\nDisclaimer: Iske saath official cyber crime helpline/portal par immediately report karein.`
  },
  {
    slug: 'scholarship-document-missing-note',
    title: 'Scholarship Document Missing Note',
    category: 'Scholarship',
    intent: 'Institute/portal support ko document correction request',
    language: 'HINGLISH',
    isPremium: false,
    variables: ['studentName', 'applicationId', 'documentName', 'course'],
    body: `Respected Sir/Madam,\n\nMain {studentName}, course {course}, application ID {applicationId}. Mere scholarship application me {documentName} related correction/upload issue aa raha hai.\n\nPlease mujhe correction window/process batane ki kripa karein, taki application reject na ho.\n\nThank you.`
  },
  {
    slug: 'legal-notice-style-refund-draft',
    title: 'Legal Notice Style Refund Draft',
    category: 'Legal-style',
    intent: 'Strict refund escalation draft with disclaimer',
    language: 'HINGLISH',
    isPremium: true,
    variables: ['companyName', 'orderId', 'amount', 'issue', 'daysPending'],
    body: `To,\n{companyName}\n\nSubject: Final request for refund resolution\n\nThis is regarding Order/Transaction ID {orderId} for amount ₹{amount}. Issue: {issue}. Refund has been pending for {daysPending} days despite reasonable follow-up.\n\nPlease resolve this matter within a reasonable time and share refund/reference details in writing, failing which I may consider escalation through available consumer grievance channels.\n\nDisclaimer: This is a legal-notice style draft, not legal advice.`
  }
]
