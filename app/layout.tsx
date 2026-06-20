import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { DeferredClientRuntime } from '@/components/layout/deferred-client-runtime'
import { getSiteUrl } from '@/lib/utils'
// DeferredClientRuntime mounts PwaRegister, RouteProgress, AnalyticsScripts, FirstPartyAnalytics, ClientErrorListener, FloatingFeedback, CookieConsent and MobileBottomActions after idle.

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'HaqSathi AI - Complaint, Refund, UPI, Documents and Schemes Helper',
    template: '%s | HaqSathi AI'
  },
  description: 'AI-powered India-focused helper for complaints, refunds, UPI issues, documents and government schemes. English by default with multi-language support.',
  alternates: { canonical: '/' },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg'
  },
  openGraph: {
    title: 'HaqSathi AI',
    description: 'Complaint, refund, UPI, documents and schemes guidance in a simple mobile-first workflow.',
    type: 'website',
    siteName: 'HaqSathi AI'
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN" dir="ltr" data-scroll-behavior="smooth" data-app-language="ENGLISH" className={inter.variable}>
      <body className="min-w-0 overflow-x-clip font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <DisclaimerBanner />
        <Navbar />
        <div id="main-content" tabIndex={-1} className="min-w-0 focus:outline-none">
          {children}
        </div>
        <Footer />
        <DeferredClientRuntime />
      </body>
    </html>
  )
}
