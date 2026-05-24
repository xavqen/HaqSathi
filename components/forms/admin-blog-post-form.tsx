'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Initial = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  category?: string
  tags?: unknown
  content?: unknown
  faqs?: unknown
  status?: string
}

type Content = { intro?: string; sections?: { heading: string; body: string; bullets?: string[] }[] }
type Faq = { question: string; answer: string }

function getTags(value: unknown) { return Array.isArray(value) ? value.join(', ') : '' }
function getContent(value: unknown): Content { return value && typeof value === 'object' ? value as Content : {} }
function getFaqs(value: unknown): Faq[] { return Array.isArray(value) ? value as Faq[] : [] }

export function AdminBlogPostForm({ initial }: { initial?: Initial }) {
  const router = useRouter()
  const content = getContent(initial?.content)
  const faqs = getFaqs(initial?.faqs)
  const [title, setTitle] = useState(initial?.title || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '')
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [tags, setTags] = useState(getTags(initial?.tags))
  const [intro, setIntro] = useState(content.intro || '')
  const [sections, setSections] = useState((content.sections || [{ heading: '', body: '', bullets: [] }]).map(s => `${s.heading}\n${s.body}\n${(s.bullets || []).join('\n')}`).join('\n---\n'))
  const [faqText, setFaqText] = useState(faqs.map(f => `${f.question}\n${f.answer}`).join('\n---\n'))
  const [status, setStatus] = useState(initial?.status || 'PUBLISHED')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setLoading(true)
    setError(null)
    const sectionRows = sections.split('\n---\n').map(block => block.split('\n').map(v => v.trim()).filter(Boolean)).filter(block => block.length >= 2).map(block => ({ heading: block[0], body: block[1], bullets: block.slice(2) }))
    const faqRows = faqText.split('\n---\n').map(block => block.split('\n').map(v => v.trim()).filter(Boolean)).filter(block => block.length >= 2).map(block => ({ question: block[0], answer: block.slice(1).join(' ') }))
    const res = await fetch(initial?.id ? `/api/admin/blog-posts/${initial.id}` : '/api/admin/blog-posts', {
      method: initial?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, excerpt, metaTitle, metaDescription, category, tags: tags.split(',').map(t => t.trim()).filter(Boolean), intro, sections: sectionRows, faqs: faqRows, status })
    })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Save failed')
    router.push('/admin/blog')
    router.refresh()
  }

  return <div className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft"><div className="grid gap-4 md:grid-cols-2"><Field label="Title" value={title} setValue={setTitle} /><Field label="Slug" value={slug} setValue={setSlug} /><Field label="Meta title" value={metaTitle} setValue={setMetaTitle} /><Field label="Category" value={category} setValue={setCategory} /></div><Field label="Excerpt" value={excerpt} setValue={setExcerpt} /><div className="grid gap-2"><Label>Meta description</Label><Textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} /></div><Field label="Tags comma separated" value={tags} setValue={setTags} /><div className="grid gap-2"><Label>Intro</Label><Textarea value={intro} onChange={e => setIntro(e.target.value)} className="min-h-28" /></div><div className="grid gap-2"><Label>Sections: heading, body, bullets. Separate sections with ---</Label><Textarea value={sections} onChange={e => setSections(e.target.value)} className="min-h-56" /></div><div className="grid gap-2"><Label>FAQs: question line then answer line. Separate FAQs with ---</Label><Textarea value={faqText} onChange={e => setFaqText(e.target.value)} className="min-h-36" /></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={status === 'PUBLISHED'} onChange={e => setStatus(e.target.checked ? 'PUBLISHED' : 'DRAFT')} /> Published</label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save blog post'}</Button></div>
}

function Field({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return <div className="grid gap-2"><Label>{label}</Label><Input value={value} onChange={e => setValue(e.target.value)} /></div>
}
