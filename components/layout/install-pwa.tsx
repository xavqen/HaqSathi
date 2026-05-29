'use client'
import { useEffect, useState } from 'react'
import { Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function InstallPwaCard() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); setPromptEvent(event as BeforeInstallPromptEvent) }
    const appInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', appInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', appInstalled) }
  }, [])

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    await promptEvent.userChoice.catch(() => undefined)
    setPromptEvent(null)
  }

  return (
    <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Smartphone className="h-6 w-6" /></div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-emerald-700">Mobile ready</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Install like an app</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Android/Chrome users can add HaqSathi AI to the home screen. The offline page is already ready.</p>
          <Button className="mt-4 w-full sm:w-auto" onClick={install} disabled={!promptEvent || installed}><Download className="mr-2 h-4 w-4" /> {installed ? 'Installed' : promptEvent ? 'Install App' : 'Install prompt appears on supported devices'}</Button>
        </div>
      </div>
    </div>
  )
}
