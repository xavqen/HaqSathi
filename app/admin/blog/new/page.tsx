import { AdminBlogPostForm } from '@/components/forms/admin-blog-post-form'

export default function Page() {
  return <div><h1 className="text-3xl font-black">Add Blog Post</h1><p className="mt-2 text-slate-600">Create a practical guide with schema-ready FAQ.</p><div className="mt-6"><AdminBlogPostForm /></div></div>
}
