export function planDisplayName(plan?: string | null) {
  switch (plan) {
    case 'PRO': return 'Premium'
    case 'FAMILY': return 'Family Plus'
    case 'AGENT': return 'Agent Pro'
    default: return 'Free Plan'
  }
}

export function planCtaLabel(plan?: string | null) {
  switch (plan) {
    case 'PRO': return 'Premium'
    case 'FAMILY': return 'Family'
    case 'AGENT': return 'Agent'
    default: return 'Upgrade'
  }
}

export function planBadgeClass(plan?: string | null) {
  switch (plan) {
    case 'PRO': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'FAMILY': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'AGENT': return 'bg-violet-100 text-violet-800 border-violet-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}
