'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { configAPI, readerAPI } from '@/lib/api';
import { FaFacebook, FaXTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa6';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Fetch site config for feature toggles
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await configAPI.get();
                if (response.success) {
                    setConfig(response.data);
                }
            } catch (err) {
                console.error('Failed to load config', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        try {
            const res = await readerAPI.subscribe(email);

            if (res.success) {
                setStatus('success');
                setMessage('Thanks for subscribing!');
                setEmail('');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setMessage(res.message || 'Failed to subscribe');
            }
        } catch {
            setStatus('error');
            setMessage('Failed to subscribe. Try again.');
        }
    };

    // Check if email subscribe is enabled
    const enableEmailSubscribe = config?.features?.enableEmailSubscribe ?? true;

    // Get social links (only enabled ones)
    const socialLinks = config?.socialLinks || {};
    const enabledSocialLinks = Object.entries(socialLinks)
        .filter(([_, data]: [string, any]) => data?.enabled)
        .map(([platform, data]: [string, any]) => ({ platform, url: data?.url }));

    // Footer text
    const copyrightText = config?.footer?.copyrightText || `© ${currentYear} News. All rights reserved.`;
    const footerDescription = config?.footer?.description;

    if (loading) {
        return (
            <footer className="bg-white dark:bg-[#0F0F0F] border-t border-neutral-200 py-8">
                <div className="container mx-auto px-4 max-w-[1200px] text-center">
                    <div className="animate-pulse h-8 bg-neutral-100 rounded w-48 mx-auto"></div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-white dark:bg-[#0F0F0F] text-neutral-600 border-t border-neutral-200 transition-colors">
            <div className="container mx-auto px-4 py-4 max-w-[1200px]">
                {/* Newsletter Section - Conditional */}
                {enableEmailSubscribe && (
                    <div className="text-center mb-4 pb-4 border-b border-neutral-200">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Stay Updated</h3>
                        <p className="text-sm text-neutral-500 mb-4">
                            Subscribe to our newsletter for the latest news delivered to your inbox
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-[#333] rounded-lg bg-white dark:bg-[#1A1A1A] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                required
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                            >
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                        {status === 'success' && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">{message}</p>
                        )}
                        {status === 'error' && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{message}</p>
                        )}
                    </div>
                )}

                {/* Social Media Links - Conditional */}
                {enabledSocialLinks.length > 0 && (
                    <div className="flex justify-center gap-6 mb-4">
                        {enabledSocialLinks.map(({ platform, url }) => {
                            const Icon = {
                                facebook: FaFacebook,
                                twitter: FaXTwitter,
                                instagram: FaInstagram,
                                linkedin: FaLinkedin,
                                youtube: FaYoutube
                            }[platform] || FaFacebook; // Fallback

                            return (
                                <a
                                    key={platform}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-400 hover:text-primary transition-all hover:scale-110"
                                    aria-label={platform}
                                >
                                    <Icon className="w-6 h-6" />
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Footer Description */}
                {footerDescription && (
                    <p className="text-center text-xs text-neutral-500 mb-3 max-w-2xl mx-auto">
                        {footerDescription}
                    </p>
                )}

                {/* Bottom Section */}
                <div className="flex flex-col items-center gap-2 mt-2">
                    <p className="text-xs text-neutral-500">
                        {copyrightText}
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 text-xs">
                        <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">Contact Us</Link>
                        <span className="text-neutral-400">|</span>
                        <Link href="/privacy-policy" className="text-primary hover:text-primary/80 transition-colors">Privacy Policy</Link>
                        <span className="text-neutral-400">|</span>
                        <Link href="/cookie-policy" className="text-primary hover:text-primary/80 transition-colors">Cookie Policy</Link>
                        <span className="text-neutral-400">|</span>
                        <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">Terms Of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
