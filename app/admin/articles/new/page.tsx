'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import { articlesAPI, categoriesAPI, tagsAPI } from '@/lib/api';
import { Category, Tag } from '@/types';
import { Select } from '@/components/ui/Select';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUpload from '@/components/ui/ImageUpload';

export default function NewArticlePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        intro: '',
        featuredImage: '',
        imageAlt: '',
        category: '',
        tags: [] as string[],
        country: '',
        isTrending: false,
        isFeatured: false,
        showPublishDate: true,
        showInHomeFeed: true,
        status: 'draft',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchCategories();
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await tagsAPI.getAll();
            if (response.success && response.data) {
                setAllTags(response.data);
            }
        } catch (err) {
            console.error('Failed to load tags');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            if (response.success && response.data) {
                // Only show categories that are enabled in header
                const visibleCategories = response.data.filter((cat: Category) => cat.showInHeader === true);
                setCategories(visibleCategories);
            }
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' | 'review') => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.title) throw new Error('please enter an article title');
            if (!formData.content) throw new Error('Please write some content for the article');
            if (categories.length === 0) throw new Error('No categories available. Please create a category first.');

            if (formData.featuredImage && formData.featuredImage.startsWith('file://')) {
                throw new Error('❌ Please use a web URL (https://...) for images, not local file paths.');
            }

            const selectedCat = (formData.category === 'home' || formData.category === '')
                ? null
                : categories.find(c => c._id === formData.category);

            if (formData.category && formData.category !== 'home' && !selectedCat) throw new Error('Invalid category selected');

            const articlePayload = {
                title: formData.title,
                intro: formData.intro,
                content: formData.content,
                category: (formData.category === 'home' || formData.category === '') ? null : formData.category,
                tags: formData.tags || [],
                featuredImage: formData.featuredImage,
                isFeatured: formData.isFeatured,
                isTrending: formData.isTrending,
                country: formData.country,
                showPublishDate: formData.showPublishDate,
                showInHomeFeed: formData.showInHomeFeed,
                status: status
            };

            await articlesAPI.create(articlePayload as any);

            setShowSuccess(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/admin/dashboard');

        } catch (err: any) {
            setError(err.message || 'Failed to create article');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTags(tagInput);
        }
    };

    const addTags = (input: string) => {
        const cleanTags = input
            .split(/[\s,]+/)
            .map(t => t.replace(/^#/, '').trim())
            .filter(t => t !== '' && !formData.tags.includes(t));

        if (cleanTags.length > 0) {
            setFormData(prev => {
                const combined = [...prev.tags, ...cleanTags].slice(0, 25);
                return { ...prev, tags: combined };
            });
            setTagInput('');
            setTagSuggestions([]);
            setShowTagSuggestions(false);
        }
    };

    const addTag = (val: string) => {
        const cleanVal = val.replace(/^#/, '').trim();
        if (cleanVal && !formData.tags.includes(cleanVal) && formData.tags.length < 25) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanVal] }));
            setTagInput('');
            setTagSuggestions([]);
            setShowTagSuggestions(false);
        }
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagInput(value);

        if (value.trim()) {
            const filtered = allTags.filter(t =>
                t.name.toLowerCase().includes(value.toLowerCase()) &&
                !formData.tags.includes(t.name)
            );
            setTagSuggestions(filtered);
            setShowTagSuggestions(true);
        } else {
            setTagSuggestions([]);
            setShowTagSuggestions(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-[var(--text-primary)] pb-20">
            {/* Navbar */}
            <nav className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#1a1a1a] sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800 dark:text-[var(--text-primary)]">Admin Studio</h1>
                            <span className="mx-3 text-gray-300 dark:text-[var(--text-secondary)]">/</span>
                            <span className="text-gray-500 dark:text-[var(--text-secondary)] font-medium">New Article</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={(e) => handleSubmit(e, 'draft')}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Draft'}
                            </Button>

                            {/* Logic: If Writer AND !DirectPublish -> "Submit for Review" (status='review')
                                Else -> "Publish Article" (status='published') */}
                            {user?.role === 'writer' && !user?.directPublishEnabled ? (
                                <Button
                                    variant="primary"
                                    onClick={(e) => handleSubmit(e, 'review')} // Send 'review' status
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit for Review'}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={(e) => handleSubmit(e, 'published')}
                                    disabled={loading}
                                >
                                    {loading ? 'Publishing...' : 'Publish Article'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 shadow-sm rounded-r-md">
                        <p className="font-bold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="title" className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">Article Title</label>
                                <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                                    {formData.title.length === 0 ? 'Suggested: 40-70 characters' : `${formData.title.length} characters`}
                                </span>
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg font-bold border border-gray-300 dark:border-neutral-200 rounded-md bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Article title here..."
                                required
                            />
                        </div>

                        {/* Intro Paragraph */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="intro" className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">Intro Paragraph (Optional)</label>
                                <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                                    Suggested: 40-70 words
                                </span>
                            </div>
                            <textarea
                                name="intro"
                                value={formData.intro}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-neutral-200 rounded-md bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                placeholder="Write a catchment intro..."
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-secondary)] uppercase tracking-wider">Content</label>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {(() => {
                                        const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
                                        return wordCount === 0 ? 'Suggested: 800+ words' : `${wordCount} words`;
                                    })()}
                                </span>
                            </div>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                                placeholder="Start writing here..."
                                className="min-h-[400px]"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Visibility */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Visibility</h3>
                            <div className="flex flex-col gap-3">
                                {/* Home Feed Checkbox */}
                                <label className="flex items-start gap-3 cursor-pointer p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <input
                                        type="checkbox"
                                        checked={formData.showInHomeFeed}
                                        onChange={(e) => setFormData(prev => ({ ...prev, showInHomeFeed: e.target.checked }))}
                                        className="mt-0.5 w-4 h-4 text-primary accent-primary"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white block">Show in Home Feed</span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">When checked, appears on homepage + selected category</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                        className="w-4 h-4 text-primary accent-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Mark as Featured (Home Slider)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isTrending}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))}
                                        className="w-4 h-4 text-primary accent-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Mark as Trending</span>
                                </label>
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-[var(--text-secondary)] mb-4 border-b border-gray-100 dark:border-[#1a1a1a] pb-2">Organization</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">Category</label>
                                <Select
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    options={[
                                        { value: '', label: 'None' },
                                        ...categories.filter(c => c.name !== 'Home Feed').map(c => ({ value: c._id, label: c.name }))
                                    ]}
                                    placeholder="Select Category..."
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Country / City</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-200 rounded-md text-sm bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., India, New York"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Tags ({formData.tags.length}/25)</label>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag) => {
                                            return (
                                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                    #{tag}
                                                    {/* Remove Icon */}
                                                    <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-primary-600 hover:text-primary-800">×</button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyDown={handleTagKeyDown}
                                            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                                            onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-200 rounded-md text-sm bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Type and press Enter..."
                                            disabled={formData.tags.length >= 25}
                                        />

                                        {/* Suggestions Dropdown */}
                                        {showTagSuggestions && tagSuggestions.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#1a1a1a] rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {tagSuggestions.map(tag => (
                                                    <button
                                                        key={tag._id}
                                                        type="button"
                                                        onClick={() => addTag(tag.name)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-[var(--text-primary)] transition-colors"
                                                    >
                                                        {tag.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Quick Add Cloud */}
                                    {allTags.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-2">Quick Add:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {allTags
                                                    .filter(t => !formData.tags.includes(t.name))
                                                    .slice(0, 10)
                                                    .map(tag => (
                                                        <button
                                                            key={tag._id}
                                                            type="button"
                                                            onClick={() => addTag(tag.name)}
                                                            className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-[var(--text-secondary)] transition-colors border border-gray-200 dark:border-gray-700"
                                                        >
                                                            + {tag.name}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Featured Image */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-5">
                            <ImageUpload
                                value={formData.featuredImage}
                                onChange={(val: string) => setFormData(prev => ({ ...prev, featuredImage: val }))}
                                onUploadStart={() => setImageUploading(true)}
                                onUploadEnd={() => setImageUploading(false)}
                            />
                            <div className="mt-4">
                                <input
                                    type="text"
                                    name="imageAlt"
                                    value={formData.imageAlt}
                                    onChange={handleChange}
                                    placeholder="Alt Text (for SEO)"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-300 rounded-md text-sm bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </form >

                {/* Success Overlay */}
                {
                    showSuccess && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-8 shadow-2xl flex flex-col items-center border dark:border-[#1a1a1a]">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">✓</div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-2">Saved!</h2>
                                <p className="text-gray-500 dark:text-[var(--text-secondary)]">Article created successfully.</p>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}
