import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryClientPage from '@/components/category/CategoryClientPage';
import { categoriesAPI, articlesAPI } from '@/lib/api';
import { Category, Article } from '@/types';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const slug = (await params).slug;
    // We could fetch category name here too if we want perfect metadata
    return {
        title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} News | Global News`,
    };
}

export default async function CategoryPage({ params }: Props) {
    const slug = (await params).slug;

    // Fetch Category, Categories (for Header), and Articles (for initial render)
    let category: Category | null = null;
    let categories: Category[] = [];
    let initialArticles: Article[] = [];

    try {
        const [catRes, categoriesRes] = await Promise.all([
            categoriesAPI.getBySlug(slug).catch(() => ({ success: false, data: null })),
            categoriesAPI.getAll().catch(() => ({ success: false, data: [] }))
        ]);

        if (catRes.success && catRes.data) category = catRes.data;
        if (categoriesRes.success && categoriesRes.data) categories = categoriesRes.data;

        // If we found the category, fetch its initial articles
        if (category) {
            const articlesRes = await articlesAPI.getAll({
                category: category._id,
                limit: 12
            }).catch(() => ({ success: false, data: [] }));

            if (articlesRes.success && articlesRes.data) initialArticles = articlesRes.data;
        }

    } catch (error) {
        console.error('Initial fetch failed', error);
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header initialCategories={categories} />
            <CategoryClientPage
                slug={slug}
                initialCategory={category}
                initialArticles={initialArticles}
            />
            <Footer />
        </div>
    );
}
