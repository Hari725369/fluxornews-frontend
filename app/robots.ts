import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    // Use environment variable or fallback to production URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fluxor.news';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // Disallow admin and api routes
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
