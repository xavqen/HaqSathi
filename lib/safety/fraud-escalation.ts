export const CYBER_FRAUD_HELPLINE = '1930'
export const CYBER_FRAUD_PORTAL = 'cybercrime.gov.in'

export const upiFraudEscalationActions = [
  `Call the National Cyber Crime Helpline: ${CYBER_FRAUD_HELPLINE}`,
  `Report online at ${CYBER_FRAUD_PORTAL}`,
  'Inform your bank / UPI app immediately and ask for an unauthorized transaction dispute or block if needed.',
  'Save UTR/RRN, screenshots, scammer phone/UPI ID, SMS, WhatsApp chats and bank acknowledgement.'
]

export const upiFraudEscalationNote = `For UPI fraud / unauthorized transactions: call ${CYBER_FRAUD_HELPLINE}, report at ${CYBER_FRAUD_PORTAL}, and inform your bank / UPI app immediately. Use HaqSathi only to prepare follow-up drafts after those urgent steps.`

export function isLikelyUpiFraudText(text: string) {
  const normalized = text.toLowerCase()
  return (
    /\b(upi|gpay|google pay|phonepe|paytm|bhim|utr|rrn|bank|debit|transaction)\b/.test(normalized) &&
    /\b(fraud|scam|unauthori[sz]ed|phishing|unknown|not done by me|cyber|otp|remote access|apk|screen share)\b/.test(normalized)
  )
}
