'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesAPI } from '@/lib/api';
import { Category } from '@/types';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState<Category | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '#2563EB',
        metaTitle: '',
        metaKeywords: '',
        slug: '',
        parent: '',
        showInHeader: false
    });
    const [editingId, setEditingId] = useState<string | null>(null); // Track ID if editing
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Unsaved Changes State
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoriesAPI.getAll();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (err: any) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleEditClick = (category: Category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '',
            color: category.color || '#2563EB',
            metaTitle: category.metaTitle || '',
            metaKeywords: category.metaKeywords || '',
            slug: category.slug,
            parent: (category.parent as any)?._id || (typeof category.parent === 'string' ? category.parent : ''), // Handle populated or ID
            showInHeader: category.showInHeader || false
        });
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', icon: '', color: '#2563EB', metaTitle: '', metaKeywords: '', slug: '', parent: '', showInHeader: false });
        setError('');
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await categoriesAPI.delete(deleteId);
            setCategories(prev => prev.filter(c => c._id !== deleteId));
            if (editingId === deleteId) {
                handleCancelEdit();
            }
        } catch (err: any) {
            alert('Failed to delete category');
        } finally {
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                color: formData.color,
                metaTitle: formData.metaTitle,
                metaKeywords: formData.metaKeywords,
                slug: formData.slug || undefined,
                parent: formData.parent || undefined,
                showInHeader: formData.showInHeader
            };

            let response;
            if (editingId) {
                response = await categoriesAPI.update(editingId, payload);
            } else {
                response = await categoriesAPI.create(payload);
            }

            if (response.success && response.data) {
                await fetchCategories();
                if (!editingId) {
                    // Only clear form if creating new. If editing, we might want to stay or clear? 
                    // Usually clear and go back to add mode is best
                    handleCancelEdit();
                } else {
                    handleCancelEdit();
                }
            }
        } catch (err: any) {
            setError(err.message || `Failed to ${editingId ? 'update' : 'create'} category`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const minimalList = categories.map((c, i) => ({
                _id: c._id,
                order: i,
                isActive: c.isActive,
                showInHeader: c.showInHeader
            }));
            await categoriesAPI.reorder(minimalList);
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Failed to save changes', err);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, item: Category) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        const dragGhost = e.currentTarget.cloneNode(true) as HTMLElement;
        dragGhost.style.opacity = '0.5';
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 0, 0);
        setTimeout(() => document.body.removeChild(dragGhost), 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (!draggedItem) return;

        const draggedIndex = categories.findIndex(c => c._id === draggedItem._id);
        if (draggedIndex === index) return;

        const newCategories = [...categories];
        const item = newCategories.splice(draggedIndex, 1)[0];
        newCategories.splice(index, 0, item);

        setCategories(newCategories);
    };

    const handleDragEnd = async () => {
        setDraggedItem(null);
        setHasUnsavedChanges(true);
    };

    const potentialParents = categories.filter(c => c._id !== editingId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Category Management</h1>
                    <div className="flex gap-3 items-center">
                        <Link href="/admin/dashboard">
                            <span className="inline-block">
                                <Button variant="secondary">
                                    ← Back to Dashboard
                                </Button>
                            </span>
                        </Link>
                        <Button
                            onClick={handleSaveChanges}
                            disabled={saving || !hasUnsavedChanges}
                            className={hasUnsavedChanges
                                ? "!bg-emerald-600 hover:!bg-emerald-700 text-white shadow-lg transition-all"
                                : "!bg-gray-200 dark:!bg-gray-800 !text-gray-400 dark:!text-gray-400 cursor-not-allowed border-none shadow-none"
                            }
                        >
                            {saving ? 'Updating...' : 'Update Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create/Edit Category Form */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] h-fit sticky top-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-primary)]">
                                {editingId ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            {editingId && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Input
                                    label="Category Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. AI"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Brief description for SEO..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">Category Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="h-10 w-16 p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F0F0F] cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>

                            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <summary className="flex items-center justify-between p-3 font-medium cursor-pointer text-gray-700 dark:text-gray-300">
                                    <span>Advanced SEO Settings</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="p-4 pt-0 space-y-4 text-sm">
                                    <div>
                                        <Input
                                            label="SEO Title (Meta Title)"
                                            value={formData.metaTitle}
                                            onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                            placeholder={formData.name || "Default Title"}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Overrides default category title tag.</p>
                                    </div>
                                    <div>
                                        <Input
                                            label="Keywords (Meta Keywords)"
                                            value={formData.metaKeywords}
                                            onChange={e => setFormData({ ...formData, metaKeywords: e.target.value })}
                                            placeholder="tech, ai, future..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Comma separated keywords.</p>
                                    </div>
                                </div>
                            </details>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">Parent Category (Optional)</label>
                                <Select
                                    options={[
                                        { value: "", label: "None (Top Level)" },
                                        ...potentialParents.map(cat => ({ value: cat._id, label: cat.name }))
                                    ]}
                                    value={formData.parent}
                                    onChange={val => setFormData({ ...formData, parent: val })}
                                    placeholder="Select Parent Category"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="showInHeader"
                                    checked={formData.showInHeader}
                                    onChange={e => setFormData({ ...formData, showInHeader: e.target.checked })}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="showInHeader" className="ml-2 block text-sm text-gray-900 dark:text-[var(--text-secondary)]">
                                    Show in Header Menu
                                </label>
                            </div>

                            <div>
                                <Input
                                    label="Slug (Optional)"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="ai-tech"
                                />
                                <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Leave empty to auto-generate from name.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 font-semibold rounded-md transition shadow-sm disabled:opacity-50 ${editingId
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-primary text-white hover:bg-primary-600'
                                    }`}
                            >
                                {submitting
                                    ? (editingId ? 'Updating...' : 'Adding...')
                                    : (editingId ? 'Update Category' : 'Add Category')
                                }
                            </button>
                        </form>
                    </div>

                    {/* Category List */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a]">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-[var(--text-primary)] mb-6">Existing Categories ({categories.length})</h2>
                        <p className="text-sm text-gray-500 mb-4">Drag items to reorder</p>

                        {loading ? (
                            <div className="text-center py-10 text-gray-500 dark:text-[var(--text-secondary)]">Loading categories...</div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 dark:text-[var(--text-secondary)] bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-dashed border-gray-300 dark:border-[#1a1a1a]">
                                No categories found. Add one on the left!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#1A1A1A]">
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)]">Name</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)]">Slug</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)] text-center">Articles</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)] text-center">In Header</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)] text-center">Status</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)] text-right">Actions</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-[var(--text-secondary)] text-center w-10">Sort</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-[#1a1a1a]">
                                        {categories.map((cat, index) => (
                                            <tr
                                                key={cat._id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, cat)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={`hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-move ${draggedItem?._id === cat._id ? 'opacity-50 bg-primary-50 dark:bg-primary-900/20' : ''} ${editingId === cat._id ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500' : ''}`}
                                            >
                                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-[var(--text-primary)]">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                                                            style={{ backgroundColor: cat.color || '#2563EB' }}
                                                            title={cat.color || 'Default Blue'}
                                                        ></span>
                                                        {cat.name}
                                                        {editingId === cat._id && <span className="ml-2 text-xs text-amber-600 font-normal">(Editing)</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-500 dark:text-gray-500 font-mono text-sm">{cat.slug}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.articleCount ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {cat.articleCount || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setCategories((prev) =>
                                                                prev.map((c) => c._id === cat._id ? { ...c, showInHeader: !c.showInHeader } : c)
                                                            );
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${cat.showInHeader ? 'bg-primary' : 'bg-gray-200'}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.showInHeader ? 'translate-x-6' : 'translate-x-1'}`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setCategories((prev) =>
                                                                prev.map((c) => c._id === cat._id ? { ...c, isActive: !c.isActive } : c)
                                                            );
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${cat.isActive !== false ? 'bg-primary' : 'bg-gray-200'}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(cat)}
                                                            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(cat._id)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400 text-center cursor-grab active:cursor-grabbing">
                                                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div >
            </div >
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                isDestructive={true}
            />
        </div >
    );
}
