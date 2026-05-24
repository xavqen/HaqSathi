import { callScriptSchema } from '@/lib/validators/phase13'

export type CallScriptInput = ReturnType<typeof callScriptSchema.parse>

function disclaimer() {
  return 'Disclaimer: Ye guidance hai, legal advice nahi. OTP, PIN, card CVV, password kabhi share mat karein. Official portal/authority se details verify karein.'
}

export function generateCallScript(input: CallScriptInput) {
  const greeting = input.language === 'ENGLISH'
    ? 'Hello, my name is _____. I am calling about my unresolved issue.'
    : input.language === 'HINDI'
      ? 'Namaste, mera naam _____ hai. Main apni pending problem ke baare me call kar raha/rahi hoon.'
      : 'Namaste, mera naam _____ hai. Main apne unresolved issue ke liye call kar raha/rahi hoon.'

  const script = [
    greeting,
    `Issue type: ${input.issueType}`,
    `Short case: ${input.caseSummary}`,
    input.previousAttempts ? `Previous attempts: ${input.previousAttempts}` : 'Previous attempts: Complaint/communication record available hai.',
    `Meri request: ${input.desiredOutcome}`,
    'Kripya mujhe complaint/reference number, expected resolution date, aur next escalation step bata dijiye.',
    'Main call ke baad written confirmation email/message bhi bhejunga/bhejungi.'
  ].join('\n\n')

  const beforeCallChecklist = [
    'Order ID / Transaction ID / complaint ID ready rakho',
    'Date, amount, company/bank name exact likh lo',
    'Screenshots, emails, SMS, payment proof ready rakho',
    'Call recording laws/consent apne state/rules ke hisaab se follow karo',
    'Calm tone rakho; threat ya abusive words avoid karo'
  ]

  const afterCallNotes = [
    'Officer/agent ka naam likho',
    'Call time aur duration note karo',
    'Reference number save karo',
    'Promise date/follow-up date dashboard reminder me add karo',
    'Same summary email/support ticket me send karo'
  ]

  const followUpMessage = `Hello, today I contacted ${input.authorityType} regarding ${input.issueType}. Summary: ${input.caseSummary}. Requested resolution: ${input.desiredOutcome}. Please confirm complaint/reference number and expected resolution timeline. ${disclaimer()}`

  return { script, beforeCallChecklist, afterCallNotes, followUpMessage, disclaimer: disclaimer() }
}
