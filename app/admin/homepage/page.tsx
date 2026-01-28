'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { homepageAPI, articlesAPI, authAPI, categoriesAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    MegaphoneIcon,
    NewspaperIcon,
    ArrowsUpDownIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

// Interfaces based on API response
interface HomepageConfig {
    _id: string;
    heroArticle: any;
    subFeaturedArticles: any[];
    breakingNews: {
        active: boolean;
        text: string;
        link: string;
    };
    sections: {
        category: string;
        layout: 'grid' | 'list' | 'carousel';
        order: number;
        active: boolean;
        _id?: string;
    }[];
}

export default function HomepageManager() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [articles, setArticles] = useState<any[]>([]);

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data) {
                setUser(response.data);
                fetchConfigAndCategories();
                searchArticles('');
            } else {
                router.push('/admin/login');
            }
        } catch (error) {
            router.push('/admin/login');
        }
    };

    const fetchConfigAndCategories = async () => {
        try {
            setLoading(true);
            // Fetch both Config and All Categories to ensure we list everything
            const [configData, categoriesRes] = await Promise.all([
                homepageAPI.get(),
                categoriesAPI.getAll()
            ]);

            const fetchedConfig = configData as any;
            const allCategories = (categoriesRes as any).success ? (categoriesRes as any).data : [];

            // Merge categories into config sections if they don't exist
            // This ensures if a new category "Sports" is added, it shows up here
            let currentSections = fetchedConfig.sections || [];

            const existingCategoryNames = new Set(currentSections.map((s: any) => s.category));

            const newSections = allCategories
                .filter((c: any) => !existingCategoryNames.has(c.name))
                .map((c: any) => ({
                    category: c.name,
                    layout: 'grid',
                    order: currentSections.length + 1, // Append to end
                    active: true // Default to active
                }));

            const mergedSections = [...currentSections, ...newSections];

            setConfig({
                ...fetchedConfig,
                sections: mergedSections
            });

        } catch (error) {
            toast.error('Failed to load homepage config');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const searchArticles = async (query: string) => {
        try {
            const response = await articlesAPI.getAll({ search: query, limit: 10 });
            if (response && response.data) {
                setArticles(response.data);
            } else if (response && Array.isArray(response)) {
                setArticles(response);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            const payload = {
                heroArticle: config.heroArticle?._id || config.heroArticle,
                subFeaturedArticles: config.subFeaturedArticles.map(a => a._id || a),
                breakingNews: config.breakingNews,
                sections: config.sections
            };

            const updated = await homepageAPI.update(payload);
            // update local state
            setConfig(updated as any);
            toast.success('Homepage updated successfully');
        } catch (error) {
            toast.error('Failed to update homepage');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Homepage Manager</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Breaking News Section */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MegaphoneIcon className="w-6 h-6 text-pink-500" />
                    Breaking News Ticker
                </h2>

                <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.breakingNews.active}
                            onChange={e => setConfig({ ...config, breakingNews: { ...config.breakingNews, active: e.target.checked } })}
                            className="w-5 h-5 rounded border-gray-300 dark:border-neutral-700 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-gray-700 dark:text-neutral-300">Active</span>
                    </label>
                </div>

                {config.breakingNews.active && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Breaking news text..."
                            value={config.breakingNews.text}
                            onChange={e => setConfig({ ...config, breakingNews: { ...config.breakingNews, text: e.target.value } })}
                            className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-pink-500 dark:text-white"
                        />
                        <input
                            type="text"
                            placeholder="Link (optional)..."
                            value={config.breakingNews.link}
                            onChange={e => setConfig({ ...config, breakingNews: { ...config.breakingNews, link: e.target.value } })}
                            className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-pink-500 dark:text-white"
                        />
                    </div>
                )}
            </div>

            {/* Featured Section Editor */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <NewspaperIcon className="w-6 h-6 text-blue-500" />
                    Featured Stories
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Article Selector Loop */}
                    <div className="lg:col-span-1 border-r border-gray-200 dark:border-neutral-800 pr-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-2">Available Articles</h3>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full mb-4 px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded text-sm dark:text-white"
                            onChange={(e) => searchArticles(e.target.value)}
                        />
                        <div className="space-y-2 h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {articles.map(article => (
                                <div key={article._id} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer group flex justify-between items-center border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 transition-all">
                                    <div className="flex-1 min-w-0 mr-2">
                                        <p className="text-sm font-medium truncate dark:text-white">{article.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setConfig({ ...config, heroArticle: article })}
                                            className="text-[10px] bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-1 rounded hover:bg-pink-200 dark:hover:bg-pink-900/50"
                                            title="Set as Hero"
                                        >
                                            Hero
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (config.subFeaturedArticles.length < 4) {
                                                    setConfig({ ...config, subFeaturedArticles: [...config.subFeaturedArticles, article] });
                                                } else {
                                                    toast.error('Max 4 sub-featured articles allowed');
                                                }
                                            }}
                                            className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                            title="Add to Sub"
                                        >
                                            +Sub
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Hero Slot */}
                        <div className="p-4 border-2 border-dashed border-pink-500/30 bg-pink-50 dark:bg-pink-900/10 rounded-xl min-h-[150px] relative">
                            <span className="absolute top-2 right-2 text-xs font-bold text-pink-500 uppercase">Hero Slot</span>
                            {config.heroArticle ? (
                                <div className="flex gap-4">
                                    {config.heroArticle.image && (
                                        <img src={config.heroArticle.image} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold mb-1 dark:text-white">{config.heroArticle.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">By {config.heroArticle.author?.name || 'Unknown'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    No Hero Selected
                                </div>
                            )}
                        </div>

                        {/* Sub Featured Slots */}
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">Sub-Featured (Max 4)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((index) => {
                                const article = config.subFeaturedArticles[index];
                                return (
                                    <div key={index} className="p-3 border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 rounded-lg min-h-[100px] relative">
                                        <span className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500">Slot {index + 1}</span>
                                        {article ? (
                                            <div className="flex gap-3 pr-8">
                                                {article.image && (
                                                    <img src={article.image} alt="" className="w-16 h-16 object-cover rounded" />
                                                )}
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium line-clamp-2 dark:text-white">{article.title}</p>
                                                    <button
                                                        onClick={() => {
                                                            const newSub = [...config.subFeaturedArticles];
                                                            newSub.splice(index, 1);
                                                            setConfig({ ...config, subFeaturedArticles: newSub });
                                                        }}
                                                        className="text-xs text-red-500 mt-2 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-gray-500">
                                                Empty Slot
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Management */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ArrowsUpDownIcon className="w-6 h-6 text-purple-500" />
                    Section Management
                </h2>

                <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
                    Control which categories appear on the homepage and their order.
                </p>

                <div className="space-y-3">
                    {config.sections.sort((a, b) => a.order - b.order).map((section, index) => (
                        <div key={section.category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-neutral-200">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{section.category}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Active Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer mr-4">
                                    <input
                                        type="checkbox"
                                        checked={section.active}
                                        onChange={() => {
                                            const newSections = config.sections.map(s =>
                                                s.category === section.category ? { ...s, active: !s.active } : s
                                            );
                                            setConfig({ ...config, sections: newSections });
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-600 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className={`text-sm ${section.active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                        {section.active ? 'Active' : 'Hidden'}
                                    </span>
                                </label>

                                {/* Reorder Buttons */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            if (index === 0) return;
                                            const newSections = [...config.sections];
                                            const currentSection = newSections[index];
                                            const prevSection = newSections[index - 1];

                                            // Swap orders
                                            const tempOrder = currentSection.order;
                                            currentSection.order = prevSection.order;
                                            prevSection.order = tempOrder;

                                            const sorted = newSections.sort((a, b) => a.order - b.order);
                                            const reIndexed = sorted.map((s, i) => ({ ...s, order: i }));

                                            setConfig({ ...config, sections: reIndexed });
                                        }}
                                        disabled={index === 0}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move Up"
                                    >
                                        <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (index === config.sections.length - 1) return;
                                            const newSections = [...config.sections];
                                            const currentSection = newSections[index];
                                            const nextSection = newSections[index + 1];

                                            // Swap
                                            const tempOrder = currentSection.order;
                                            currentSection.order = nextSection.order;
                                            nextSection.order = tempOrder;

                                            const sorted = newSections.sort((a, b) => a.order - b.order);
                                            const reIndexed = sorted.map((s, i) => ({ ...s, order: i }));

                                            setConfig({ ...config, sections: reIndexed });
                                        }}
                                        disabled={index === config.sections.length - 1}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move Down"
                                    >
                                        <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
