import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/article/ArticleCard';
import { articlesAPI, categoriesAPI } from '@/lib/api';
import { Article, Category } from '@/types';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    const tagName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return {
        title: `${tagName} News | Global News`,
        description: `Read the latest news and articles about ${tagName} on Global News.`,
        openGraph: {
            title: `${tagName} News`,
            description: `Comprehensive coverage of ${tagName} related stories.`,
        }
    };
}

export default async function TagPage({ params }: Props) {
    const slug = (await params).slug;
    // Note: The backend uses tag names or IDs, but often we query by the tag string
    // In our system, tags in articles are just an array of strings. 
    // We'll treat the slug as the tag name for fetching.
    const tagName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    let articles: Article[] = [];
    let categories: Category[] = [];
    let loadingError = false;

    try {
        const [articlesRes, categoriesRes] = await Promise.all([
            articlesAPI.getAll({
                tag: tagName,
                limit: 20,
                status: 'published'
            }),
            categoriesAPI.getAll().catch(() => ({ success: false, data: [] }))
        ]);

        if (articlesRes.success && articlesRes.data) {
            articles = articlesRes.data;
        }
        if (categoriesRes.success && categoriesRes.data) {
            categories = categoriesRes.data;
        }
    } catch (err) {
        console.error('Failed to fetch articles for tag:', tagName);
        loadingError = true;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header initialCategories={categories} />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-[1200px]">
                <header className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="flex items-center gap-2 text-sm text-[#C4161C] dark:text-[#E5484D] font-semibold uppercase tracking-widest mb-4">
                        <span className="w-8 h-[1px] bg-current"></span>
                        Topic
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold">#{tagName}</h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
                        A curated collection of the latest stories, analysis, and updates related to <strong>{tagName}</strong>.
                    </p>
                </header>

                {articles.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-xl text-gray-500 dark:text-gray-400">No articles found for this topic yet.</p>
                        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
                            Browse all latest news
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
