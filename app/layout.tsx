import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { FloatingFeedback } from '@/components/layout/floating-feedback'
import { PwaRegister } from '@/components/layout/pwa-register'
import { ClientErrorListener } from '@/components/layout/client-error-listener'
import { CookieConsent } from '@/components/layout/cookie-consent'
import { AnalyticsScripts } from '@/components/layout/analytics-scripts'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://haqsathi-ai.vercel.app'),
  title: {
    default: 'HaqSathi AI - Complaint, Refund, Documents aur Schemes Helper',
    template: '%s | HaqSathi AI'
  },
  verification: {
    google: 't6vNWWPIElU-JxUI1qO1MUARshpmRQGlZrRC2oVNFqU',
  },
  description: 'AI-powered India-focused helper for complaints, refunds, UPI issues, documents and government schemes in simple Hinglish.',
  // Add this block below
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'HaqSathi AI',
    description: 'Aapka haq, complaint, refund, documents aur schemes — sab simple language me.',
    type: 'website'
  }
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body>
        <PwaRegister />
        <AnalyticsScripts />
        <ClientErrorListener />
        <DisclaimerBanner />
        <Navbar />
        {children}
        <Footer />
        <FloatingFeedback />
        <CookieConsent />
      </body>
    </html>
  )
}
