import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { cookies } from 'next/headers'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { FloatingFeedback } from '@/components/layout/floating-feedback'
import { PwaRegister } from '@/components/layout/pwa-register'
import { ClientErrorListener } from '@/components/layout/client-error-listener'
import { CookieConsent } from '@/components/layout/cookie-consent'
import { AnalyticsScripts } from '@/components/layout/analytics-scripts'
import { MobileBottomActions } from '@/components/layout/mobile-bottom-actions'
import { getLanguageHtmlSettings, normalizeLanguageCode } from '@/lib/i18n/languages'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'HaqSathi AI - Complaint, Refund, UPI, Documents and Schemes Helper',
    template: '%s | HaqSathi AI'
  },
  description: 'AI-powered India-focused helper for complaints, refunds, UPI issues, documents and government schemes. English by default with multi-language support.',
  openGraph: {
    title: 'HaqSathi AI',
    siteName: 'HaqSathi AI', // <-- ADDED THIS: Social aur search engine ke liye site name
    url: 'https://www.haqsathi.site', // <-- ADDED THIS: Exact URL
    description: 'Complaint, refund, UPI, documents and schemes guidance in a simple mobile-first workflow.',
    type: 'website'
  },
  icons: {
    icon: '/icon.svg',
  },
  other: {
    "google-adsense-account": "ca-pub-6053916771324222" // Apni asli ID yahan rakhein
  }
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const store = await cookies()
  const language = normalizeLanguageCode(store.get('haqsathi_language')?.value)
  const htmlSettings = getLanguageHtmlSettings(language)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "HaqSathi AI",
    "alternateName": ["HaqSathi", "Haq Sathi", "HaqSathi AI"],
    "url": "https://www.haqsathi.site/"
  };


  return (
    <html lang={htmlSettings.htmlLang} dir={htmlSettings.dir} data-scroll-behavior="smooth" data-app-language={language}>
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
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <PwaRegister />
        <AnalyticsScripts />
        <ClientErrorListener />
        <DisclaimerBanner />
        <Navbar />
        <div id="main-content" tabIndex={-1} className="min-w-0 focus:outline-none">
          {children}
        </div>
        <Footer />
        <FloatingFeedback />
        <CookieConsent />
        <MobileBottomActions />
      </body>
    </html>
  )
}
