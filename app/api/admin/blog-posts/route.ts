import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { blogPostSchema } from '@/lib/validators/blog'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  const json = await req.json().catch(() => null)
  const parsed = blogPostSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid blog post', details: parsed.error.flatten() }, { status: 400 })
  const { intro, sections, faqs, ...rest } = parsed.data
  const post = await db.blogPost.create({
    data: { ...rest, authorId: admin.id, content: { intro, sections }, faqs, publishedAt: rest.status === 'PUBLISHED' ? new Date() : null }
  })
  await logActivity({ userId: admin.id, action: 'CREATE', entity: 'BlogPost', entityId: post.id })
  return NextResponse.json({ ok: true, id: post.id })
}
