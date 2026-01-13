import { MetadataRoute } from 'next';
import { articlesAPI, categoriesAPI } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Core pages
    const routes = [
        '',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    try {
        // 1. Fetch Categories
        const catResponse = await categoriesAPI.getAll();
        const categoryRoutes = (catResponse.data || []).map((cat: any) => ({
            url: `${baseUrl}/category/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8, // Increased priority
        }));

        // 2. Fetch Articles
        const artResponse = await articlesAPI.getAll({ limit: 1000, status: 'published' });
        const articles = artResponse.data || [];

        const articleRoutes = articles.map((art: any) => ({
            url: `${baseUrl}/article/${art.slug}`,
            lastModified: new Date(art.updatedAt || art.createdAt),
            changeFrequency: 'daily' as const, // News articles change? No, but comments/updates might.
            priority: 0.9, // High priority for SEO
        }));

        // 3. Extract and Process Tags safely
        const uniqueTags = new Set<string>();
        articles.forEach(art => {
            if (Array.isArray(art.tags)) {
                art.tags.forEach(t => {
                    // Handle both string tags and populated object tags
                    const tagName = typeof t === 'string' ? t : (t as any).name;
                    if (tagName) uniqueTags.add(tagName);
                });
            }
        });

        const tagRoutes = Array.from(uniqueTags).map(tag => ({
            url: `${baseUrl}/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...routes, ...categoryRoutes, ...articleRoutes, ...tagRoutes];
    } catch (err) {
        console.error('Failed to generate sitemap:', err);
        return routes;
    }
}
