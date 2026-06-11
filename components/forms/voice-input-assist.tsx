'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Mic, MicOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SpeechRecognitionAlternative = { transcript: string; confidence: number }
type SpeechRecognitionResult = { isFinal: boolean; 0: SpeechRecognitionAlternative }
type SpeechRecognitionResultList = { length: number; [index: number]: SpeechRecognitionResult }
type SpeechRecognitionEvent = { results: SpeechRecognitionResultList }
type SpeechRecognitionErrorEvent = { error?: string; message?: string }
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

const SENSITIVE_WARNING = 'Do not speak OTP, passwords, full bank details, card numbers or secret IDs.'

function cleanTranscript(value: string) {
  return value
    .replace(/\b\d{6}\b/g, '[6-digit-code-hidden]')
    .replace(/\b\d{12,19}\b/g, '[long-number-hidden]')
    .replace(/\s+/g, ' ')
    .trim()
}

export function VoiceInputAssist({ onApply }: { onApply: (text: string) => void }) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('Tap mic and speak your issue. Review before applying.')

  const locale = useMemo(() => {
    if (typeof navigator === 'undefined') return 'en-IN'
    return navigator.language || 'en-IN'
  }, [])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(Boolean(SpeechRecognition))
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      setMessage('Voice input is not supported in this browser. Please type manually.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = locale
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event) => {
      let nextTranscript = ''
      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0]?.transcript || ''
      }
      setTranscript(cleanTranscript(nextTranscript))
    }
    recognition.onerror = (event) => {
      setListening(false)
      setMessage(event.error ? `Voice input stopped: ${event.error}` : 'Voice input stopped. Please try again or type manually.')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    setTranscript('')
    setMessage('Listening... speak slowly and avoid private secrets.')
    setListening(true)
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
    setMessage('Stopped. Review transcript before applying.')
  }

  function resetTranscript() {
    recognitionRef.current?.abort()
    setListening(false)
    setTranscript('')
    setMessage('Transcript cleared. You can speak again or type manually.')
  }

  function applyTranscript() {
    if (!transcript.trim()) return
    onApply(transcript.trim())
    setMessage('Transcript applied to issue description. Please review before generating draft.')
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-emerald-900">Voice input assist</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">{supported ? message : 'Voice input is not supported here. Manual typing still works.'}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant={listening ? 'default' : 'secondary'} className="min-h-11" onClick={listening ? stopListening : startListening}>
            {listening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {listening ? 'Stop' : 'Speak'}
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={resetTranscript}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
        <AlertTriangle className="mr-1 inline h-4 w-4 align-text-bottom" />{SENSITIVE_WARNING}
      </div>
      {transcript ? (
        <div className="mt-3 rounded-xl border bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Transcript preview</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{transcript}</p>
          <Button type="button" className="mt-3 min-h-11 w-full sm:w-auto" onClick={applyTranscript}>Apply to description</Button>
        </div>
      ) : null}
    </div>
  )
}
