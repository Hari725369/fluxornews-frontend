import { Article } from '@/types';
import { articlesAPI, categoriesAPI } from '@/lib/api';
import { Metadata } from 'next';
import ArticleClientPage from '@/components/article/ArticleClientPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    const response = await articlesAPI.getBySlug(slug);
    const article = response.data;

    if (!article) return { title: 'Article Not Found' };

    return {
        title: `${article.title} | Global News`,
        description: article.content.replace(/<[^>]*>/g, '').substring(0, 160),
        openGraph: {
            title: article.title,
            description: article.content.replace(/<[^>]*>/g, '').substring(0, 160),
            images: [article.featuredImage || ''],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.content.replace(/<[^>]*>/g, '').substring(0, 160),
            images: [article.featuredImage || ''],
        },
    };
}

export default async function ArticlePage({ params }: Props) {
    const slug = (await params).slug;

    // Fetch primary article & categories in parallel
    const [articleRes, categoriesRes] = await Promise.all([
        articlesAPI.getBySlug(slug).catch(() => ({ success: false, data: null })),
        categoriesAPI.getAll().catch(() => ({ success: false, data: [] }))
    ]);

    const article = articleRes.data;
    const categories = categoriesRes.data || [];

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header initialCategories={categories} />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-[1200px]">
                    <div className="max-w-4xl mx-auto text-center py-16">
                        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                            The article you're looking for doesn't exist.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-600 transition font-sans"
                        >
                            Go Back Home
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Fetch related articles (Smart Backend Logic)
    let relatedArticles: Article[] = [];
    if (article._id) {
        try {
            const relatedRes = await articlesAPI.getRelated(article._id);
            if (relatedRes.success && relatedRes.data) {
                relatedArticles = relatedRes.data;
            }
        } catch (err) {
            console.error('Failed to fetch related articles', err);
        }
    }

    // Fetch trending articles
    let trendingArticles: Article[] = [];
    try {
        const trendingResponse = await articlesAPI.getAll({
            isTrending: true,
            limit: 5,
            status: 'published'
        });
        if (trendingResponse.success && trendingResponse.data) {
            trendingArticles = trendingResponse.data.filter((a: Article) => a._id !== article._id).slice(0, 5);
        }
    } catch (err) {
        console.error('Failed to fetch trending articles');
    }

    // JSON-LD for Search Engines
    const getSafeImageUrl = (url: string) => {
        if (!url || url.startsWith('file://')) {
            return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
        }
        return url;
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': article.title,
        'image': [getSafeImageUrl(article.featuredImage)],
        'datePublished': article.publishedAt || article.createdAt,
        'dateModified': article.updatedAt || article.createdAt,
        'author': [{
            '@type': 'Person',
            'name': article.author?.name || 'Admin',
        }]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleClientPage article={article} relatedArticles={relatedArticles} trendingArticles={trendingArticles} initialCategories={categories} />
        </>
    );
}
