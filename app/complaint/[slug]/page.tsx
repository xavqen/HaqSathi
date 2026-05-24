import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoPageView } from '@/components/seo/seo-page-view'
import { seoSeedPages } from '@/lib/seo/seed-pages'

export function generateStaticParams() {
  return seoSeedPages.filter((p) => p.type === 'complaint').map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'complaint' && p.slug === resolved.slug)
  if (!page) return { title: 'Guide not found' }
  return { title: page.title, description: page.metaDescription, alternates: { canonical: '/complaint/' + page.slug } }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'complaint' && p.slug === resolved.slug)
  if (!page) notFound()
  return <SeoPageView page={page} />
}
