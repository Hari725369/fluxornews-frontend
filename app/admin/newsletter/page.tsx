'use client';

import { useState } from 'react';
import { newsletterAPI } from '@/lib/api';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NewsletterPage() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSendTest = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await newsletterAPI.test({ subject, html: content });
            if (res.success) {
                setStatus({ type: 'success', message: 'Test email sent successfully!' });
            } else {
                setStatus({ type: 'error', message: res.message || 'Failed to send test.' });
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Error sending test.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendBlast = async () => {
        if (!window.confirm('Are you sure you want to send this to ALL subscribers? This cannot be undone.')) {
            return;
        }

        setLoading(true);
        setStatus(null);
        try {
            const res = await newsletterAPI.send({ subject, html: content });
            if (res.success) {
                setStatus({ type: 'success', message: res.message || 'Newsletter queued successfully!' });
                setSubject('');
                setContent('');
            } else {
                setStatus({ type: 'error', message: res.message || 'Failed to send newsletter.' });
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Error sending newsletter.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Newsletter</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Compose and send email blasts to subscribers.</p>
                    </div>
                    <Link href="/admin/dashboard">
                        <Button variant="secondary">
                            ← Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-neutral-200 p-6">
                    {status && (
                        <div className={`p-4 mb-6 rounded-lg ${status.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                            {status.message}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subject Line
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white"
                                placeholder="e.g. Weekly Roundup: Top Stories from Fluxor"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                HTML Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={15}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white font-mono text-sm"
                                placeholder="<p>Hello Subscribers,</p><p>Here are the latest updates...</p>"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Tip: You can use HTML tags for formatting.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
                            <button
                                onClick={handleSendTest}
                                disabled={loading || !subject || !content}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Send Test Email
                            </button>

                            <div className="flex-1"></div>

                            <button
                                onClick={handleSendBlast}
                                disabled={loading || !subject || !content}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-primary/25 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send to All Subscribers'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
