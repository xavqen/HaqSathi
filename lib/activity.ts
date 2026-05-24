import { db } from '@/lib/db'

export async function logActivity(input: { userId?: string | null; action: string; entity: string; entityId?: string | null; metadata?: unknown }) {
  try {
    await db.userActivity.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId || null,
        metadata: input.metadata === undefined ? undefined : input.metadata as object
      }
    })
  } catch {
    // Activity logging must never break the user flow.
  }
}
