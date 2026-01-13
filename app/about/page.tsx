'use client';

import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
            <div className="max-w-4xl mx-auto px-4 py-12">
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
                <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About Fluxor</h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Who We Are</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Fluxor is a modern digital news platform committed to delivering accurate, timely, and comprehensive news coverage
                                from around the world. We believe in the power of journalism to inform, educate, and empower our readers.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Founded with a vision to provide unbiased and in-depth reporting, Fluxor covers a wide range of topics including
                                breaking news, world affairs, technology, business, sports, entertainment, and much more.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Our mission is to keep our readers informed about the events and trends that matter most. We strive to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                                <li>Deliver fact-based, accurate news reporting</li>
                                <li>Provide diverse perspectives on complex issues</li>
                                <li>Maintain editorial independence and integrity</li>
                                <li>Foster an informed and engaged readership</li>
                                <li>Adapt to the evolving needs of digital journalism</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What We Cover</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Breaking News</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time updates on major events as they unfold</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">World News</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">International affairs and global developments</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technology</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Latest in tech, AI, and innovation</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Business & Economy</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Market trends and financial insights</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sports</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Scores, highlights, and sports analysis</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Entertainment</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Celebrity news, movies, and pop culture</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Values</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Accuracy</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We verify facts and sources before publication to ensure the highest standards of accuracy.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Independence</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Our editorial decisions are made independently, free from commercial or political influence.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Transparency</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We clearly distinguish between news reporting, opinion, and sponsored content.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Diversity</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We strive to present multiple perspectives and represent diverse voices in our coverage.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Join Our Community</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Stay connected with Fluxor through our newsletter and social media channels. We value your feedback and engagement
                                as we continue to evolve and serve our global community of readers.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="#" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                    Subscribe to Newsletter
                                </a>
                                <a href="/contact" className="px-4 py-2 bg-gray-200 dark:bg-[#0F0F0F] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#2A2A2A] transition-colors">
                                    Contact Us
                                </a>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Advertise With Us</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Reach our engaged audience through advertising opportunities. Contact our sales team to learn more about
                                partnering with Fluxor.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                            <div className="bg-gray-50 dark:bg-[#0F0F0F] p-6 rounded-lg">
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    <strong>General Inquiries:</strong> contact@fluxor.com
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    <strong>Editorial:</strong> editorial@fluxor.com
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    <strong>Advertising:</strong> ads@fluxor.com
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    <strong>Support:</strong> support@fluxor.com
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
