import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { CaseTaskForm } from '@/components/forms/case-task-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const [tasks, complaints] = await Promise.all([
    db.caseTask.findMany({ where: { userId: user.id }, include: { complaint: { select: { companyName: true, type: true } } }, orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }] }),
    db.complaint.findMany({ where: { userId: user.id }, select: { id: true, type: true, companyName: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  ])
  const todo = tasks.filter((t) => t.status !== 'DONE')
  const done = tasks.filter((t) => t.status === 'DONE')
  return <div><h1 className="text-3xl font-black">Action Plan</h1><p className="mt-2 text-slate-600">Track every complaint next action, deadline and priority in one place.</p><div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]"><Card><CardHeader><CardTitle>Add Task</CardTitle></CardHeader><CardContent><CaseTaskForm complaints={complaints} /></CardContent></Card><div className="grid gap-6"><Card><CardHeader><CardTitle>Open Tasks ({todo.length})</CardTitle></CardHeader><CardContent className="space-y-3">{todo.length ? todo.map((task) => <div key={task.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center gap-2"><b>{task.title}</b><Badge>{task.priority}</Badge><Badge>{task.status}</Badge></div>{task.complaint && <p className="mt-1 text-sm text-slate-600">Linked: {task.complaint.companyName} · {task.complaint.type}</p>}{task.dueDate && <p className="text-sm text-slate-600">Due: {task.dueDate.toLocaleDateString('en-IN')}</p>}{task.notes && <p className="mt-2 text-sm">{task.notes}</p>}</div>) : <p className="text-slate-500">No open tasks.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Completed ({done.length})</CardTitle></CardHeader><CardContent className="space-y-3">{done.length ? done.map((task) => <div key={task.id} className="rounded-2xl border p-4 text-sm"><b>{task.title}</b><p className="text-slate-500">Completed / done board</p></div>) : <p className="text-slate-500">No completed tasks.</p>}</CardContent></Card></div></div></div>
}
