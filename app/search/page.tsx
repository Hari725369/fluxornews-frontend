'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { articlesAPI, tagsAPI } from '@/lib/api';
import { Article, Tag } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

// Highlight matching text
function highlightText(text: string, query: string) {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">{part}</mark> : part
    );
}

// Get excerpt with highlighted search term
function getHighlightedExcerpt(content: string, query: string, maxLength: number = 200) {
    if (!content) return '';
    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');

    // Try to find the query in the text
    const lowerText = plainText.toLowerCase();
    const queryIndex = lowerText.indexOf(query.toLowerCase());

    let excerpt = '';
    if (queryIndex !== -1) {
        // Center the excerpt around the query
        const start = Math.max(0, queryIndex - 50);
        const end = Math.min(plainText.length, queryIndex + query.length + 150);
        excerpt = (start > 0 ? '...' : '') + plainText.substring(start, end) + (end < plainText.length ? '...' : '');
    } else {
        excerpt = plainText.substring(0, maxLength) + (plainText.length > maxLength ? '...' : '');
    }

    return excerpt;
}

function SearchInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const initialTag = searchParams.get('tag') || '';

    const [query, setQuery] = useState(initialQuery);
    const [inputValue, setInputValue] = useState(initialQuery);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Metadata states
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularTags, setPopularTags] = useState<Tag[]>([]);

    const [suggestedArticles, setSuggestedArticles] = useState<Article[]>([]);

    useEffect(() => {
        // Load recent searches from local storage
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent searches');
            }
        }

        // Fetch suggested articles (latest news)
        const fetchSuggested = async () => {
            try {
                const res = await articlesAPI.getAll({ limit: 4, status: 'published' });
                if (res.success && res.data) {
                    setSuggestedArticles(res.data);
                }
            } catch (e) {
                console.error('Failed to load suggested articles');
            }
        };
        fetchSuggested();

        // Fetch tags for "Trending" section
        const fetchTags = async () => {
            try {
                const res = await tagsAPI.getAll();
                if (res.success && res.data) {
                    // Just take random 10 or first 10 for now as "popular"
                    setPopularTags(res.data.slice(0, 15));
                }
            } catch (e) {
                console.error('Failed to load tags');
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        // Sync state with URL params
        const q = searchParams.get('q') || '';
        setQuery(q);
        setInputValue(q);

        if (q || initialTag) {
            performSearch(q, initialTag);
        } else {
            setArticles([]);
            setSearchPerformed(false);
        }
    }, [searchParams]);

    const performSearch = async (searchTerm: string, tagFilter: string = '') => {
        setLoading(true);
        setError(null);
        setSearchPerformed(true);

        try {
            const params: any = { status: 'published', limit: 50 };
            if (searchTerm) params.search = searchTerm;
            if (tagFilter) params.tag = tagFilter;

            const response = await articlesAPI.getAll(params);
            if (response.success && response.data) {
                setArticles(response.data);

                // Save to recent searches if it's a text search
                if (searchTerm && !tagFilter) {
                    setRecentSearches(prev => {
                        const newSearches = [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 10);
                        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
                        return newSearches;
                    });
                }
            } else {
                setArticles([]);
            }
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
        }
    };

    const handleClearInput = () => {
        setInputValue('');
        const input = document.getElementById('search-input-main');
        if (input) input.focus();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const removeRecentSearch = (term: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSearches = recentSearches.filter(s => s !== term);
        setRecentSearches(newSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
            {/* Centered Search Area */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-[700px]">
                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                id="search-input-main"
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Search articles, topics, or tags ..."
                                className="w-full pl-12 pr-4 h-14 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-full text-base text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-800 focus:border-gray-300 dark:focus:border-gray-700 shadow-sm transition-all"
                                autoFocus={!query}
                            />
                        </form>

                        {/* Close Button */}
                        <button
                            onClick={() => router.back()}
                            className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                            aria-label="Close search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 max-w-[700px] py-4">
                {/* Initial State: Recent items & Tags */}
                {!searchPerformed && !query && !initialTag && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-primary uppercase">Recent Searches</h2>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {recentSearches.map((term, index) => (
                                        <div
                                            key={index}
                                            onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                                            className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#1a1a1a] hover:border-primary/50 dark:hover:border-primary/50 rounded-full cursor-pointer transition-all shadow-sm hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-primary">{term}</span>
                                            <button
                                                onClick={(e) => removeRecentSearch(term, e)}
                                                className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Suggested News */}
                        {suggestedArticles.length > 0 && (
                            <section>
                                <h2 className="text-base font-bold text-[#C4161C] dark:text-[#E5484D] mb-4 uppercase tracking-wider">Suggested News</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {suggestedArticles.map((article) => (
                                        <Link
                                            key={article._id}
                                            href={`/article/${article.slug}`}
                                            className="group flex gap-3 p-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#1a1a1a] rounded-xl hover:border-primary/50 transition-all"
                                        >
                                            {article.featuredImage && (
                                                <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
                                                    <Image
                                                        src={article.featuredImage || ''}
                                                        alt={article.title}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {article.category && (typeof article.category === 'object' ? article.category.name : article.category)}
                                                    {' • '}
                                                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Popular Tags */}
                        {popularTags.length > 0 && (
                            <section>
                                <h2 className="text-base font-bold text-[#C4161C] dark:text-[#E5484D] mb-4 uppercase tracking-wider">Explore by Topic</h2>
                                <div className="flex flex-wrap gap-3">
                                    {popularTags.map((tag) => (
                                        <Link
                                            key={tag._id}
                                            href={`/search?tag=${tag.name}`}
                                            className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium hover:border-[#C4161C] dark:hover:border-[#E5484D] hover:text-[#C4161C] dark:hover:text-[#E5484D] transition-all text-gray-700 dark:text-gray-300"
                                        >
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Search Results */}
                {searchPerformed && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 flex gap-4 animate-pulse">
                                        <div className="w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-lg h-32"></div>
                                        <div className="w-2/3 space-y-3">
                                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    We couldn't find any matches for "{query}". Try different keywords.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                                    Found {articles.length} result{articles.length !== 1 ? 's' : ''} for "{query}"
                                </p>
                                {articles.map((article) => {
                                    // Calculate read time
                                    const textLength = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
                                    const readTime = Math.max(1, Math.ceil(textLength / 200));

                                    return (
                                        <div
                                            key={article._id}
                                            className="block bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#1a1a1a] rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-black/40 transition-all duration-300 group"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 p-5">
                                                {article.featuredImage && (
                                                    <Link href={`/article/${article.slug}`} className="md:w-1/4 h-48 md:h-auto flex-shrink-0 relative rounded-lg overflow-hidden block">
                                                        <Image
                                                            src={article.featuredImage || ''}
                                                            alt={article.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 25vw"
                                                            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </Link>
                                                )}
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        {article.category && (
                                                            <span className="text-[10px] font-bold tracking-wider uppercase text-white px-2 py-1 bg-primary rounded">
                                                                {typeof article.category === 'object' ? article.category.name : article.category}
                                                            </span>
                                                        )}
                                                        {article.country && (
                                                            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-300 px-2 py-1 bg-[#2a2a2a] rounded border border-gray-700">
                                                                {article.country}
                                                            </span>
                                                        )}
                                                        {/* Read Time */}
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{readTime} min read</span>
                                                        </div>
                                                    </div>

                                                    <Link href={`/article/${article.slug}`}>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                                                            {highlightText(article.title, query)}
                                                        </h3>
                                                    </Link>

                                                    {/* Removed Content Excerpt as requested */}

                                                    {article.tags && article.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-4 mb-4">
                                                            {article.tags.slice(0, 3).map((tag: any, idx: number) => (
                                                                <span key={idx} className="text-xs text-gray-500 dark:text-gray-500">
                                                                    #{typeof tag === 'string' ? tag : tag.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                                        <Link
                                                            href={`/article/${article.slug}`}
                                                            className="text-primary font-bold text-sm hover:underline"
                                                        >
                                                            Read More
                                                        </Link>

                                                        <button
                                                            className="text-gray-400 hover:text-primary transition-colors p-1"
                                                            title="Share"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (navigator.share) {
                                                                    navigator.share({
                                                                        title: article.title,
                                                                        url: window.location.origin + `/article/${article.slug}`
                                                                    }).catch(() => { });
                                                                } else {
                                                                    navigator.clipboard.writeText(window.location.origin + `/article/${article.slug}`);
                                                                    // Could show toast here
                                                                }
                                                            }}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center">Loading...</div>}>
            <SearchInterface />
        </Suspense>
    );
}
