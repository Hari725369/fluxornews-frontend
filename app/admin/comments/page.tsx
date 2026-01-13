'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RoleGate from '@/components/admin/RoleGate';
import { fetchAPI } from '@/lib/api'; // Using generic fetchAPI since we didn't add admin methods to commentsAPI yet
import Button from '@/components/ui/Button';

interface Comment {
    _id: string;
    content: string;
    authorName: string;
    article: {
        _id: string;
        title: string;
        slug: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'spam';
    createdAt: string;
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, all

    useEffect(() => {
        loadComments();
    }, [filter]);

    const loadComments = async () => {
        setLoading(true);
        try {
            // Using generic fetchAPI for admin route
            const res = await fetchAPI<Comment[]>(`/comments/admin/all?status=${filter === 'all' ? '' : filter}`);
            if (res.success && res.data) {
                setComments(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await fetchAPI(`/comments/admin/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            // Remove from list if viewing by specific status, or update locally
            setComments(prev => prev.map(c => c._id === id ? { ...c, status: newStatus as any } : c));

            // If filtering by pending, remove it
            if (filter === 'pending') {
                setComments(prev => prev.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await fetchAPI(`/comments/admin/${id}`, { method: 'DELETE' });
            setComments(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    };

    return (
        <RoleGate allowedRoles={['superadmin', 'admin', 'editor']}>
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Comments</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user discussions</p>
                    </div>
                    <div className="flex gap-2">
                        {['pending', 'approved', 'spam', 'all'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800">
                        <p className="text-gray-500">No comments found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {comments.map((comment) => (
                            <div key={comment._id} className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 dark:text-white">{comment.authorName}</span>
                                            <span className="text-xs text-gray-400 pl-2 border-l border-gray-200 dark:border-gray-700">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${comment.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            comment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {comment.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black/20 p-3 rounded-lg text-sm">
                                        {comment.content}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        On article: <Link href={`/article/${comment.article.slug}`} className="text-primary hover:underline" target="_blank">{comment.article.title}</Link>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                    {comment.status !== 'approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(comment._id, 'approved')}
                                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {comment.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusUpdate(comment._id, 'rejected')}
                                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Reject
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RoleGate>
    );
}
