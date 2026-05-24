import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
export function DisclaimerBanner(){ return <div className="border-b bg-amber-50 text-amber-950"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs sm:text-sm"><ShieldAlert className="h-4 w-4 shrink-0"/><p><strong>Guidance only:</strong> HaqSathi AI official government/legal authority nahi hai. Final action se pehle official portal, bank, company ya expert se verify karein. <Link href="/disclaimer" className="font-bold underline">Disclaimer</Link></p></div></div> }
