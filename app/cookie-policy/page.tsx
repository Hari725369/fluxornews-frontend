'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { configAPI } from '@/lib/api';

export default function CookiePolicyPage() {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('Cookie Policy');
    const [lastUpdated, setLastUpdated] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await configAPI.get();
                if (response.success && (response.data as any)?.policies?.cookiePolicy) {
                    const policy = (response.data as any).policies.cookiePolicy;
                    setTitle(policy.title || 'Cookie Policy');
                    setContent(policy.content || getDefaultContent());
                    if (policy.lastUpdated) {
                        setLastUpdated(new Date(policy.lastUpdated).toLocaleDateString());
                    }
                } else {
                    setContent(getDefaultContent());
                }
            } catch (error) {
                console.error('Failed to load cookie policy:', error);
                setContent(getDefaultContent());
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    const getDefaultContent = () => `
        <h2>1. What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit our website.</p>
        
        <h2>2. How We Use Cookies</h2>
        <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences</li>
        </ul>
        
        <h2>3. Managing Cookies</h2>
        <p>You can control cookies through your browser settings.</p>
    `;

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0F0F0F]">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
                        <div className="space-y-3 mt-8">
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0F0F0F]">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                {/* Back Button */}
                <div className="flex justify-end mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h1>

                {/* Last Updated */}
                {lastUpdated && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Last Updated: {lastUpdated}
                    </p>
                )}

                {/* Content */}
                <div
                    className="prose prose-neutral dark:prose-invert max-w-none
                        prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                        prose-a:text-primary hover:prose-a:text-primary/80
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                        prose-ol:text-gray-700 dark:prose-ol:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Back Button Bottom */}
                {/* Back Button Bottom Removed */}
            </div>
        </div>
    );
}
