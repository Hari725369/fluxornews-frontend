'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArticleClientPage from '@/components/article/ArticleClientPage';

export default function PreviewArticle() {
    const router = useRouter();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get article data from sessionStorage
        const previewData = sessionStorage.getItem('articlePreview');
        if (previewData) {
            try {
                const parsedArticle = JSON.parse(previewData);
                setArticle(parsedArticle);
            } catch (error) {
                console.error('Failed to parse preview data:', error);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
                <div className="text-center">
                    <p className="text-xl text-gray-900 dark:text-white mb-4">No preview data found</p>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Preview Banner */}
            <div className="sticky top-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium shadow-md">
                📝 PREVIEW MODE - This article is not published yet
                <button
                    onClick={() => window.close()}
                    className="ml-4 px-3 py-1 bg-black text-yellow-500 rounded text-xs hover:bg-gray-800"
                >
                    Close Preview
                </button>
            </div>

            {/* Render article using ArticleClientPage */}
            <ArticleClientPage
                article={article}
                relatedArticles={[]}
                trendingArticles={[]}
            />
        </>
    );
}
