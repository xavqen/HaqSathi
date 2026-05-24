import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { templateUseSchema } from '@/lib/validators/template'
import { renderTemplate } from '@/lib/templates/render'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const json = await req.json().catch(() => null)
  const parsed = templateUseSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid template input', details: parsed.error.flatten() }, { status: 400 })

  const template = await db.template.findUnique({ where: { slug: parsed.data.slug } })
  if (!template) return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 })

  if (template.isPremium && (!user || user.plan === 'FREE')) {
    return NextResponse.json({ ok: false, error: 'Premium template. Upgrade required.' }, { status: 402 })
  }

  const output = renderTemplate(template.body, parsed.data.inputs)
  const use = await db.templateUse.create({ data: { userId: user?.id, templateId: template.id, inputs: parsed.data.inputs, output } })
  await db.template.update({ where: { id: template.id }, data: { usageCount: { increment: 1 } } })
  if (user) await logActivity({ userId: user.id, action: 'USE', entity: 'Template', entityId: template.id })

  return NextResponse.json({ ok: true, output, useId: use.id })
}
