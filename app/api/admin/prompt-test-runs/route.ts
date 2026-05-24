import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { promptTestRunSchema } from '@/lib/validators/phase14'

function parseMaybeJson(value: string) {
  try { return JSON.parse(value) } catch { return { text: value } }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin()
    const json = await req.json()
    const parsed = promptTestRunSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const run = await db.promptTestRun.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        tool: parsed.data.tool,
        input: parseMaybeJson(parsed.data.input),
        output: parseMaybeJson(parsed.data.output),
        score: parsed.data.score,
        issueNotes: parsed.data.issueNotes || null
      }
    })
    return NextResponse.json({ ok: true, run })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Prompt test save failed' }, { status: 500 })
  }
}
