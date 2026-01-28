'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import { articlesAPI, categoriesAPI, tagsAPI } from '@/lib/api';
import { Category, Article, Tag } from '@/types';
import { Select } from '@/components/ui/Select';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUpload from '@/components/ui/ImageUpload';
import { useConfig } from '@/contexts/ConfigContext';
import { toast } from 'react-hot-toast';

export default function EditArticlePage() { // Modified function signature
    const params = useParams(); // Added
    const router = useRouter();
    const { config } = useConfig(); // Added
    const id = params?.id as string; // Modified id extraction
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [isDraft, setIsDraft] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        intro: '',
        content: '',
        category: '',
        tags: [] as string[],
        featuredImage: '',
        imageAlt: '',
        isFeatured: false,
        isTrending: false,
        country: '',
        status: 'published',
        showPublishDate: true,
        publishedAt: '',
        views: 0
    });

    // Add User State
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Load user to determine permissions
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchCategories(), fetchArticle(), fetchTags()]);
    }, [id]);

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

    const fetchArticle = async () => {
        try {
            const response = await articlesAPI.getById(id);
            if (response.success && response.data) {
                const found = response.data;
                // Transform data for form if needed
                setFormData({
                    title: found.title,
                    slug: found.slug || '',
                    intro: found.intro || '',
                    content: found.content,
                    category: (found.category && typeof found.category === 'object') ? found.category._id : (found.category || ''),
                    tags: found.tags ? found.tags.map((t: any) => typeof t === 'object' ? t.name : t) : [],
                    featuredImage: found.featuredImage,
                    imageAlt: found.imageAlt || '',
                    isFeatured: found.isFeatured || false,
                    isTrending: found.isTrending || false,
                    country: found.country || '',
                    status: found.status,
                    showPublishDate: found.showPublishDate !== undefined ? found.showPublishDate : true,
                    publishedAt: found.publishedAt || '',
                    views: found.views || 0
                });
            } else {
                setError('Article not found');
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to load article', err);
            setError('Failed to load article');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (!formData.title) throw new Error('please enter an article title');
            if (!formData.content) throw new Error('Please write some content for the article');
            // Allow "None" or "Home" which might be empty IDs or special strings
            // if (!formData.category) throw new Error('Please select a category');
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
                slug: formData.slug || undefined,
                intro: formData.intro,
                content: formData.content,
                category: (formData.category === 'home' || formData.category === '') ? null : formData.category,
                tags: formData.tags || [],
                featuredImage: formData.featuredImage,
                imageAlt: formData.imageAlt,
                isFeatured: formData.isFeatured,
                isTrending: formData.isTrending,
                country: formData.country,
                status: status,
                showPublishDate: formData.showPublishDate
            };

            await articlesAPI.update(id, articlePayload);

            await articlesAPI.update(id, articlePayload);

            toast.success('Article updated successfully!');
            router.push('/admin/dashboard');

        } catch (err: any) {
            setError(err.message || 'Failed to update article');
            setSaving(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!confirm('Are you sure you want to submit this article for review? You will not be able to edit it afterward until approved or rejected.')) return;
        setSaving(true);
        try {
            await articlesAPI.submitForReview(id as string);
            setFormData(prev => ({ ...prev, status: 'review' }));
            await articlesAPI.submitForReview(id as string);
            setFormData(prev => ({ ...prev, status: 'review' }));
            toast.success('Article submitted for review!');
            router.push('/admin/articles'); // Go back to list
        } catch (err: any) {
            setError(err.message || 'Failed to submit for review');
            setSaving(false);
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
            .split(/[\s,]+/) // Split by spaces or commas
            .map(t => t.replace(/^#/, '').trim()) // Remove leading # and trim
            .filter(t => t !== '' && !formData.tags.includes(t));

        if (cleanTags.length > 0) {
            setFormData(prev => {
                const combined = [...prev.tags, ...cleanTags].slice(0, 20);
                return { ...prev, tags: combined };
            });
            setTagInput('');
            setTagSuggestions([]);
            setShowTagSuggestions(false);
        }
    };

    const addTag = (val: string) => {
        // This is used for clicking suggestions
        const cleanVal = val.replace(/^#/, '').trim();
        if (cleanVal && !formData.tags.includes(cleanVal) && formData.tags.length < 20) {
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

    const handlePreview = () => {
        // Prepare article object with current form data
        const previewArticle = {
            title: formData.title || 'Untitled Article',
            slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            intro: formData.intro,
            content: formData.content,
            featuredImage: formData.featuredImage,
            imageAlt: formData.imageAlt,
            category: categories.find(c => c._id === formData.category) || null,
            tags: formData.tags,
            country: formData.country,
            isTrending: formData.isTrending,
            isFeatured: formData.isFeatured,
            showPublishDate: formData.showPublishDate,
            author: user || { name: 'Preview Author' },
            publishedAt: formData.publishedAt || new Date().toISOString(),
            views: formData.views || 0,
        };

        // Store in sessionStorage
        sessionStorage.setItem('articlePreview', JSON.stringify(previewArticle));

        // Open in new tab
        window.open('/admin/articles/preview', '_blank');
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-[#0F0F0F] dark:text-[var(--text-primary)]">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-[var(--text-primary)] pb-20">
            {/* Navbar */}
            <nav className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#1a1a1a] sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800 dark:text-[var(--text-primary)]">Admin Studio</h1>
                            <span className="mx-3 text-gray-300 dark:text-[var(--text-secondary)]">/</span>
                            <span className="text-gray-500 dark:text-[var(--text-secondary)] font-medium">Edit Article</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                Cancel
                            </Button>
                            {/* Back to Drafts Button */}
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/admin/articles')}
                            >
                                Back
                            </Button>
                            {/* Preview Button */}
                            <Button
                                variant="secondary"
                                onClick={handlePreview}
                            >
                                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Preview
                            </Button>
                            {/* Save Draft Button */}
                            <Button
                                variant="secondary"
                                onClick={(e) => handleSubmit(e, 'draft')}
                                disabled={saving}
                            >
                                {saving && formData.status === 'draft' ? 'Saving...' : 'Save Draft'}
                            </Button>

                            {/* Writer: Submit for Review | Editor/Admin/Writer+Perm: Publish/Update */}
                            {user?.role === 'writer' && !user?.directPublishEnabled ? (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitForReview}
                                    disabled={saving || formData.status === 'review' || formData.status === 'published'}
                                    className={formData.status === 'review' ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    {formData.status === 'review' ? 'In Review' : (formData.status === 'published' ? 'Published' : 'Submit for Review')}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={(e) => handleSubmit(e, 'published')}
                                    disabled={saving}
                                >
                                    {saving && formData.status === 'published' ? 'Updating...' : (formData.status === 'published' ? 'Update Article' : 'Publish Article')}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="title" className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Article Title</label>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                                        ({formData.title.length} chars)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const siteName = config?.siteIdentity?.siteName || 'Fluxor News';
                                        const suffix = ` | ${siteName}`;
                                        if (!formData.title.endsWith(suffix)) {
                                            setFormData(prev => ({ ...prev, title: prev.title.trim() + suffix }));
                                        }
                                    }}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    + Add Site Name
                                </button>
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-2xl font-bold font-serif border border-gray-300 dark:border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition text-black dark:text-white bg-white dark:bg-[#1A1A1A] placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                placeholder="Article title here..."
                                required
                            />
                        </div>

                        {/* URL Slug */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="slug" className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">URL Slug (SEO)</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const autoSlug = formData.title
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-')
                                            .replace(/(^-|-$)/g, '');
                                        setFormData(prev => ({ ...prev, slug: autoSlug }));
                                    }}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Generate from Title
                                </button>
                            </div>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-neutral-200 rounded-md bg-white dark:bg-[#0F0F0F] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="my-article-slug"
                            />
                            {formData.slug && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Preview: <span className="text-primary">https://yoursite.com/article/{formData.slug}</span>
                                </p>
                            )}
                        </div>

                        {/* Intro Paragraph */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="intro" className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">Intro Paragraph (Optional)</label>
                                <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                                    {(formData.intro || '').length}/500
                                </span>
                            </div>
                            <textarea
                                name="intro"
                                value={formData.intro || ''}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-neutral-200 rounded-md bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                placeholder="Write a catchment intro..."
                            />
                        </div>

                        {/* Intro Paragraph */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="intro" className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">Intro Paragraph (Optional)</label>
                                <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                                    {(formData.intro || '').length}/500
                                </span>
                            </div>
                            <textarea
                                name="intro"
                                value={formData.intro || ''}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-neutral-200 rounded-md bg-white dark:bg-[#0F0F0F] text-black dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                placeholder="Write a catchment intro... (Optional)"
                            />
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6 min-h-[500px] flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Content</label>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {(() => {
                                        const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w).length;
                                        return wordCount === 0 ? 'Suggested: 800+ words' : `${wordCount} words`;
                                    })()}
                                </span>
                            </div>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                                className="flex-1"
                                placeholder="Start writing here..."
                                required
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Visibility - Moved to Top (Hidden for Writers) */}
                        {user?.role !== 'writer' && (
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-5">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Visibility</h3>
                                <div className="flex flex-col gap-3">
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
                        )}

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
                                        { value: 'home', label: 'Home Feed' },
                                        ...categories.map(c => ({ value: c._id, label: c.name }))
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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-200 rounded-md text-sm bg-white dark:bg-[#1A1A1A] text-black dark:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., India, New York"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Tags ({formData.tags.length}/20)</label>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag) => (
                                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                #{tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-primary-600 hover:text-primary-800">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyDown={handleTagKeyDown}
                                            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                                            onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-200 rounded-md text-sm bg-white dark:bg-[#1A1A1A] text-black dark:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Add tag..."
                                            disabled={formData.tags.length >= 20}
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
                                                    .slice(0, 10) // Show top 10
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
                </div>

                {/* Success Overlay */}
            </main>
        </div>
    );
}
