import { addDays, startOfDay, endOfDay } from 'date-fns'
import { db } from '@/lib/db'
import { sendTransactionalEmail } from '@/lib/email/service'

export async function queueDueReminderNotifications(daysAhead = 1) {
  const from = startOfDay(new Date())
  const to = endOfDay(addDays(new Date(), daysAhead))

  const reminders = await db.reminder.findMany({
    where: { status: 'PENDING', dueDate: { gte: from, lte: to } },
    include: { user: { select: { id: true, email: true, name: true } }, relatedComplaint: { select: { companyName: true, type: true } } },
    orderBy: { dueDate: 'asc' },
    take: 100
  })

  let queued = 0
  let sent = 0
  for (const reminder of reminders) {
    const exists = await db.reminderNotification.findFirst({
      where: { reminderId: reminder.id, channel: 'EMAIL', status: { in: ['QUEUED', 'SENT'] } },
      select: { id: true }
    })
    if (exists) continue

    const notification = await db.reminderNotification.create({
      data: {
        userId: reminder.userId || null,
        reminderId: reminder.id,
        channel: 'EMAIL',
        status: 'QUEUED',
        payload: {
          title: reminder.title,
          dueDate: reminder.dueDate.toISOString(),
          complaint: reminder.relatedComplaint ? `${reminder.relatedComplaint.companyName} - ${reminder.relatedComplaint.type}` : null
        }
      }
    })
    queued++

    if (reminder.user?.email) {
      const result = await sendTransactionalEmail({
        to: reminder.user.email,
        subject: `Reminder: ${reminder.title}`,
        template: 'REMINDER_DUE',
        userId: reminder.user.id,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HaqSathi AI Reminder</h2><p>Hi ${reminder.user.name || 'there'},</p><p><b>${reminder.title}</b> ka follow-up due hai.</p><p>Due date: ${reminder.dueDate.toDateString()}</p><p>Dashboard open karke next action complete karein.</p><p style="font-size:12px;color:#64748b">This is guidance only, not legal advice.</p></div>`,
        text: `Reminder: ${reminder.title}. Due date: ${reminder.dueDate.toDateString()}`
      })
      if (result.ok && !result.skipped) {
        await db.reminderNotification.update({ where: { id: notification.id }, data: { status: 'SENT', sentAt: new Date() } })
        sent++
      }
    }
  }

  return { scanned: reminders.length, queued, sent }
}
