import { safeJsonParse } from '@/lib/utils'
import { complaintOutputSchema, type ComplaintInput, type ComplaintOutput } from '@/lib/validators/complaint'
import { complaintSystemPrompt, complaintUserPrompt } from '@/lib/ai/prompts'
import { buildLanguageInstruction } from '@/lib/ai/language-instructions'
import { hardenComplaintOutput, reviewAiOutput } from '@/lib/ai/safety'

function fallbackComplaint(input: ComplaintInput): ComplaintOutput {
  const idLine = input.transactionId ? `Reference/Transaction ID: ${input.transactionId}` : 'Reference/Transaction ID: Not provided'
  const amountLine = input.amount ? `Amount: ₹${input.amount}` : 'Amount: Not provided'
  const dateLine = input.issueDate ? `Issue Date: ${input.issueDate}` : 'Issue Date: Not provided'
  const common = `I am raising this complaint regarding ${input.type} with ${input.companyName}. ${idLine}. ${amountLine}. ${dateLine}. Issue: ${input.description}. I request: ${input.desiredResolution}.`

  return {
    shortComplaint: `${common} Kindly check and resolve this issue at the earliest.`,
    formalEmail: `Subject: Complaint regarding ${input.type} - ${input.companyName}\n\nDear Support Team,\n\n${common}\n\nI have already tried to resolve this through normal support${input.previousCommunication ? `: ${input.previousCommunication}` : '.'}\n\nPlease investigate and provide a written update with resolution timeline.\n\nRegards,\nCustomer`,
    consumerHelplineFormat: `Complaint Type: ${input.type}\nCompany: ${input.companyName}\n${idLine}\n${amountLine}\n${dateLine}\nProblem Details: ${input.description}\nResolution Requested: ${input.desiredResolution}\nPrevious Communication: ${input.previousCommunication || 'None'}`,
    companySupportMessage: `Hi ${input.companyName} team, ${common} Please resolve and update me with ticket/status details.`,
    followUpMessage: `This is a follow-up on my complaint about ${input.type}. ${idLine}. I have not received a satisfactory resolution yet. Please provide status and expected resolution date.`,
    legalNoticeStyleDraft: `Draft only - not legal advice.\n\nTo,\n${input.companyName}\n\nSubject: Formal notice-style draft regarding ${input.type}\n\nI, the customer, am recording my grievance: ${common}\n\nYou are requested to resolve this issue and provide a written response within a reasonable time. If unresolved, I may approach the appropriate grievance/consumer forum after verifying the correct legal process.`,
    checklist: ['Screenshot/order invoice/payment proof', 'Transaction ID/order ID', 'Bank/app statement if payment related', 'Support chat/email screenshots', 'Date-wise timeline of issue'],
    nextSteps: ['Copy the formal email and send to support/grievance email', 'Save all proof in one folder', 'Set a reminder for follow-up after 3-7 days', 'Verify official complaint portal before submitting sensitive data'],
    disclaimer: input.type.toLowerCase().includes('fraud') ? 'This is guidance, not legal advice. For cyber fraud/UPI fraud, contact official emergency channels and your bank immediately.' : 'This is guidance, not legal advice. Verify details on the official company/government portal before taking action.'
  }
}

async function callOpenAI(system: string, user: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  })

  if (!res.ok) return null
  const data = await res.json()
  return data?.choices?.[0]?.message?.content as string | undefined
}

async function callGemini(system: string, user: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      contents: [{ role: 'user', parts: [{ text: user }] }]
    })
  })

  if (!res.ok) return null
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
}

export async function generateComplaintDraft(input: ComplaintInput, languageCode = 'ENGLISH') {
  const languageInstruction = buildLanguageInstruction(languageCode)
  const system = `${complaintSystemPrompt()}\nLanguage instruction: ${languageInstruction}`
  const user = complaintUserPrompt(input)
  let raw: string | null | undefined = null

  raw = await callOpenAI(system, user)
  if (!raw) raw = await callGemini(system, user)

  if (!raw) {
    const data = hardenComplaintOutput(fallbackComplaint(input), user)
    return { data, provider: 'fallback' as const, safetyReview: reviewAiOutput(data, user) }
  }

  const parsed = complaintOutputSchema.safeParse(safeJsonParse(raw, null))
  if (!parsed.success) {
    const data = hardenComplaintOutput(fallbackComplaint(input), user)
    return { data, provider: 'fallback-invalid-ai' as const, safetyReview: reviewAiOutput(data, user) }
  }

  const data = hardenComplaintOutput(parsed.data, user)
  return { data, provider: process.env.OPENAI_API_KEY ? 'openai' as const : 'gemini' as const, safetyReview: reviewAiOutput(data, user) }
}

export async function generateRefundComplaint(input: ComplaintInput, languageCode = 'ENGLISH') {
  return generateComplaintDraft({ ...input, type: 'Refund not received' }, languageCode)
}

export function generateFollowUpMessage(companyName: string, referenceId?: string) {
  return `Dear ${companyName || 'Support Team'}, I am following up on my earlier complaint${referenceId ? ` (Reference: ${referenceId})` : ''}. Please share current status and expected resolution timeline in writing. Thank you.`
}
