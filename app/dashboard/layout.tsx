import type { ReactNode } from 'react'
import { requireUser } from '@/lib/auth/session'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function Layout({ children }: { children: ReactNode }) {
  await requireUser()
  return <DashboardShell>{children}</DashboardShell>
}
