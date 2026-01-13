import { useEffect, useState } from 'react';
import { Comment as AppComment } from '@/types';
import CommentItem from './CommentItem';

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: AppComment[];
    user: any;
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, newContent: string) => Promise<void>;
}

export default function CommentsModal({
    isOpen,
    onClose,
    comments,
    user,
    onLike,
    onDelete,
    onUpdate
}: CommentsModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsAnimating(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 flex flex-col max-h-[85vh] ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-sans">
                        Responses ({comments.length})
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment._id}
                                comment={comment}
                                user={user}
                                onLike={onLike}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
