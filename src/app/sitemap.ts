import { MetadataRoute } from 'next';
import { dbService } from '@/services/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://siragii.com';
  
  // Static paths
  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/trending',
    '/audio',
    '/categories',
    '/search',
    '/write',
    '/login',
    '/register'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  try {
    const poems = await dbService.getPoems('published');
    const poemRoutes = poems.map((poem) => ({
      url: `${baseUrl}/poem/${poem.id}`,
      lastModified: new Date(poem.updatedAt || poem.createdAt).toISOString().split('T')[0],
      changeFrequency: 'weekly' as const,
      priority: 0.6
    }));

    const categories = await dbService.getCategories();
    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

    return [...routes, ...poemRoutes, ...categoryRoutes];
  } catch {
    return routes;
  }
}
