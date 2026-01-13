'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { articlesAPI, categoriesAPI } from '@/lib/api';
import { Article, Category } from '@/types';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function ArticlesManagementPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 50;

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [datePreset, setDatePreset] = useState(''); // For quick date selections
    const [searchQuery, setSearchQuery] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [statusFilter, categoryFilter, dateStart, dateEnd, currentPage, user]);

    // Helper function to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to calculate date ranges
    const applyDatePreset = (preset: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let start = new Date(today);
        let end = new Date(today);
        end.setHours(23, 59, 59, 999);

        switch (preset) {
            case 'today':
                break; // Already set to today
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                end = new Date(start);
                end.setHours(23, 59, 59, 999);
                break;
            case 'last3':
                start.setDate(start.getDate() - 2);
                break;
            case 'last5':
                start.setDate(start.getDate() - 4);
                break;
            case 'last7':
                start.setDate(start.getDate() - 6);
                break;
            case 'last30':
                start.setDate(start.getDate() - 29);
                break;
            default:
                return;
        }

        const startStr = formatLocalDate(start);
        const endStr = formatLocalDate(end);

        setDateStart(startStr);
        setDateEnd(endStr);
        setDatePreset(preset);
        setCurrentPage(1); // Reset to first page

        // Note: fetchData will be called automatically by useEffect when dateStart/dateEnd change
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Categories for dropdown
            const catRes = await categoriesAPI.getAll();
            if (catRes.success && catRes.data) {
                setCategories(catRes.data);
            }

            // Fetch Articles with filters and pagination
            const params: any = {
                page: currentPage,
                limit: limit
            };

            if (statusFilter !== 'all') params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            if (dateStart) params.startDate = dateStart;
            if (dateEnd) params.endDate = dateEnd;
            if (searchQuery) params.search = searchQuery;

            console.log('Fetching articles with params:', params);

            const response = await articlesAPI.getAll(params);
            if (response.success && response.data) {
                setArticles(response.data);
                setTotalArticles(response.total || 0);
                setTotalPages(response.pages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        fetchData();
    };

    const openDeleteModal = (id: string) => {
        setArticleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;

        try {
            await articlesAPI.delete(articleToDelete);
            setArticles(prev => prev.filter(a => a._id !== articleToDelete));
            setIsDeleteModalOpen(false);
            setArticleToDelete(null);
        } catch (error) {
            alert('Failed to delete article');
        }
    };

    const handleRestore = async (article: Article) => {
        try {
            // Restore to draft
            await articlesAPI.update(article._id, { isDeleted: false, status: 'draft' } as any);
            // Remove from current list (since we are in trash view)
            setArticles(prev => prev.filter(a => a._id !== article._id));
        } catch (error) {
            console.error('Failed to restore article', error);
            alert('Failed to restore article');
        }
    };

    const toggleTrending = async (article: Article) => {
        try {
            setArticles(prev => prev.map(a =>
                a._id === article._id ? { ...a, isTrending: !a.isTrending } : a
            ));

            await articlesAPI.update(article._id, { isTrending: !article.isTrending });
        } catch (error) {
            console.error('Failed to update trending status', error);
            setArticles(prev => prev.map(a =>
                a._id === article._id ? { ...a, isTrending: article.isTrending } : a
            ));
            alert('Failed to update trending status');
        }
    };

    const datePresets = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 3 Days', value: 'last3' },
        { label: 'Last 5 Days', value: 'last5' },
        { label: 'One Week', value: 'last7' },
        { label: 'One Month', value: 'last30' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Article Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage, edit, and publish your news stories.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/dashboard">
                            <span className="inline-block">
                                <Button variant="secondary">
                                    ← Back to Dashboard
                                </Button>
                            </span>
                        </Link>
                        <Link href="/admin/articles/new">
                            <span className="inline-block">
                                <Button>
                                    + Create New Article
                                </Button>
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-neutral-200 mb-6 p-4 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 w-full items-center">
                        {/* Status Tabs */}
                        <div className="flex bg-gray-100 dark:bg-black rounded-lg p-1 border border-transparent dark:border-neutral-200">
                            {(user?.role === 'superadmin'
                                ? ['all', 'published', 'draft', 'rejected', 'trash']
                                : ['all', 'published', 'draft']
                            ).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${statusFilter === tab
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-transparent dark:border-gray-700'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-px bg-gray-200 dark:bg-neutral-800 hidden md:block" />

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-neutral-200 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>

                        {/* Date Preset Filter */}
                        <select
                            value={datePreset}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                    setDatePreset('');
                                    setDateStart('');
                                    setDateEnd('');
                                    setCurrentPage(1);
                                } else {
                                    applyDatePreset(value);
                                }
                            }}
                            className="px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-neutral-200 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                        >
                            <option value="">All Time</option>
                            {datePresets.map((preset) => (
                                <option key={preset.value} value={preset.value}>{preset.label}</option>
                            ))}
                        </select>

                        {/* Date Range Inputs */}
                        <input
                            type="date"
                            value={dateStart}
                            onChange={(e) => {
                                setDateStart(e.target.value);
                                setDatePreset(''); // Clear preset when manual date is set
                            }}
                            className="px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-neutral-200 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                        />
                        <span className="text-gray-400 dark:text-neutral-600">-</span>
                        <input
                            type="date"
                            value={dateEnd}
                            onChange={(e) => {
                                setDateEnd(e.target.value);
                                setDatePreset('');
                            }}
                            className="px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-neutral-200 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                        />

                        {/* Clear Date Range Button */}
                        {(dateStart || dateEnd || datePreset) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDatePreset('');
                                    setDateStart('');
                                    setDateEnd('');
                                    setCurrentPage(1);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                title="Clear date filter"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 md:max-w-xs">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-neutral-200 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                                />
                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-neutral-200 overflow-hidden">
                    {/* Table wrapper with border */}
                    <div className="border-t border-gray-200 dark:border-neutral-200">
                        {/* Count Info */}
                        <div className="px-6 py-3 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-neutral-200">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{((currentPage - 1) * limit) + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * limit, totalArticles)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalArticles}</span> articles
                            </p>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500 dark:text-[var(--text-secondary)]">Loading articles...</div>
                        ) : articles.length === 0 ? (
                            <div className="p-12 text-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text-primary)]">No articles found</h3>
                                <p className="text-gray-500 dark:text-[var(--text-secondary)] mb-6">Try adjusting your filters or create a new article.</p>
                                <Link href="/admin/articles/new">
                                    <span className="inline-block">
                                        <Button variant="primary">
                                            Create Article
                                        </Button>
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-neutral-200">
                                            <tr>
                                                <th className="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-16">No.</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stage</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-neutral-200">
                                            {articles.map((article, index) => (
                                                <tr key={article._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition group">
                                                    <td className="py-4 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {((currentPage - 1) * limit) + index + 1}
                                                    </td>
                                                    <td className="py-4 px-6 max-w-[300px]">
                                                        <div className="font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-1 line-clamp-1">{article.title}</div>
                                                        <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)] flex items-center gap-2">
                                                            <span className="truncate max-w-[150px]">{article.slug}</span>
                                                            {typeof article.category === 'object' && article.category && (
                                                                <span className="bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                                                                    {article.category.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                {typeof article.author === 'object' ? article.author?.name : 'Unknown'}
                                                            </span>
                                                            {typeof article.editor === 'object' && article.editor && (
                                                                <span className="text-xs text-gray-400">Ed: {article.editor.name}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize border ${article.lifecycleStage === 'hot'
                                                            ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30'
                                                            : article.lifecycleStage === 'cold'
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30'
                                                                : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30'
                                                            }`}>
                                                            {article.lifecycleStage || 'hot'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                {article.views || 0}
                                                            </span>
                                                            {article.isTrending && (
                                                                <span className="text-[10px] text-primary font-bold uppercase tracking-wide">Trending</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${article.isDeleted ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                article.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                    article.status === 'review' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                        article.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${article.isDeleted ? 'bg-red-500' :
                                                                    article.status === 'published' ? 'bg-green-500' :
                                                                        article.status === 'review' ? 'bg-orange-500' :
                                                                            article.status === 'rejected' ? 'bg-red-500' :
                                                                                'bg-gray-400'
                                                                }`}></span>
                                                            {article.isDeleted ? 'Deleted' :
                                                                article.status === 'published' ? 'Published' :
                                                                    article.status === 'review' ? 'In Review' :
                                                                        article.status === 'rejected' ? 'Rejected' :
                                                                            'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-[var(--text-secondary)] whitespace-nowrap">
                                                        {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                                        {statusFilter === 'trash' ? (
                                                            <button
                                                                onClick={() => handleRestore(article)}
                                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors font-medium text-xs px-3 py-1 border border-green-600 dark:border-green-400 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            >
                                                                Restore
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <Link href={`/admin/articles/edit/${article._id}`}>
                                                                    <button className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                    </button>
                                                                </Link>
                                                                {user?.role !== 'writer' && (
                                                                    <button
                                                                        onClick={() => openDeleteModal(article._id)}
                                                                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-2"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="px-6 py-4 bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-neutral-200 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Back
                                    </button>
                                    <span className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-[#1a1a1a] transform transition-all">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                            Delete Article?
                        </h3>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                            Are you sure you want to delete this article? This action cannot be undone and will remove the article from the platform.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-colors"
                            >
                                Delete Article
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
