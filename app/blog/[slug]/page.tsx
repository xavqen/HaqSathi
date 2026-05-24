import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { blogSeedPosts } from '@/lib/blog/seed-posts'
import { ArticleSchema } from '@/components/seo/article-schema'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import { FaqSchema } from '@/components/seo/faq-schema'

export const dynamic = 'force-dynamic'
type Content = { intro?: string; sections?: { heading: string; body: string; bullets?: string[] }[] }
type Faq = { question: string; answer: string }

async function getPost(slug: string) {
  const dbPost = await db.blogPost.findUnique({ where: { slug } }).catch(() => null)
  if (dbPost && dbPost.status === 'PUBLISHED') return dbPost
  const seed = blogSeedPosts.find(p => p.slug === slug)
  if (!seed) return null
  return { ...seed, id: seed.slug, status: 'PUBLISHED', publishedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Guide not found' }
  return { title: post.metaTitle, description: post.metaDescription, alternates: { canonical: '/blog/' + post.slug } }
}

export function generateStaticParams() {
  return blogSeedPosts.map(post => ({ slug: post.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const content = post.content as Content
  const faqs = (post.faqs || []) as Faq[]
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return <main className="mx-auto max-w-3xl px-4 py-12"><ArticleSchema title={post.title} description={post.metaDescription} slug={post.slug} publishedAt={post.publishedAt} /><BreadcrumbSchema items={[{ name: 'Home', url: base }, { name: 'Guides', url: `${base}/blog` }, { name: post.title, url: `${base}/blog/${post.slug}` }]} /><FaqSchema faqs={faqs} /><p className="text-sm font-bold text-emerald-700">{post.category}</p><h1 className="mt-2 text-4xl font-black tracking-tight">{post.title}</h1><p className="mt-4 text-lg text-slate-700">{content.intro}</p><div className="mt-8 space-y-8">{(content.sections || []).map(section => <section key={section.heading} className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">{section.heading}</h2><p className="mt-3 text-slate-700">{section.body}</p>{section.bullets?.length ? <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{section.bullets.map(item => <li key={item}>{item}</li>)}</ul> : null}</section>)}</div>{faqs.length ? <section className="mt-10"><h2 className="text-2xl font-black">FAQ</h2><div className="mt-4 space-y-3">{faqs.map(faq => <details key={faq.question} className="rounded-2xl border bg-white p-4"><summary className="font-bold">{faq.question}</summary><p className="mt-2 text-slate-600">{faq.answer}</p></details>)}</div></section> : null}<div className="mt-10 flex flex-wrap gap-3"><Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate My Complaint</Link><Link href="/chat" className="rounded-xl border px-5 py-3 font-semibold">Ask AI Assistant</Link></div></main>
}
