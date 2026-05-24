import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoPageView } from '@/components/seo/seo-page-view'
import { seoSeedPages } from '@/lib/seo/seed-pages'

export function generateStaticParams() {
  return seoSeedPages.filter((p) => p.type === 'bank-complaint').map((p) => ({ bank: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ bank: string }> }): Promise<Metadata> {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'bank-complaint' && p.slug === resolved.bank)
  if (!page) return { title: 'Guide not found' }
  return { title: page.title, description: page.metaDescription, alternates: { canonical: '/bank-complaint/' + page.slug } }
}

export default async function Page({ params }: { params: Promise<{ bank: string }> }) {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'bank-complaint' && p.slug === resolved.bank)
  if (!page) notFound()
  return <SeoPageView page={page} />
}
