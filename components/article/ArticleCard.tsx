'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatRelativeTime, calculateReadTime, truncateText } from '@/lib/utils';
import { useConfig } from '@/contexts/ConfigContext';

interface ArticleCardProps {
    article: Article;
    variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
    const { config } = useConfig();
    const readTime = calculateReadTime(article.content);

    // Get feature toggles with defaults
    const showAuthorName = config?.features?.showAuthorName ?? false;
    const showCountryName = config?.features?.showCountryName ?? false;
    const showDateTime = config?.features?.showDateTime ?? true;
    const showPostIntro = config?.features?.showPostIntro ?? true;

    // Helper to validate safe URLs
    const getSafeImageUrl = (url: string) => {
        if (!url || url.startsWith('file://')) {
            return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
        }
        return url;
    };

    const safeImage = getSafeImageUrl(article.featuredImage);
    const categoryName = (article.category && typeof article.category === 'object') ? article.category.name : (article.category || 'News');

    if (variant === 'featured') {
        return (
            <div className="relative h-[500px] rounded-lg overflow-hidden block group cursor-pointer">
                <Image
                    src={safeImage}
                    alt={article.imageAlt || article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    {/* Category Label */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block px-3 py-1 bg-[#C4161C] dark:bg-[#E5484D] text-white text-xs font-semibold uppercase tracking-wider rounded font-sans">
                            {categoryName}
                        </span>
                        {showCountryName && article.country && (
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider rounded font-sans border border-white/20">
                                {article.country}
                            </span>
                        )}
                    </div>
                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight group-hover:text-gray-200 transition-colors drop-shadow-lg font-serif">
                        {article.title}
                    </h2>
                    {/* Summary */}
                    {showPostIntro && (
                        <p className="text-gray-200 text-lg mb-4 line-clamp-2 leading-relaxed drop-shadow-md">
                            {article.intro || truncateText(article.content.replace(/\u003c[^\u003e]*\u003e/g, ''), 150)}
                        </p>
                    )}
                    {/* Metadata */}
                    {showDateTime && (
                        <div className="flex items-center gap-4 text-sm text-gray-300 font-sans">
                            <span suppressHydrationWarning>{formatRelativeTime(article.publishedAt || article.createdAt)}</span>
                            <span>•</span>
                            <span>{readTime} min read</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <Link href={`/article/${article.slug}`} className="flex gap-4 group py-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
                <div className="relative w-28 h-28 flex-shrink-0 rounded overflow-hidden">
                    <Image
                        src={safeImage}
                        alt={article.imageAlt || article.title}
                        fill
                        sizes="112px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#C4161C] dark:text-[#E5484D] text-xs font-semibold uppercase tracking-wider font-sans">
                            {categoryName}
                        </span>
                        {showCountryName && article.country && (
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-gray-200 dark:border-gray-800 rounded">
                                {article.country}
                            </span>
                        )}
                    </div>
                    {/* Title */}
                    <h3 className="font-normal text-base leading-snug group-hover:text-[#C4161C] dark:group-hover:text-[#E5484D] transition-colors line-clamp-2 mb-2 font-serif">
                        {article.title}
                    </h3>
                    {/* Content Excerpt Removed */}

                    {/* Metadata */}
                    {showDateTime && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-sans" suppressHydrationWarning>
                            {formatRelativeTime(article.publishedAt || article.createdAt)}
                        </p>
                    )}
                </div>
            </Link>
        );
    }

    // Default variant - Editorial card
    return (
        <div className="h-full flex flex-col group">
            <Link href={`/article/${article.slug}`} className="block relative aspect-[3/2] overflow-hidden rounded-lg mb-2">
                <Image
                    src={safeImage}
                    alt={article.imageAlt || article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-1">
                {/* Category Label & Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md w-fit">
                        {categoryName}
                    </span>
                    {showCountryName && article.country && (
                        <span className="text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-widest border border-gray-100 dark:border-gray-800 px-1.5 py-0.5 rounded">
                            {article.country}
                        </span>
                    )}
                    {/* Read Time */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 ml-auto font-medium uppercase tracking-wide">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{readTime} MIN</span>
                    </div>
                </div>

                {/* Title */}
                <Link href={`/article/${article.slug}`} className="block">
                    <h3 className="text-[18px] font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-3 font-serif">
                        {article.title}
                    </h3>
                </Link>

                {/* Excerpt / Intro */}
                {showPostIntro && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                        {article.intro || truncateText(article.content.replace(/\u003c[^\u003e]*\u003e/g, ''), 150)}
                    </p>
                )}

                {/* Footer: Read More + Share */}
                {/* Footer: Time/Share Left, Read More Right */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-3">
                        {showDateTime && (
                            <span className="text-[10px] text-gray-400 font-medium uppercase" suppressHydrationWarning>
                                {formatRelativeTime(article.publishedAt || article.createdAt)}
                            </span>
                        )}
                        <button
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-gray-800 rounded-full transition-colors relative z-10"
                            aria-label="Share article"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (navigator.share) {
                                    const shareUrl = window.location.origin + `/article/${article.slug}`;
                                    const introText = article.intro || truncateText(article.content.replace(/\u003c[^\u003e]*\u003e/g, ''), 150);
                                    const shareText = `${article.title}\n\n${introText}\n\n${shareUrl}\n\n#News #GlobalNews`;

                                    navigator.share({
                                        title: article.title,
                                        text: shareText,
                                        url: shareUrl
                                    }).catch(() => { });
                                } else {
                                    navigator.clipboard.writeText(window.location.origin + `/article/${article.slug}`);
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                    <Link href={`/article/${article.slug}`} className="text-primary font-bold text-[10px] uppercase tracking-[0] group-hover:underline">
                        Read More
                    </Link>
                </div>
            </div>
        </div>
    );

}
