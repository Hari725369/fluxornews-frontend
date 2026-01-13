'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag } from '@/types';
import { tagsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [creating, setCreating] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await tagsAPI.getAll();
            if (response.success && response.data) {
                setTags(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            setCreating(true);
            const response = await tagsAPI.create({ name: newTagName });
            if (response.success && response.data) {
                setTags([...tags, response.data]);
                setNewTagName('');
                setIsCreateModalOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to create tag:', error);
            const errorMessage = error?.message || 'Failed to create tag. Please try again.';
            alert(errorMessage);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setTagToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!tagToDelete) return;

        try {
            await tagsAPI.delete(tagToDelete);
            setTags(tags.filter(t => t._id !== tagToDelete));
            setIsDeleteModalOpen(false);
            setTagToDelete(null);
        } catch (error) {
            console.error('Failed to delete tag:', error);
            alert('Failed to delete tag');
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Manage Tags</h1>
                <div className="flex gap-3">
                    <Link href="/admin/dashboard">
                        <span className="inline-block">
                            <Button variant="secondary">
                                ← Back to Dashboard
                            </Button>
                        </span>
                    </Link>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        + New Tag
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1a1a1a] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Tags List */}
            {
                loading ? (
                    <div className="text-center py-12">Loading tags...</div>
                ) : filteredTags.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-gray-500 dark:text-[var(--text-secondary)]">No tags found.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#1a1a1a] p-6">
                        <div className="flex flex-wrap gap-3">
                            {filteredTags.map((tag) => (
                                <div
                                    key={tag._id}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors group"
                                >
                                    <span>#{tag.name}</span>
                                    <button
                                        onClick={() => handleDeleteClick(tag._id)}
                                        className="ml-1 hover:bg-blue-800 rounded-full p-1 transition-colors"
                                        title="Remove tag"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Create Modal */}
            {
                isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-[#1a1a1a]">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">Create New Tag</h2>
                                <form onSubmit={handleCreateTag}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                                            Tag Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="e.g. Technology, Politics"
                                            autoFocus
                                        />
                                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Slug will be auto-generated.</p>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-4 py-2 text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <Button type="submit" disabled={creating || !newTagName.trim()}>
                                            {creating ? 'Creating...' : 'Create Tag'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#1a1a1a]">
                            <div className="p-6 text-center">
                                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-2">Delete Tag?</h3>
                                <p className="text-gray-500 dark:text-[var(--text-secondary)] mb-6 text-sm">
                                    Are you sure you want to delete this tag? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-300 dark:border-gray-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-red-900/20"
                                    >
                                        Delete Tag
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
