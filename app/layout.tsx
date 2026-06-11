import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
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
import { FirstPartyAnalytics } from '@/components/layout/first-party-analytics'
import { MobileBottomActions } from '@/components/layout/mobile-bottom-actions'
import { RouteProgress } from '@/components/layout/route-progress'
import { getLanguageHtmlSettings, normalizeLanguageCode } from '@/lib/i18n/languages'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'HaqSathi AI - Complaint, Refund, UPI, Documents and Schemes Helper',
    template: '%s | HaqSathi AI'
  },
  description: 'AI-powered India-focused helper for complaints, refunds, UPI issues, documents and government schemes. English by default with multi-language support.',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg'
  },
  openGraph: {
    title: 'HaqSathi AI',
    description: 'Complaint, refund, UPI, documents and schemes guidance in a simple mobile-first workflow.',
    type: 'website'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#047857',
  colorScheme: 'light'
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const store = await cookies()
  const language = normalizeLanguageCode(store.get('haqsathi_language')?.value)
  const htmlSettings = getLanguageHtmlSettings(language)

  return (
    <html lang={htmlSettings.htmlLang} dir={htmlSettings.dir} data-scroll-behavior="smooth" data-app-language={language}>
      <body className="min-w-0 overflow-x-clip">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <PwaRegister />
        <RouteProgress />
        <AnalyticsScripts />
        <FirstPartyAnalytics />
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
