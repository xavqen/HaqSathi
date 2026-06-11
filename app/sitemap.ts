import type { MetadataRoute } from 'next'
import { seoSeedPages } from '@/lib/seo/seed-pages'
import { templateSeedItems } from '@/lib/templates/seed-templates'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const staticRoutes = ['', '/complaint', '/refund', '/upi-help', '/cyber-fraud', '/bank-complaint', '/scheme-finder', '/documents', '/chat', '/templates', '/tools', '/tools/chargeback-helper', '/tools/proof-quality-scanner', '/tools/service-center-locator', '/tools/family-case-switchboard', '/tools/privacy-redactor', '/tools/evidence-timeline-builder', '/tools/public-post-safety', '/tools/agent-revenue-simulator', '/tools/scam-radar', '/tools/rights-explainer', '/tools/refund-negotiation', '/tools/authority-router-pro', '/issue-trends', '/safety-alerts', '/tools/loan-app-harassment-planner', '/tools/job-salary-dispute-planner', '/tools/education-form-correction-planner', '/tools/travel-refund-cancellation-planner', '/tools/medical-bill-dispute-planner', '/tools/telecom-sim-complaint-planner', '/tools/courier-parcel-dispute-planner', '/tools/bank-account-freeze-planner', '/tools/vehicle-challan-dispute-planner', '/tools/identity-document-correction-planner', '/tools/lost-document-report-planner', '/tools/document-expiry-planner', '/tools/call-visit-logbook', '/tools/proof-file-organizer', '/tools/deadline-appeal-planner', '/tools/warranty-claim-planner', '/tools/return-pickup-planner', '/tools/utility-bill-dispute-planner', '/tools/insurance-claim-planner', '/tools/rent-deposit-dispute-planner', '/tools/smart-complaint-wizard', '/tools/submission-pack', '/tools/ocr-autofill', '/tools/document-reader', '/tools/case-coach', '/tools/follow-up-automation', '/tools/language-draft-translator', '/tools/mobile-readiness', '/language-hub', '/tools/deadline-calculator', '/tools/complaint-strength-checker', '/tools/evidence-checklist', '/tools/risk-assessment', '/tools/application-tracker', '/tools/legal-notice-draft', '/tools/rti-helper', '/tools/consumer-forum-pack', '/tools/bank-escalation', '/tools/ombudsman-planner', '/tools/call-script-generator', '/tools/sla-planner', '/tools/grievance-route-finder', '/tools/fee-refund-calculator', '/tools/appeal-draft', '/authority-directory', '/state-guides', '/success-stories', '/filing-guides', '/emergency', '/resources', '/official-sources', '/partners', '/knowledge-base', '/tools/notice-reply-draft', '/tools/status-message-builder', '/tools/document-gap-analyzer', '/search', '/pricing', '/blog', '/contact', '/about', '/privacy', '/terms', '/disclaimer', '/final-launch-checklist', '/offline']
    .map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: route === '' ? 1 : 0.8 }))

  const seoRoutes = seoSeedPages.map((page) => {
    const prefix = page.type === 'bank-complaint' ? '/bank-complaint' : page.type === 'upi-help' ? '/upi-help' : `/${page.type}`
    return { url: `${base}${prefix}/${page.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 }
  })

  const dbTemplateRoutes = await db.template.findMany({ select: { slug: true, updatedAt: true } })
    .then((items) => items.map((item) => ({ url: `${base}/templates/${item.slug}`, lastModified: item.updatedAt, changeFrequency: 'monthly' as const, priority: 0.65 })))
    .catch(() => templateSeedItems.map((item) => ({ url: `${base}/templates/${item.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.65 })))

  const blogRoutes = await db.blogPost.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } })
    .then((posts) => posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt, changeFrequency: 'monthly' as const, priority: 0.65 })))
    .catch(() => [])


  const filingGuideRoutes = await db.officialFilingGuide.findMany({ select: { slug: true, updatedAt: true } })
    .then((guides) => guides.map((guide) => ({ url: `${base}/filing-guides/${guide.slug}`, lastModified: guide.updatedAt, changeFrequency: 'monthly' as const, priority: 0.65 })))
    .catch(() => [])


  const stateGuideRoutes = await db.stateGuide.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
    .then((guides) => guides.map((guide) => ({ url: `${base}/state-guides/${guide.slug}`, lastModified: guide.updatedAt, changeFrequency: 'monthly' as const, priority: 0.65 })))
    .catch(() => [])

  const schemeRoutes = await db.scheme.findMany({ where: { isActive: true }, select: { state: true, slug: true, updatedAt: true } })
    .then((schemes) => schemes.map((scheme) => ({ url: `${base}/scheme/${scheme.state.toLowerCase().replaceAll(' ', '-')}/${scheme.slug}`, lastModified: scheme.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })))
    .catch(() => [])

  const playbookRoutes = await db.playbookArticle.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } })
    .then((items) => items.map((item) => ({ url: `${base}/knowledge-base/${item.slug}`, lastModified: item.updatedAt, changeFrequency: 'monthly' as const, priority: 0.65 })))
    .catch(() => [])

  return [...staticRoutes, ...seoRoutes, ...schemeRoutes, ...blogRoutes, ...dbTemplateRoutes, ...filingGuideRoutes, ...stateGuideRoutes, ...playbookRoutes]
}
