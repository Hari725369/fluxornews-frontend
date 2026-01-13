import { useState, useRef } from 'react';
import { Comment as AppComment } from '@/types';
import Link from 'next/link';

interface CommentItemProps {
    comment: AppComment;
    user: any;
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, newContent: string) => Promise<void>;
}

export default function CommentItem({ comment, user, onLike, onDelete, onUpdate }: CommentItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isLiked = user && comment.likedBy?.includes(user._id);

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const handleSave = async () => {
        if (!editContent.trim()) return;
        await onUpdate(comment._id, editContent);
        setIsEditing(false);
    };

    const handleFormat = (format: 'bold' | 'italic') => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = editContent;

        const symbol = format === 'bold' ? '**' : '*';
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        const newText = `${before}${symbol}${selected}${symbol}${after}`;
        setEditContent(newText);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const cursorStart = start + symbol.length;
                const cursorEnd = end + symbol.length;
                textareaRef.current.setSelectionRange(cursorStart, cursorEnd);
            }
        }, 0);
    };

    const renderMarkdown = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return (
            <>
                {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
                        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
                    }
                    return part;
                })}
            </>
        );
    };

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs uppercase">
                        {comment.authorName.charAt(0)}
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white">{comment.authorName}</h5>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
            <div className="pl-11">
                {isEditing ? (
                    <div className="mb-3">
                        <textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary focus:border-primary text-[15px] font-sans leading-relaxed resize-none"
                            rows={3}
                        />
                        {/* Formatting Toolbar */}
                        <div className="flex items-center gap-2 mt-1 mb-2">
                            <button
                                type="button"
                                onClick={() => handleFormat('bold')}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-serif font-bold italic text-xs"
                                title="Bold"
                            >
                                B
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFormat('italic')}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-serif italic text-xs"
                                title="Italic"
                            >
                                i
                            </button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancelEdit}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-xs font-medium px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-[15px] font-sans mb-3">
                        {renderMarkdown(comment.content)}
                        {comment.isEdited && (
                            <span className="ml-2 text-xs text-gray-400 italic">(edited)</span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onLike(comment._id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked
                            ? 'text-pink-600'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{comment.likes || 0}</span>
                    </button>
                    <button className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        Reply
                    </button>
                    {user && comment.reader === user._id && (
                        <button
                            onClick={handleStartEdit}
                            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            Edit
                        </button>
                    )}
                    {user && comment.reader === user._id && (
                        <button
                            onClick={() => onDelete(comment._id)}
                            className="text-sm text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Comment"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-6 border-b border-gray-100 dark:border-gray-800"></div>
        </div>
    );
}
