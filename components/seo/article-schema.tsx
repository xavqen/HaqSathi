import { absoluteUrl } from '@/lib/utils'
export function ArticleSchema({ title, description, slug, publishedAt }: { title: string; description: string; slug: string; publishedAt?: Date | string | null }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    author: { '@type': 'Organization', name: 'HaqSathi AI' },
    publisher: { '@type': 'Organization', name: 'HaqSathi AI' },
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`)
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
