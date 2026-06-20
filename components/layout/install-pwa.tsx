'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, RefreshCcw, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' | string }>
}

type InstallPwaCardProps = {
  compact?: boolean
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

export function InstallPwaCard({ compact = false }: InstallPwaCardProps) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    setInstalled(isStandaloneMode())

    const handler = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const appInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    const appUpdated = () => setUpdated(true)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', appInstalled)
    window.addEventListener('haqsathi:pwa-updated', appUpdated)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalled)
      window.removeEventListener('haqsathi:pwa-updated', appUpdated)
    }
  }, [])

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice.catch(() => undefined)
    if (choice?.outcome === 'accepted') setInstalled(true)
    setPromptEvent(null)
  }

  function reloadForUpdate() {
    window.location.reload()
  }

  if (installed && !updated) return null

  return (
    <div className={cn('rounded-[1.75rem] border border-emerald-100 bg-white shadow-soft', compact ? 'p-4' : 'p-5 sm:p-6')}>
      <div className={cn('flex items-start gap-4', compact ? 'sm:items-center' : '')}>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          {updated ? <RefreshCcw className="h-5 w-5" /> : <Smartphone className="h-6 w-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-emerald-700">{updated ? 'Update ready' : 'Mobile ready'}</p>
          <h3 className={cn('mt-1 font-black text-slate-950', compact ? 'text-lg' : 'text-xl')}>{updated ? 'Refresh for latest version' : 'Install like an app'}</h3>
          <p className={cn('mt-2 leading-6 text-slate-600', compact ? 'text-xs sm:text-sm' : 'text-sm')}>
            {updated
              ? 'A newer HaqSathi shell is ready. Refresh once to use the safer offline cache.'
              : promptEvent
                ? 'One tap install is available on this browser. Good for fast mobile access to chat and tools.'
                : 'Use browser menu → Add to Home Screen / Install App. Android Chrome shows a direct install button when ready.'}
          </p>
          <div className={cn('mt-4 flex flex-col gap-2 sm:flex-row', compact ? 'sm:mt-0 sm:justify-end' : '')}>
            {updated ? (
              <Button type="button" onClick={reloadForUpdate} className="w-full sm:w-auto">
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            ) : promptEvent ? (
              <Button type="button" onClick={install} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Install App
              </Button>
            ) : (
              <div className="inline-flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> Offline fallback and install support are active.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
