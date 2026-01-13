'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement actual form submission to backend
        // For now, just simulate submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSubmitted(true);
        setLoading(false);
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors mb-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>

                <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Have a question, suggestion, or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                    </p>

                    {submitted && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg">
                            <p className="font-semibold">Thank you for contacting us!</p>
                            <p className="text-sm">We've received your message and will respond within 24-48 hours.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="editorial">Editorial Feedback</option>
                                        <option value="advertising">Advertising Opportunities</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="collaboration">Partnership/Collaboration</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Other Ways to Reach Us</h2>

                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">General inquiries:</p>
                                    <a href="mailto:contact@fluxor.com" className="text-primary hover:underline">
                                        contact@fluxor.com
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-1">Editorial team:</p>
                                    <a href="mailto:editorial@fluxor.com" className="text-primary hover:underline">
                                        editorial@fluxor.com
                                    </a>
                                </div>

                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Business Hours</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                                        Saturday: 10:00 AM - 4:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        All times are in UTC
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Social Media</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Follow us for the latest news and updates:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <a href="#" className="px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#1a1a1a] rounded-md text-sm hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors">
                                            Twitter
                                        </a>
                                        <a href="#" className="px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#1a1a1a] rounded-md text-sm hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors">
                                            Facebook
                                        </a>
                                        <a href="#" className="px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#1a1a1a] rounded-md text-sm hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors">
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Response Time</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        We typically respond to inquiries within 24-48 hours during business days.
                                        For urgent matters, please mark your email subject with "URGENT".
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-[#1a1a1a] pt-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            <details className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                                    How can I submit a news tip?
                                </summary>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Email our editorial team at editorial@fluxor.com with "News Tip" in the subject line. Please include as many details as possible.
                                </p>
                            </details>
                            <details className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                                    How do I advertise on Fluxor?
                                </summary>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Contact our advertising team at ads@fluxor.com for information about advertising opportunities and rates.
                                </p>
                            </details>
                            <details className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                                    Can I contribute articles to Fluxor?
                                </summary>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    We welcome contributions from experienced journalists and subject matter experts. Please email editorial@fluxor.com with your article pitch and writing samples.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Back Button Bottom */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors mt-8"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
