import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { blogPostSchema } from '@/lib/validators/blog'
import { logActivity } from '@/lib/activity'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const resolved = await params
  const json = await req.json().catch(() => null)
  const parsed = blogPostSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid blog post', details: parsed.error.flatten() }, { status: 400 })
  const { intro, sections, faqs, ...rest } = parsed.data
  const existing = await db.blogPost.findUnique({ where: { id: resolved.id }, select: { publishedAt: true } })
  const post = await db.blogPost.update({
    where: { id: resolved.id },
    data: { ...rest, content: { intro, sections }, faqs, publishedAt: rest.status === 'PUBLISHED' ? (existing?.publishedAt || new Date()) : null }
  })
  await logActivity({ userId: admin.id, action: 'UPDATE', entity: 'BlogPost', entityId: post.id })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const resolved = await params
  await db.blogPost.delete({ where: { id: resolved.id } })
  await logActivity({ userId: admin.id, action: 'DELETE', entity: 'BlogPost', entityId: resolved.id })
  return NextResponse.json({ ok: true })
}
