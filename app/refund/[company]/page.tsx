import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoPageView } from '@/components/seo/seo-page-view'
import { seoSeedPages } from '@/lib/seo/seed-pages'

export function generateStaticParams() {
  return seoSeedPages.filter((p) => p.type === 'refund').map((p) => ({ company: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ company: string }> }): Promise<Metadata> {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'refund' && p.slug === resolved.company)
  if (!page) return { title: 'Guide not found' }
  return { title: page.title, description: page.metaDescription, alternates: { canonical: '/refund/' + page.slug } }
}

export default async function Page({ params }: { params: Promise<{ company: string }> }) {
  const resolved = await params
  const page = seoSeedPages.find((p) => p.type === 'refund' && p.slug === resolved.company)
  if (!page) notFound()
  return <SeoPageView page={page} />
}
