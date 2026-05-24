import type { UpiInput, UpiOutput } from '@/lib/validators/upi'
import type { SchemeInput, SchemeOutput } from '@/lib/validators/scheme'
import type { DocumentInput, DocumentOutput } from '@/lib/validators/document'

export function generateUPIHelp(input: UpiInput): UpiOutput {
  const ref = input.transactionId ? `UTR/Transaction ID: ${input.transactionId}` : 'UTR/Transaction ID: not provided'
  const amount = input.amount ? `Amount: ₹${input.amount}` : 'Amount: not provided'
  const fraud = input.issue.toLowerCase().includes('fraud') || input.issue.toLowerCase().includes('scam')

  return {
    urgentActions: fraud
      ? ['Immediately call/report to your bank and request blocking/dispute as per official process', 'Report on official cyber fraud emergency channels without delay', 'Do not talk further with scammer or share OTP/PIN', 'Save screenshots, phone numbers, UPI IDs and transaction proof']
      : ['Transaction status screenshot save karo', 'Receiver/merchant se written confirmation lo if possible', 'Payment app aur bank dono me support ticket raise karo', 'Ticket ID and timeline save karo'],
    bankMessage: `Dear ${input.bankName} Support, I need urgent help for ${input.issue}. ${ref}. ${amount}. App: ${input.appName}. Date: ${input.date || 'not provided'}. Details: ${input.description}. Please investigate and provide written status/dispute steps.`,
    npciDraft: `Subject: UPI issue support request\n\nI am facing ${input.issue}. ${ref}. ${amount}. UPI app: ${input.appName}. Bank: ${input.bankName}. Details: ${input.description}. Kindly guide as per official UPI dispute process.`,
    documentChecklist: ['UPI transaction screenshot', 'Bank statement showing debit/failed credit', 'UPI ID/mobile/merchant details', 'Support ticket ID', 'Any chat/call proof', 'Police/cyber complaint acknowledgement if fraud case'],
    followUpPlan: ['Day 0: Bank/app/cyber channel report', 'Day 1: Ticket ID verify', 'Day 3: Written follow-up', 'Day 7: Escalate via official grievance route if unresolved'],
    disclaimer: 'This is guidance, not legal advice. For cyber fraud, contact official emergency channels and your bank immediately. Never share OTP/PIN/password.'
  }
}

export function generateSchemeSuggestions(input: SchemeInput): SchemeOutput {
  const baseDocs = ['Aadhaar card', 'Bank passbook', 'Photo', 'Mobile number', 'Income certificate if required', 'Domicile/residence proof']
  const purposeDocs: Record<string, string[]> = {
    Scholarship: ['Previous marksheet', 'Admission/fee receipt', 'Bonafide certificate', 'Caste certificate if applicable'],
    Health: ['Ration card/family ID if required', 'Medical documents if applicable'],
    Pension: ['Age proof', 'Life certificate if required', 'Income proof'],
    'Business loan': ['Business plan/basic estimate', 'PAN card', 'Bank statement'],
    Farming: ['Land record/Khasra if applicable', 'Farmer registration if required'],
    Housing: ['Land/property papers if applicable', 'Family income proof'],
    'Job seeker support': ['Education certificate', 'Employment registration if required'],
    'Women support': ['Identity proof', 'Income proof', 'Bank account details']
  }

  return {
    possibleSchemes: [
      { name: `${input.state} ${input.purpose} related state scheme`, whyMayFit: `Aapka purpose ${input.purpose}, state ${input.state}, profile ${input.profile} hai.`, caution: 'Exact eligibility official state portal par verify karein.' },
      { name: `Central government ${input.purpose.toLowerCase()} scheme`, whyMayFit: `Income range ${input.incomeRange} aur age ${input.age} ke basis par central schemes check kar sakte ho.`, caution: 'Central scheme rules state/category ke hisaab se change ho sakte hain.' },
      { name: `Local district/department support program`, whyMayFit: 'Kai schemes district portal/department office ke through chalti hain.', caution: 'Official notification aur deadline verify karein.' }
    ],
    eligibilityExplanation: [`State: ${input.state}`, `Age: ${input.age}`, `Profile: ${input.profile}`, `Income range: ${input.incomeRange}`, input.category ? `Category: ${input.category}` : 'Category not provided'],
    requiredDocuments: [...baseDocs, ...(purposeDocs[input.purpose] || [])],
    applySteps: ['Official state/central portal par scheme notification search karo', 'Eligibility PDF/notice read karo', 'Documents scan clear quality me ready karo', 'Application fill karke preview verify karo', 'Acknowledgement/application ID save karo'],
    officialLinkNote: 'Official-link placeholder: admin dashboard me verified official link add karein. AI fake links generate nahi karta.',
    disclaimer: 'This is guidance, not official eligibility confirmation. Final eligibility aur deadline official portal/office se verify karein.'
  }
}

