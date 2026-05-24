import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/auth/session'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function Layout({ children }: { children: ReactNode }) {
  await requireAdmin()
  return <AdminShell>{children}</AdminShell>
}
