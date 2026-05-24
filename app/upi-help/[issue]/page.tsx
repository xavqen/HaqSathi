import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoPageView } from '@/components/seo/seo-page-view'
import { seoSeedPages } from '@/lib/seo/seed-pages'

export function generateStaticParams() {
  return seoSeedPages.filter((p) => p.type === 'upi-help').map((p) => ({ issue: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ issue: string }> }): Promise<Metadata> {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'upi-help' && p.slug === resolved.issue)
  if (!page) return { title: 'Guide not found' }
  return { title: page.title, description: page.metaDescription, alternates: { canonical: '/upi-help/' + page.slug } }
}

export default async function Page({ params }: { params: Promise<{ issue: string }> }) {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'upi-help' && p.slug === resolved.issue)
  if (!page) notFound()
  return <SeoPageView page={page} />
}
