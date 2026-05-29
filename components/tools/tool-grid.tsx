'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { publicTools, toolCategories, type ToolCategory } from '@/lib/tools/catalog'
import type { ShellDictionary } from '@/lib/i18n/dictionaries'
import { translateCategory } from '@/lib/i18n/dictionaries'

export function ToolGrid({ dictionary }: { dictionary?: ShellDictionary['tools'] }) {
  const labels = dictionary || {
    searchPlaceholder: 'Search complaint, UPI, refund, document, scam...',
    categories: {},
    openWorkflow: 'Open workflow',
    noResult: 'No tool found. Try refund, UPI, document, scam, proof or legal.'
  } as ShellDictionary['tools']
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ToolCategory | 'All'>('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return publicTools.filter((tool) => {
      const matchesCategory = category === 'All' || tool.category === category
      const matchesQuery = !q || `${tool.title} ${tool.desc} ${tool.category}`.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <div>
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-soft sm:p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={labels.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-400" />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {(['All', ...toolCategories] as const).map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${category === item ? 'border-emerald-200 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{labels.categories[item] || item}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"><Sparkles className="h-5 w-5" /></span>
              {tool.badge ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{tool.badge}</span> : null}
            </div>
            <div className="mt-5 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{translateCategory(tool.category, { tools: labels } as ShellDictionary)}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.desc}</p>
            </div>
            <p className="mt-5 text-sm font-black text-emerald-700">{labels.openWorkflow} →</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? <div className="mt-6 rounded-3xl border bg-white p-8 text-center text-slate-600">{labels.noResult}</div> : null}
    </div>
  )
}
