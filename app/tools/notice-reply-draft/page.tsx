import { NoticeReplyForm } from '@/components/forms/notice-reply-form'
export const metadata = { title: 'Notice Reply Draft', description: 'General notice/communication reply draft builder.' }
export default function Page(){ return <main className="bg-slate-50"><section className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-4xl font-black">Notice reply draft</h1><p className="mt-3 text-slate-600">Simple, safe response draft. Legal advice nahi.</p><div className="mt-8"><NoticeReplyForm /></div></section></main> }
