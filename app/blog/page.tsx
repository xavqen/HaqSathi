import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { blogSeedPosts } from '@/lib/blog/seed-posts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Guides', description: 'Complaint, refund, schemes aur documents ke practical guides.' }

export default async function Page() {
  const posts = await db.blogPost.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 50 }).catch(() => [])
  const list = posts.length ? posts : blogSeedPosts.map(p => ({ ...p, id: p.slug, publishedAt: new Date(), tags: p.tags }))
  return <main className="mx-auto max-w-6xl px-4 py-12"><div className="mb-8"><p className="text-sm font-bold text-emerald-700">HaqSathi Guides</p><h1 className="mt-2 text-4xl font-black tracking-tight">Simple guides for complaints, refunds, documents and schemes</h1><p className="mt-3 max-w-2xl text-slate-600">Practical guides with checklists, draft formats and safe next steps.</p></div><div className="grid gap-5 md:grid-cols-3">{list.map(post => <Card key={post.slug} className="h-full"><CardHeader><p className="text-xs font-bold uppercase text-emerald-700">{post.category}</p><CardTitle>{post.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Read guide</Link></CardContent></Card>)}</div></main>
}
