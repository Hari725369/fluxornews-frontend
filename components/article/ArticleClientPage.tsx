'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Article, Category } from '@/types';
import ReadingProgressBar from '@/components/article/ReadingProgressBar';
import ShareModal from '@/components/article/ShareModal';
import AudioReader from '@/components/article/AudioReader';
import HighlightedContent from '@/components/article/HighlightedContent';
import { useConfig } from '@/contexts/ConfigContext';
import { readerAPI } from '@/lib/api';
import { calculateReadTime } from '@/lib/utils';
import OnboardingModal from '@/components/auth/OnboardingModal';
import CommentSection from '@/components/comments/CommentSection';

interface ArticleClientPageProps {
    article: Article;
    relatedArticles: Article[];
    trendingArticles: Article[];
    initialCategories?: Category[];
}

export default function ArticleClientPage({ article, relatedArticles, trendingArticles, initialCategories }: ArticleClientPageProps) {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [activeCharIndex, setActiveCharIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Get site config for feature toggles
    const { config } = useConfig();

    // Get feature toggles with defaults
    const enableTags = config?.features?.enableTags ?? true;
    const enableSocialShare = config?.features?.enableSocialShare ?? true;
    const showDateTime = config?.features?.showDateTime ?? true;
    const showCountryName = config?.features?.showCountryName ?? false;
    const showAuthorName = config?.features?.showAuthorName ?? false;
    const enableSaveForLater = config?.features?.enableSaveForLater ?? true;

    const getSafeImageUrl = (url: string) => {
        if (!url || url.startsWith('file://')) {
            return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
        }
        return url;
    };

    const safeImage = getSafeImageUrl(article.featuredImage);

    // Calculate reading time
    const readingTime = calculateReadTime(article.content);

    useEffect(() => {
        // Check if article is already saved if user is logged in
        const token = localStorage.getItem('readerToken');
        if (token) {
            readerAPI.getSavedArticles().then(res => {
                if (res.success) {
                    setIsSaved(res.data.some((a: any) => a._id === article._id));
                }
            });
        }

        // Listen for auth changes
        const handleAuthChange = () => {
            const token = localStorage.getItem('readerToken');
            if (!token) setIsSaved(false);
        };
        window.addEventListener('readerAuthChange', handleAuthChange);
        return () => window.removeEventListener('readerAuthChange', handleAuthChange);
    }, [article._id]);

    const handleSave = async () => {
        const token = localStorage.getItem('readerToken');
        if (!token) {
            setIsAuthModalOpen(true);
            return;
        }

        setSaveLoading(true);
        try {
            if (isSaved) {
                const res = await readerAPI.unsaveArticle(article._id);
                if (res.success) setIsSaved(false);
            } else {
                const res = await readerAPI.saveArticle(article._id);
                if (res.success) setIsSaved(true);
            }
        } catch (err) {
            console.error('Failed to save article', err);
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <ReadingProgressBar />
            <Header initialCategories={initialCategories} />
            <OnboardingModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={article.title}
                url={`/article/${article.slug}`}
                tags={article.tags}
            />

            <main className="flex-1 py-2 md:py-4">
                <article className="container mx-auto px-4 max-w-[1200px]">
                    {/* Article Header - Focused Width */}
                    <header className="max-w-article mx-auto mb-2 text-left">
                        {/* Category Label & Back Button Row */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/?category=${(article.category && typeof article.category === 'object') ? article.category._id : (article.category || 'news')}`}
                                    className="inline-block text-primary dark:text-primary text-xs font-semibold uppercase hover:underline font-sans"
                                >
                                    {(article.category && typeof article.category === 'object') ? article.category.name : 'News'}
                                </Link>
                                {showCountryName && article.country && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-700">|</span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">
                                            {article.country}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Mobile/Desktop Back Button */}
                            <Link
                                href="/"
                                className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white uppercase flex items-center gap-1 transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back
                            </Link>
                        </div>

                        {/* Title Row */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                            <h1 className="text-[24px] font-bold leading-tight flex-1 font-serif">
                                {article.title}
                            </h1>
                        </div>

                        {/* Meta: Date & Time */}
                        {showDateTime && (
                            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 font-medium py-2 mb-8 border-y border-gray-200 dark:border-gray-800">
                                {/* Textual Metadata Group */}
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-2 font-normal text-gray-500 dark:text-gray-400">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                        {' • '}
                                        {new Date(article.publishedAt || article.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })} IST
                                    </span>

                                    {config?.features?.enableReadingTime && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-600">|</span>
                                            <span className="font-normal text-gray-500 dark:text-gray-400">{readingTime} min read</span>
                                        </>
                                    )}

                                    {showAuthorName && article.author && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-600">|</span>
                                            <span className="font-normal text-gray-500 dark:text-gray-400">
                                                By {typeof article.author === 'object' ? article.author.name : article.author}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Action Icons Group */}
                                <div className="flex items-center gap-3">
                                    {enableSaveForLater && (
                                        <button
                                            onClick={handleSave}
                                            disabled={saveLoading}
                                            className={`flex items-center justify-center transition-colors active:scale-95 ${isSaved
                                                ? 'text-primary'
                                                : 'text-gray-400 hover:text-primary'
                                                }`}
                                            aria-label={isSaved ? 'Unsave article' : 'Save for later'}
                                            title={isSaved ? 'Unsave article' : 'Save for later'}
                                        >
                                            <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </button>
                                    )}

                                    {enableSocialShare && (
                                        <button
                                            onClick={() => setIsShareModalOpen(true)}
                                            className="flex items-center justify-center transition-colors active:scale-95 text-gray-400 hover:text-primary"
                                            aria-label="Share article"
                                            title="Share article"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Featured Image & Audio Assistant */}
                    {(article.featuredImage || article.content) && (
                        <div className="max-w-article mx-auto relative mb-6">
                            <AudioReader
                                content={article.content}
                                onActiveIndexChange={setActiveIndex}
                                onWordBoundary={setActiveCharIndex}
                            />

                            {article.featuredImage && (
                                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
                                    <Image
                                        src={safeImage}
                                        alt={article.imageAlt || article.title}
                                        fill
                                        sizes="(max-width: 1200px) 100vw, 1200px"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Intro Paragraph */}
                    {article.intro && (
                        <div className="max-w-article mx-auto mb-8">
                            <p className="text-sm italic text-gray-600 dark:text-gray-300 leading-relaxed font-serif">
                                {article.intro}
                            </p>
                        </div>
                    )}

                    {/* Article Content - 680px Width */}
                    <div className="max-w-article mx-auto">
                        <HighlightedContent
                            htmlContent={article.content}
                            className="prose max-w-none text-gray-800 dark:text-gray-100
                                prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                                prose-p:leading-relaxed prose-p:mb-6 prose-p:text-gray-800 dark:prose-p:text-gray-200
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-xl prose-img:shadow-md
                                prose-strong:text-gray-900 dark:prose-strong:text-white
                                prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-6
                                prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-6
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg"
                            activeIndex={activeIndex}
                            activeCharIndex={activeCharIndex}
                            readAlsoArticles={relatedArticles}
                        />

                        <CommentSection articleId={article._id} onAuthRequested={() => setIsAuthModalOpen(true)} />

                        {/* Tags - Conditional based on config */}
                        {enableTags && article.tags && article.tags.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-neutral-200">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 font-sans">
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {article.tags.slice(0, 10).map((tag: string) => (
                                        <Link
                                            key={tag}
                                            href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="px-4 py-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] hover:border-blue-500 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium transition-all duration-200 font-sans shadow-sm"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                    {article.tags.length > 10 && (
                                        <Link
                                            href="/search"
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full text-sm font-bold transition-colors font-sans hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
                                        >
                                            See More
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}



                    </div>
                </article>
                {(relatedArticles.length > 0 || trendingArticles.length > 0) && (
                    <section className="mt-16 py-12 bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-900">
                        <div className="container mx-auto px-4 max-w-[1200px]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Related Topics (2x2 Grid) */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 font-sans">
                                        Related Topics
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {relatedArticles.map((relatedArticle: Article) => (
                                            <Link
                                                key={relatedArticle._id}
                                                href={`/article/${relatedArticle.slug}`}
                                                className="group flex flex-col"
                                            >
                                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                                                    <Image
                                                        src={getSafeImageUrl(relatedArticle.featuredImage)}
                                                        alt={relatedArticle.imageAlt || relatedArticle.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400">
                                                        {(relatedArticle.category && typeof relatedArticle.category === 'object') ? relatedArticle.category.name : 'News'}
                                                    </span>
                                                    {relatedArticle.country && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            {relatedArticle.country}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-lg leading-snug text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-2">
                                                    {relatedArticle.title}
                                                </h3>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Trending (List) */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 font-sans">
                                        Trending
                                    </h2>
                                    <div className="flex flex-col gap-6">
                                        {trendingArticles.map((trendingArticle: Article) => {
                                            // Calc read time again or reuse logic if extracted
                                            // Calc read time again or reuse logic if extracted
                                            const readTime = calculateReadTime(trendingArticle.content);

                                            return (
                                                <Link
                                                    key={trendingArticle._id}
                                                    href={`/article/${trendingArticle.slug}`}
                                                    className="group flex gap-4 items-start"
                                                >
                                                    <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                        <Image
                                                            src={getSafeImageUrl(trendingArticle.featuredImage)}
                                                            alt={trendingArticle.imageAlt || trendingArticle.title}
                                                            fill
                                                            sizes="128px"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                            <span>{new Date(trendingArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <span>{readTime} min read</span>
                                                        </div>
                                                        <h3 className="font-bold text-lg leading-snug text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-2">
                                                            {trendingArticle.title}
                                                        </h3>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
