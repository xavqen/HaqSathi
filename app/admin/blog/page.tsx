import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 }).catch(() => [])
  return <div><div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Blog Posts</h1><p className="mt-2 text-slate-600">SEO guides and article engine.</p></div><Link href="/admin/blog/new" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Add post</Link></div><Card className="mt-6"><CardHeader><CardTitle>All posts</CardTitle></CardHeader><CardContent className="space-y-3">{posts.length ? posts.map(post => <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><b>{post.title}</b><p className="text-sm text-slate-600">/{post.slug} · {post.category} · {post.status}</p></div><div className="flex gap-3"><Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-slate-700">View</Link><Link href={`/admin/blog/${post.id}/edit`} className="text-sm font-semibold text-emerald-700">Edit</Link></div></div>) : <p className="text-slate-500">No DB posts yet. Seed posts still render publicly.</p>}</CardContent></Card></div>
}
