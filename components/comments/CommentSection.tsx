'use client';

import { useState, useEffect, useRef } from 'react';
import { commentsAPI, readerAPI } from '@/lib/api';
import { useConfig } from '@/contexts/ConfigContext';
import Link from 'next/link';
import { Comment as AppComment } from '@/types';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import CommentItem from './CommentItem';
import CommentsModal from './CommentsModal';

export default function CommentSection({ articleId, onAuthRequested }: { articleId: string, onAuthRequested: () => void }) {
    const { config } = useConfig();
    const [comments, setComments] = useState<AppComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [user, setUser] = useState<any>(null); // Reader user
    const [isFocused, setIsFocused] = useState(false); // For Medium-style expansion
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Editing state (Optimization: Moved individual edit state to CommentItem)
    // We just need a handler to update the parent list


    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    // Read More State
    // Read More State
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    const isEnabled = config?.features?.enableComments;

    useEffect(() => {
        if (isEnabled && articleId) {
            fetchComments();
            checkAuth();
        } else {
            setLoading(false);
        }

        // Listen for auth changes
        const handleAuthChange = () => checkAuth();
        window.addEventListener('readerAuthChange', handleAuthChange);
        return () => window.removeEventListener('readerAuthChange', handleAuthChange);
    }, [articleId, isEnabled]);

    const checkAuth = async () => {
        const token = localStorage.getItem('readerToken');
        if (token) {
            try {
                const res = await readerAPI.getMe();
                if (res.success) setUser(res.data);
            } catch (err) {
                console.error('Failed to get user', err);
            }
        } else {
            setUser(null);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await commentsAPI.getArticleComments(articleId);
            if (res.success && res.data) {
                setComments(res.data);
            }
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!user) return;
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await commentsAPI.postComment({
                articleId,
                authorName: user.name || 'Anonymous',
                content,
                readerId: user._id
            });

            if (res.success && res.data) {
                setMessage({ type: 'success', text: 'Response submitted for moderation.' });

                // Add new comment to state immediately (even if pending)
                const newComment: AppComment = {
                    ...res.data,
                    likes: 0,
                    likedBy: []
                };
                setComments(prev => [newComment, ...prev]);

                setContent('');
                setIsFocused(false);
            } else {
                setMessage({ type: 'error', text: res.message || 'Failed to post' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: string) => {
        if (!user) {
            alert('Please sign in to like comments');
            return;
        }

        // Optimistic update
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                const hasLiked = c.likedBy.includes(user._id);
                return {
                    ...c,
                    likes: hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
                    likedBy: hasLiked ? c.likedBy.filter(id => id !== user._id) : [...c.likedBy, user._id]
                };
            }
            return c;
        }));

        try {
            const res = await commentsAPI.toggleLike(commentId);
            if (res.success && res.data) {
                // Sync with server source of truth
                const likeData = res.data;
                setComments(prev => prev.map(c => {
                    if (c._id === commentId) {
                        return {
                            ...c,
                            likes: likeData.likes,
                            likedBy: likeData.hasLiked
                                ? (c.likedBy.includes(user._id) ? c.likedBy : [...c.likedBy, user._id])
                                : c.likedBy.filter(id => id !== user._id)
                        };
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error('Failed to toggle like', error);
            // Revert on failure logic could go here
        }
    };

    const handleDelete = (commentId: string) => {
        setCommentToDelete(commentId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;

        const commentId = commentToDelete;

        // Optimistic delete
        setComments(prev => prev.filter(c => c._id !== commentId));

        try {
            await commentsAPI.deleteComment(commentId);
        } catch (error) {
            console.error('Failed to delete comment', error);
            setMessage({ type: 'error', text: 'Failed to delete comment' });
            // Should revert specific comment here ideally
        } finally {
            setDeleteModalOpen(false);
            setCommentToDelete(null);
        }
    };

    const handleSaveEdit = async (commentId: string) => {
        // ... (this function is technically unused for new comment form, but used for CommentItem)
        // Actually CommentItem handles its own save.
        // However, handleFormat IS used for the new comment form below.
    };

    const handleFormat = (format: 'bold' | 'italic') => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = content;

        const symbol = format === 'bold' ? '**' : '*';
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        const newText = `${before}${symbol}${selected}${symbol}${after}`;
        setContent(newText);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const cursorStart = start + symbol.length;
                const cursorEnd = end + symbol.length;
                textareaRef.current.setSelectionRange(cursorStart, cursorEnd);
            }
        }, 0);
    };

    const handleUpdateComment = async (commentId: string, newContent: string) => {
        // Optimistic update
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                return { ...c, content: newContent, isEdited: true, editedAt: new Date().toISOString() };
            }
            return c;
        }));

        try {
            await commentsAPI.updateComment(commentId, newContent);
        } catch (error) {
            console.error('Failed to update comment', error);
            setMessage({ type: 'error', text: 'Failed to update comment' });
        }
    };

    if (!isEnabled) return null;

    if (loading) return <div className="py-8 text-center text-gray-500">Loading responses...</div>;

    const topLiked = [...comments].sort((a, b) => b.likes - a.likes).slice(0, 4);
    const displayedComments = showCommentsModal ? comments : comments.slice(0, 3);
    const hiddenCount = Math.max(0, comments.length - 3);

    return (
        <div id="comments" className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white font-sans">
                Responses ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="mb-10">
                {user ? (
                    <div className={`bg-white dark:bg-[#1A1A1A] rounded-lg transition-all duration-200 ${isFocused ? 'shadow-md ring-1 ring-gray-200 dark:ring-gray-700 p-4' : ''}`}>
                        {!isFocused && (
                            <div className="flex items-center gap-3 mb-2" onClick={() => setIsFocused(true)}>
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-gray-900 dark:text-gray-200 font-medium">{user.name}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <textarea
                                ref={textareaRef}
                                placeholder="What are your thoughts?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                rows={isFocused ? 4 : 1}
                                className={`w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 resize-none leading-relaxed ${!isFocused ? 'bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 px-4 py-3 rounded-md cursor-text shadow-sm' : ''}`}
                                required
                            />

                            {isFocused && (
                                <div className="flex items-center justify-between mt-4 animate-fadeIn">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleFormat('bold')}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-serif font-bold italic"
                                            title="Bold"
                                        >
                                            B
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleFormat('italic')}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-serif italic"
                                            title="Italic"
                                        >
                                            i
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setIsFocused(false); setContent(''); }}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || !content.trim()}
                                            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Respond
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                        {message && (
                            <div className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6 text-center border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">Sign in to leave a response</p>
                        <button
                            onClick={onAuthRequested}
                            className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-full hover:opacity-90 transition-opacity inline-block text-sm"
                        >
                            Sign In / Sign Up
                        </button>
                    </div>
                )}
            </div>

            {/* Top Liked Divider if applicable */}
            {comments.length > 4 && (
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Responses</span>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-8">No responses yet.</p>
                ) : (
                    displayedComments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            user={user}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onUpdate={handleUpdateComment}
                        />
                    ))
                )}

                {comments.length > 3 && (
                    <div className="text-center pt-8">
                        <button
                            onClick={() => setShowCommentsModal(true)}
                            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
                        >
                            Read More ({comments.length - 3} more)
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Read More Modal */}
            <CommentsModal
                isOpen={showCommentsModal}
                onClose={() => setShowCommentsModal(false)}
                comments={comments}
                user={user}
                onLike={handleLike}
                onDelete={handleDelete}
                onUpdate={handleUpdateComment}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
}
