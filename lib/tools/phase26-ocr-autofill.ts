import { safeJsonParse } from '@/lib/utils'
import { ocrAutofillResultSchema, type OcrAutofillResult } from '@/lib/validators/phase26'
import { buildLanguageInstruction } from '@/lib/i18n/languages'

export type OcrAutofillInput = {
  fileName?: string
  mimeType?: string
  fileSize?: number
  dataUrl?: string
  rawNotes?: string
  documentType?: string
  language?: string
}

const disclaimer = 'AI/OCR extracted details can be wrong. Complaint submit karne se pehle company name, amount, date, order/transaction ID aur evidence manually verify karein. OTP/PIN/password kabhi share na karein.'

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim().replace(/[.,;:]+$/, '')
  }
  return ''
}

function normalizeDate(value: string) {
  if (!value) return ''
  const ddmmyyyy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (ddmmyyyy) {
    const dd = ddmmyyyy[1].padStart(2, '0')
    const mm = ddmmyyyy[2].padStart(2, '0')
    const yyyy = ddmmyyyy[3].length === 2 ? `20${ddmmyyyy[3]}` : ddmmyyyy[3]
    return `${yyyy}-${mm}-${dd}`
  }
  const ymd = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`
  return value
}


function normalizeMoney(value: string) {
  if (!value) return ''
  const cleaned = value.replace(/,/g, '').trim()
  const numeric = cleaned.match(/[0-9]+(?:\.[0-9]{1,2})?/)?.[0]
  return numeric ? `₹${numeric}` : value
}

function monthDateMatch(text: string) {
  const months: Record<string, string> = { jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03', apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07', aug: '08', august: '08', sep: '09', sept: '09', september: '09', oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12' }
  const match = text.match(/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*,?\s*(20\d{2})\b/i)
  if (!match) return ''
  return `${match[3]}-${months[match[2].toLowerCase()]}-${match[1].padStart(2, '0')}`
}

function maskSensitive(text: string) {
  return text
    .replace(/\b(otp|pin|password|cvv)\s*[:\-]?\s*[A-Za-z0-9@#$%*!]{3,}/gi, '$1: [hidden]')
    .replace(/\b\d{12,19}\b/g, (value) => `${value.slice(0, 4)}••••${value.slice(-4)}`)
}

function qualityHints(input: OcrAutofillInput, text: string) {
  const hints: string[] = []
  if (input.fileSize && input.fileSize < 15_000) hints.push('File bahut small lag raha hai; screenshot low-resolution ho sakta hai.')
  if (input.mimeType?.startsWith('image/') && !input.dataUrl) hints.push('Image data read nahi hua; notes fallback use hua.')
  if (text.length < 40) hints.push('Visible text kam hai; amount/date/ID manually verify karein.')
  if (/blur|unclear|cropped|cut/i.test(text)) hints.push('Image blurred/cropped ho sakti hai; full clear screenshot upload karein.')
  return hints
}

function likelyCompany(text: string) {
  return firstMatch(text, [
    /(Amazon|Flipkart|Paytm|PhonePe|Google Pay|GPay|SBI|HDFC|ICICI|Axis|Airtel|Jio|Myntra|Meesho|Zomato|Swiggy|IRCTC|MakeMyTrip|EaseMyTrip|Ajio|Nykaa)/i,
    /(?:paid to|merchant|seller|company|bank|from|to)\s*[:\-]?\s*([A-Za-z0-9 &._-]{3,45})/i
  ])
}

export function fallbackOcrAutofill(input: OcrAutofillInput): OcrAutofillResult {
  const raw = `${input.fileName || ''} ${input.rawNotes || ''}`.replace(/\s+/g, ' ').trim()
  const amount = normalizeMoney(firstMatch(raw, [/₹\s?([0-9,]+(?:\.\d{1,2})?)/i, /(?:rs\.?|inr)\s*([0-9,]+(?:\.\d{1,2})?)/i, /(?:amount|paid|debit|deducted|total|refund|txn amount|order total)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.\d{1,2})?)/i]))
  const transactionId = firstMatch(raw, [/(?:utr|upi ref|txn id|transaction id|order id|reference id|ref no|rrn|bank ref|payment id)\s*[:#\-]?\s*([A-Z0-9\-_/]{6,})/i, /\b([A-Z0-9]{10,24})\b/])
  const date = normalizeDate(firstMatch(raw, [/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/, /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/])) || monthDateMatch(raw)
  const companyName = likelyCompany(raw)
  const lower = raw.toLowerCase()
  const isFraud = /fraud|scam|unauthori[sz]ed|otp|phishing|unknown transaction/.test(lower)
  const isBank = /bank|debit|credited|deducted|account|upi|utr|rrn/.test(lower)
  const isRefund = /refund|return|cancel|failed|not received|pending/.test(lower)
  const complaintType = isFraud ? 'UPI fraud' : isBank ? 'Bank debit issue' : isRefund ? 'Refund not received' : 'Defective product'
  const vpa = firstMatch(raw, [/(?:vpa|upi id)\s*[:\-]?\s*([a-z0-9._-]+@[a-z0-9._-]+)/i, /\b([a-z0-9._-]+@[a-z0-9._-]+)\b/i])
  const found = [amount, transactionId, date, companyName, vpa].filter(Boolean).length
  const confidenceScore = Math.min(100, 20 + found * 18 + (input.dataUrl ? 8 : 0) + ((input.rawNotes || '').length > 60 ? 8 : 0))
  const warnings = [
    !input.dataUrl && 'Image upload nahi mila. Notes/file name se best-effort extraction hua.',
    input.mimeType?.includes('pdf') && 'PDF ka actual OCR browser/server dependency ke bina limited hai. Important text notes me paste karein.',
    !companyName && 'Company/bank/app name detect nahi hua. Complaint form me manually add karein.',
    !transactionId && 'Order/transaction/reference ID detect nahi hua.',
    !amount && 'Amount detect nahi hua.',
    !date && 'Date detect nahi hui.',
    /otp|pin|password|cvv/i.test(raw) && 'Sensitive OTP/PIN/password/CVV detected. Public complaint me sensitive data hide karein.',
    ...qualityHints(input, raw)
  ].filter(Boolean) as string[]

  return {
    companyName: companyName || 'Not detected',
    transactionId: transactionId || 'Not detected',
    amount: amount || 'Not detected',
    issueDate: date || 'Not detected',
    complaintType,
    description: raw ? `Proof/notes ke basis par issue: ${maskSensitive(raw).slice(0, 650)}` : 'Uploaded proof ke basis par complaint draft create karna hai.',
    desiredResolution: isFraud ? 'Money recovery/status update aur account safety action chahiye' : isRefund ? 'Refund/status update chahiye' : 'Written resolution/status update chahiye',
    evidenceSummary: `${input.fileName ? `File: ${input.fileName}. ` : ''}${input.mimeType ? `Type: ${input.mimeType}. ` : ''}${vpa ? `UPI ID/VPA detected: ${vpa}. ` : ''}${input.rawNotes ? `Notes: ${maskSensitive(input.rawNotes).slice(0, 500)}` : ''}`,
    confidenceScore,
    warnings,
    nextSteps: [
      'Extracted fields ko manually verify karo, especially amount/date/ID.',
      'Complaint autofill button se complaint page open karo.',
      'Proof screenshot/invoice ko dashboard document vault me save karo.',
      isFraud ? 'Fraud case me bank/cyber official channel ko immediately report karo.' : 'Written complaint send karke acknowledgement save karo.'
    ],
    disclaimer
  }
}

async function callOpenAIVision(input: OcrAutofillInput) {
  if (!process.env.OPENAI_API_KEY || !input.dataUrl || !input.mimeType?.startsWith('image/')) return null
  const prompt = `Extract complaint autofill details from this proof screenshot/invoice/payment image. Return STRICT JSON only with keys: companyName, transactionId, amount, issueDate, complaintType, description, desiredResolution, evidenceSummary, confidenceScore, warnings, nextSteps, disclaimer. Prefer complaintType from: Refund not received, Defective product, Wrong item delivered, Bank debit issue, UPI wrong transfer, UPI fraud, Mobile recharge failed, Electricity bill issue, Delivery scam, Education fee refund, Travel booking refund, Insurance claim delay. Keep IDs exactly. Language instruction: ${buildLanguageInstruction(input.language)}. User notes: ${input.rawNotes || 'none'}. Document type: ${input.documentType || 'payment proof'}. Never expose OTP/PIN/password.`
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: input.dataUrl } }] }]
    })
  }).catch(() => null)
  if (!res?.ok) return null
  const data = await res.json().catch(() => null)
  const raw = data?.choices?.[0]?.message?.content
  if (!raw) return null
  const parsed = ocrAutofillResultSchema.safeParse(safeJsonParse(raw, null))
  return parsed.success ? parsed.data : null
}

async function callGeminiVision(input: OcrAutofillInput) {
  if (!process.env.GEMINI_API_KEY || !input.dataUrl || !input.mimeType?.startsWith('image/')) return null
  const base64 = input.dataUrl.split(',')[1]
  if (!base64) return null
  const model = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const prompt = `Extract complaint autofill details from this Indian invoice/payment/support screenshot. Return JSON only with keys: companyName, transactionId, amount, issueDate, complaintType, description, desiredResolution, evidenceSummary, confidenceScore, warnings, nextSteps, disclaimer. ${buildLanguageInstruction(input.language)} User notes: ${input.rawNotes || 'none'}. Never expose OTP/PIN/password.`
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: input.mimeType, data: base64 } }] }]
    })
  }).catch(() => null)
  if (!res?.ok) return null
  const data = await res.json().catch(() => null)
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) return null
  const parsed = ocrAutofillResultSchema.safeParse(safeJsonParse(raw, null))
  return parsed.success ? parsed.data : null
}

export async function analyzeOcrAutofill(input: OcrAutofillInput) {
  const openai = await callOpenAIVision(input)
  if (openai) return { result: { ...openai, disclaimer }, provider: 'openai-vision' }
  const gemini = await callGeminiVision(input)
  if (gemini) return { result: { ...gemini, disclaimer }, provider: 'gemini-vision' }
  return { result: fallbackOcrAutofill(input), provider: 'fallback-heuristic' }
}
