import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/dashboard', '/write'],
    },
    sitemap: 'https://siragii.com/sitemap.xml',
  };
}