export function generateDocumentChecklist(input: DocumentInput): DocumentOutput {
  const common = ['Aadhaar card', 'Passport size photo', 'Mobile number', 'Self declaration/application form']
  const map: Record<string, string[]> = {
    'Income certificate': ['Address proof', 'Salary slip/income proof', 'Bank statement if required'],
    'Caste certificate': ['Family caste proof', 'Address proof', 'Affidavit if required'],
    'Domicile certificate': ['Address proof', 'Birth/school proof', 'Residence proof'],
    'Ration card': ['Family member details', 'Address proof', 'Income proof if required'],
    'PAN correction': ['PAN card copy', 'Correct identity/address proof', 'Proof for correction'],
    'Aadhaar update': ['Existing Aadhaar', 'Proof of identity/address/date of birth depending on update'],
    'Ayushman card': ['Aadhaar', 'Ration card/family ID if required', 'Eligibility proof if available'],
    'Scholarship application': ['Marksheet', 'Bank passbook', 'Income certificate', 'Caste certificate if applicable', 'Fee receipt'],
    'School admission': ['Birth certificate', 'Transfer certificate if applicable', 'Previous marksheet'],
    'College admission': ['10th/12th marksheet', 'Transfer certificate', 'Migration certificate if required', 'Category certificate if applicable'],
    'Pension application': ['Age proof', 'Income proof', 'Bank passbook', 'Life certificate if required'],
    'Bank KYC': ['PAN', 'Address proof', 'Recent photo'],
    'Passport basics': ['Proof of identity', 'Proof of address', 'Date of birth proof']
  }

  return {
    requiredDocuments: [...common, ...(map[input.type] || [])],
    optionalDocuments: ['Old application copy if renewal/correction', 'Affidavit if state portal asks', 'Guardian documents for minor applicant'],
    stepByStepProcess: ['Official portal/office requirement check karo', 'Documents scan clear rakho', 'Name/DOB/address spelling match karo', 'Form submit karo', 'Acknowledgement number save karo', 'Status regularly check karo'],
    commonMistakes: ['Aadhaar/PAN/name mismatch', 'Blurry document upload', 'Expired certificate', 'Wrong category/state selection', 'Acknowledgement save na karna'],
    timeEstimate: 'Usually few days to few weeks; state/office workload par depend karta hai.',
    mode: `${input.state} me online/offline dono options ho sakte hain. Official portal/office verify karein. Applicant type: ${input.applicantType}.`,
    disclaimer: 'Document rules state and department ke hisaab se change hote hain. Final checklist official portal/office se verify karein.'
  }
}

export function generateChatReply(message: string) {
  const lower = message.toLowerCase()
  const isUpi = lower.includes('upi') || lower.includes('phonepe') || lower.includes('gpay') || lower.includes('google pay') || lower.includes('paytm')
  const isRefund = lower.includes('refund') || lower.includes('return') || lower.includes('flipkart') || lower.includes('amazon')
  const isScheme = lower.includes('scheme') || lower.includes('scholarship') || lower.includes('yojana')
  const isBank = lower.includes('bank') || lower.includes('debit') || lower.includes('kaat')
  const isFraud = lower.includes('fraud') || lower.includes('scam') || lower.includes('otp') || lower.includes('cyber')

  const steps = isFraud
    ? ['Bank ko immediately report karo aur card/UPI block/dispute request karo', 'Official cyber fraud channel par complaint raise karo', 'OTP/PIN/password kisi ko mat do', 'Screenshots, UTR, phone number, UPI ID save karo']
    : isUpi
      ? ['UTR/transaction screenshot save karo', 'Payment app aur bank dono me ticket raise karo', 'Receiver/merchant se written confirmation lo', 'Ticket ID ke saath 3-7 din me follow-up karo']
      : isRefund
        ? ['Order ID, invoice, return pickup proof save karo', 'Company support ko written complaint bhejo', 'Refund timeline aur ticket ID maango', 'Unresolved ho to consumer complaint format ready rakho']
        : isScheme
          ? ['State, age, income, category aur purpose note karo', 'Official portal par eligibility verify karo', 'Documents scan ready rakho', 'Application ID save karo']
          : isBank
            ? ['Statement me exact debit date/amount note karo', 'Bank support/branch ko written complaint do', 'Reference/ticket ID save karo', 'Unauthorized transaction ho to urgent block/dispute karo']
            : ['Problem ka date, amount, reference ID aur proof collect karo', 'Written complaint/ticket raise karo', 'Acknowledgement save karo', 'Follow-up reminder set karo']

  const draft = isUpi
    ? 'Dear Support, mujhe UPI transaction issue me help chahiye. UTR: __, Amount: __, Date: __. Amount debit/transfer issue hua hai. Please official dispute process ke according investigate karke written update dein.'
    : isRefund
      ? 'Dear Support Team, mera refund abhi tak receive nahi hua. Order/Transaction ID: __, Amount: __, Date: __. Please refund status share karein aur pending refund process karein.'
      : isScheme
        ? 'Mujhe scheme/scholarship eligibility aur documents verify karne hain. State: __, Age: __, Income: __, Purpose: __. Please official requirement confirm karne me help karein.'
        : 'Dear Support, main issue report kar raha/rahi hoon. Reference ID: __, Date: __, Amount: __. Issue: __. Please investigate karke written resolution provide karein.'

  return {
    reply: `Samjha. Pehle proof safe rakho aur written complaint/ticket raise karo. ${isFraud ? 'Fraud case me delay mat karo.' : 'Follow-up ke liye ticket ID zaroor lo.'}`,
    actionSteps: steps,
    draftMessage: draft,
    checklist: ['Screenshot/proof', 'Transaction/order/application ID', 'Date and amount', 'Support ticket ID', 'Bank statement/invoice if applicable'],
    disclaimer: isFraud ? 'This is guidance, not legal advice. Cyber fraud me bank aur official emergency channels ko immediately contact karo.' : 'This is guidance, not legal advice. Official portal/support se final verification zaroor karein.'
  }
}
