'use client';

import { Poem } from '@/types';

interface JsonLdProps {
  poem?: Poem;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function JsonLd({ poem, breadcrumbs }: JsonLdProps) {
  const baseUrl = 'https://siragii.com';

  const schema: any = [];

  if (poem) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': poem.title,
      'alternativeHeadline': poem.categoryName,
      'genre': 'poetry',
      'keywords': poem.tags.join(','),
      'inLanguage': poem.language,
      'datePublished': poem.createdAt,
      'dateModified': poem.updatedAt || poem.createdAt,
      'author': {
        '@type': 'Person',
        'name': poem.authorName,
        'url': `${baseUrl}/profile`
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Siragii',
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/logo.png`
        }
      },
      'description': poem.content.slice(0, 150)
    });
  }

  if (breadcrumbs) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((b, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': b.label,
        'item': b.href ? `${baseUrl}${b.href}` : undefined
      }))
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
