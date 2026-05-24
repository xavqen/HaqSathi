import { db } from '@/lib/db'

export async function buildUserDataExport(userId: string) {
  const [user, complaints, schemeSearches, documentChecklists, reminders, familyProfiles, agentClients, vaultItems, supportTickets, activity] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true, updatedAt: true } }),
    db.complaint.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.schemeSearch.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.documentChecklist.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.reminder.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.familyProfile.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.agentClient.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.documentVaultItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.supportTicket.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.userActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 })
  ])

  return { exportedAt: new Date().toISOString(), user, complaints, schemeSearches, documentChecklists, reminders, familyProfiles, agentClients, vaultItems, supportTickets, activity }
}
