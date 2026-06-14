import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/forms/contact-form'

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = { title: 'Contact', description: 'Contact HaqSathi AI.' }
export default function Page() { return <main className="mx-auto max-w-3xl px-4 py-12"><Card><CardHeader><CardTitle className="text-3xl">Contact</CardTitle></CardHeader><CardContent><ContactForm /></CardContent></Card></main> }
