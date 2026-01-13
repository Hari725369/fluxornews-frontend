'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/article/ArticleCard';
import Button from '@/components/ui/Button';
import { Article, Category } from '@/types';
import { articlesAPI, categoriesAPI } from '@/lib/api';

interface CategoryClientPageProps {
    slug: string;
    initialCategory?: Category | null;
    initialArticles?: Article[];
}

export default function CategoryClientPage({ slug, initialCategory, initialArticles }: CategoryClientPageProps) {
    const [category, setCategory] = useState<Category | null>(initialCategory || null);
    const [articles, setArticles] = useState<Article[]>(initialArticles || []);
    const [loading, setLoading] = useState(!initialCategory);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // If slug changes, re-fetch category if not provided
    useEffect(() => {
        if (!initialCategory || category?.slug !== slug) {
            fetchCategory();
        } else {
            setCategory(initialCategory);
        }
    }, [slug, initialCategory]);

    // Fetch articles when category or page changes
    useEffect(() => {
        if (category) {
            // If it's the first page and we have initialArticles, we might skip fetch?
            // But we need to handle pagination.
            // If page 1 and initialArticles provided, use them?
            if (page === 1 && initialArticles && category.slug === slug && articles.length === 0) {
                setArticles(initialArticles);
                setLoading(false);
            } else {
                fetchArticles();
            }
        }
    }, [category, page]);

    const fetchCategory = async () => {
        try {
            const response = await categoriesAPI.getBySlug(slug);
            if (response.success && response.data) {
                setCategory(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch category:', error);
        }
    };

    const fetchArticles = async () => {
        setLoading(true);
        try {
            if (!category) return;

            const response = await articlesAPI.getAll({
                category: category._id,
                page,
                limit: 12,
            });

            if (response.success && response.data) {
                setArticles(response.data);
                setTotalPages(response.pages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!category && !loading) {
        return (
            <main className="flex-1 container mx-auto px-4 py-16 text-center max-w-[1200px]">
                <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
                <p className="text-gray-600">The category you're looking for doesn't exist.</p>
            </main>
        );
    }

    return (
        <main className="flex-1 container mx-auto px-4 py-8 max-w-[1200px]">
            {/* Articles Grid */}
            <div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No articles found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {articles.map((article) => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </div>

            {/* Explore by Topic - Show tags related to current view */}
            {articles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold uppercase text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-2">
                        Topics in {category?.name || 'Category'}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {Array.from(new Set(articles.flatMap(a => a.tags))).slice(0, 10).map(tag => (
                            <Link
                                key={tag}
                                href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium hover:border-[#C4161C] dark:hover:border-[#E5484D] hover:text-[#C4161C] dark:hover:text-[#E5484D] transition-all"
                            >
                                #{tag}
                            </Link>
                        ))}

                        {/* See More / Search Link */}
                        <Link
                            href="/search"
                            className="px-5 py-2 bg-gray-100 dark:bg-white/10 border border-transparent rounded-full text-sm font-bold text-gray-900 dark:text-white hover:bg-[#C4161C] hover:text-white dark:hover:bg-[#E5484D] transition-all flex items-center gap-2"
                        >
                            See More
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <Button
                                key={i}
                                variant={page === i + 1 ? 'primary' : 'ghost'}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </main>
    );
}
