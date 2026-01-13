export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return formatDate(dateString);
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

export function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const plainText = content.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
}


export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Convert image URL to full path
 * - If starts with /uploads, prepend backend URL
 * - If starts with file://, return fallback
 * - Otherwise return as-is (external URLs)
 */
export function getImageUrl(url: string): string {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    if (!url || url.startsWith('file://')) {
        return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
    }

    // If local upload path, prepend backend URL
    if (url.startsWith('/uploads')) {
        return `${API_URL}${url}`;
    }

    // External URL (Cloudinary, etc.)
    return url;
}

