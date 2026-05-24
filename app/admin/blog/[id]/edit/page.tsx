import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminBlogPostForm } from '@/components/forms/admin-blog-post-form'

export const dynamic = 'force-dynamic'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await db.blogPost.findUnique({ where: { id } })
  if (!post) notFound()
  return <div><h1 className="text-3xl font-black">Edit Blog Post</h1><p className="mt-2 text-slate-600">Update SEO guide content.</p><div className="mt-6"><AdminBlogPostForm initial={post} /></div></div>
}
