'use client'
import { useEffect } from 'react'
export function PwaRegister(){ useEffect(()=>{ if(process.env.NEXT_PUBLIC_ENABLE_PWA!=='true')return; if(!('serviceWorker' in navigator))return; window.addEventListener('load',()=>{ navigator.serviceWorker.register('/sw.js').catch(()=>undefined) }) },[]); return null }
