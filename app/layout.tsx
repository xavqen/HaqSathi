import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  applicationName: 'HaqSathi AI', // <-- ADDED THIS: Google ko batane ke liye
  title: {
    default: 'HaqSathi AI - Complaint, Refund, Documents aur Schemes Helper',
    template: '%s | HaqSathi AI'
  },
  verification: {
    google: 't6vNWWPIElU-JxUI1qO1MUARshpmRQGlZrRC2oVNFqU',
  },
  description: 'AI-powered India-focused helper for complaints, refunds, UPI issues, documents and government schemes in simple Hinglish.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    siteName: 'HaqSathi AI', // <-- ADDED THIS: Social aur search engine ke liye site name
    title: 'HaqSathi AI',
    description: 'Aapka haq, complaint, refund, documents aur schemes — sab simple language me.',
    type: 'website',
    url: 'https://www.haqsathi.site', // <-- ADDED THIS: Exact URL
  }
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {

  // <-- ADDED THIS: JSON-LD Schema (Google Bot ke padhne ke liye)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "HaqSathi AI",
    "alternateName": ["HaqSathi", "Haq Sathi", "HaqSathi AI"],
    "url": "https://www.haqsathi.site/"
  };

  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      {/* <-- ADDED THIS: Head section jisme script jayegi --> */}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6053916771324222"
          crossOrigin="anonymous"></script>
      </head>
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