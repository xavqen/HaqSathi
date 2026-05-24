export function ArticleSchema({ title, description, slug, publishedAt }: { title: string; description: string; slug: string; publishedAt?: Date | string | null }) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    author: { '@type': 'Organization', name: 'HaqSathi AI' },
    publisher: { '@type': 'Organization', name: 'HaqSathi AI' },
    mainEntityOfPage: `${base}/blog/${slug}`
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
