'use client'

import { CopyButton } from '@/components/ui/copy-button'

export function AdvancedToolResult({ result }: { result: Record<string, any> }) {
  const mainText = result.draft || result.complaintSummary || result.coverNote || ''
  return (
    <div className="mt-6 space-y-4 rounded-3xl border bg-white p-5 shadow-soft">
      {result.title && <h2 className="text-2xl font-black">{result.title}</h2>}
      {mainText && <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><b>Generated draft</b><CopyButton text={String(mainText)} /></div><pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{String(mainText)}</pre></div>}
      {result.affidavitSkeleton && <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><b>Affidavit skeleton</b><CopyButton text={String(result.affidavitSkeleton)} /></div><pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{String(result.affidavitSkeleton)}</pre></div>}
      {Array.isArray(result.evidenceIndex) && <List title="Evidence index" items={result.evidenceIndex.map((x: any) => typeof x === 'string' ? x : `${x.number}. ${x.name} → ${x.fileNameSuggestion}`)} />}
      {Array.isArray(result.checklist) && <List title="Checklist" items={result.checklist} />}
      {Array.isArray(result.actions) && <List title="Urgent actions" items={result.actions} />}
      {Array.isArray(result.nextSteps) && <List title="Next steps" items={result.nextSteps} />}
      {result.stage && <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">Stage: {String(result.stage)}</p>}
      {result.disclaimer && <p className="text-xs text-slate-500">{String(result.disclaimer)}</p>}
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><b>{title}</b><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}
