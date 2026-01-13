'use client';

import { useState, useEffect } from 'react';

type Props = {
    title: string;
    url: string;
    intro?: string;
};

export default function SocialShare({ title, url, intro }: Props) {
    const [copied, setCopied] = useState(false);
    const [fullUrl, setFullUrl] = useState(url);

    useEffect(() => {
        setFullUrl(`${window.location.origin}${url}`);
    }, [url]);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${intro ? intro + '\n\n' : ''}${fullUrl}`)}`,
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                const shareText = `${title}\n\n${intro || ''}\n\n${fullUrl}\n\n#News #GlobalNews`;
                await navigator.share({
                    title: title,
                    text: shareText,
                    url: fullUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <div className="flex flex-wrap gap-3">
            <button
                onClick={handleNativeShare}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md text-sm font-medium transition-colors font-sans flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
            </button>

            <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors font-sans flex items-center gap-2"
            >
                𝕏 Post
            </a>
            <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1877F2] text-white hover:bg-[#166fe5] rounded-md text-sm font-medium transition-colors font-sans"
            >
                Facebook
            </a>
            <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white hover:bg-[#20bd5a] rounded-md text-sm font-medium transition-colors font-sans"
            >
                WhatsApp
            </a>
            <button
                onClick={copyToClipboard}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors font-sans ${copied
                    ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
            >
                {copied ? '✓ Copied' : '🔗 Copy Link'}
            </button>
        </div>
    );
}
