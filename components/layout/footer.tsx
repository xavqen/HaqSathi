import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-bold">HaqSathi AI</div>
          <p className="mt-2 max-w-xl text-sm text-slate-600">Aapka haq, complaint, refund, documents aur schemes — sab simple language me. This is guidance, not legal advice.</p>
        </div>
        <div>
          <div className="font-semibold">Tools</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/complaint">Complaint Generator</Link>
            <Link href="/upi-help">UPI Help</Link>
            <Link href="/documents">Document Checklist</Link>
          </div>
        </div>
        <div>
          <div className="font-semibold">Legal</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/status">Status</Link>
            <Link href="/changelog">Changelog</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
