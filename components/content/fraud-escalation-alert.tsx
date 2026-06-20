import Link from 'next/link'
import { AlertTriangle, ExternalLink, PhoneCall } from 'lucide-react'

type FraudEscalationAlertProps = {
  compact?: boolean
  className?: string
}

export function FraudEscalationAlert({ compact = false, className = '' }: FraudEscalationAlertProps) {
  return (
    <div className={`rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-red-950 shadow-sm sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-black">For UPI fraud / unauthorized transactions, act immediately:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm font-semibold leading-6">
            <li>Call the National Cyber Crime Helpline: <a href="tel:1930" className="font-black underline decoration-red-400 underline-offset-4"><PhoneCall className="mr-1 inline h-4 w-4 align-text-bottom" />1930</a></li>
            <li>Report online at <Link href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="font-black underline decoration-red-400 underline-offset-4">cybercrime.gov.in <ExternalLink className="inline h-3.5 w-3.5" /></Link></li>
            <li>Inform your bank / UPI app immediately — RBI customer-liability rules give strongest protection when unauthorized transactions are reported quickly, including zero liability in eligible third-party breach cases reported within 3 working days.</li>
          </ul>
          {!compact ? (
            <p className="mt-3 text-sm leading-6 text-red-900">Use HaqSathi AI to prepare your bank complaint and evidence, but do not wait for AI before reporting fraud through official channels.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
