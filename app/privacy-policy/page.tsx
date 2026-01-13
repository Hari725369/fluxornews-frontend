'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
            <div className="max-w-4xl mx-auto px-4 py-12">
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

                <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: January 8, 2026</p>

                    <div className="prose dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Welcome to Fluxor ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2.1 Personal Information</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We may collect personal information that you voluntarily provide to us when you:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                                <li>Subscribe to our newsletter</li>
                                <li>Create an account</li>
                                <li>Contact us via our contact form</li>
                                <li>Leave comments on articles</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2.2 Automatically Collected Information</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                When you visit our website, we automatically collect certain information about your device, including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                                <li>IP address</li>
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Referring website</li>
                                <li>Pages viewed and time spent on pages</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">We use the information we collect to:</p>
                            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Send you newsletters and marketing communications (with your consent)</li>
                                <li>Respond to your comments and questions</li>
                                <li>Analyze usage patterns to improve user experience</li>
                                <li>Detect, prevent, and address technical issues or fraudulent activity</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We use cookies and similar tracking technologies to track activity on our website and store certain information.
                                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Third-Party Services</h2>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5.1 Google AdSense</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We use Google AdSense to display advertisements on our website. Google may use cookies to serve ads based on your prior visits
                                to our website or other websites. You may opt out of personalized advertising by visiting
                                <a href="https://www.google.com/settings/ads" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                    Google Ads Settings
                                </a>.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5.2 Analytics</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We may use third-party analytics services (such as Google Analytics) to monitor and analyze the use of our website.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We implement appropriate technical and organizational security measures to protect your personal information.
                                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Your Privacy Rights</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">Depending on your location, you may have the following rights:</p>
                            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                                <li>Access to your personal information</li>
                                <li>Correction of inaccurate data</li>
                                <li>Deletion of your personal information</li>
                                <li>Objection to or restriction of processing</li>
                                <li>Data portability</li>
                                <li>Withdrawal of consent</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
                                If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Changes to This Privacy Policy</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
                                and updating the "Last Updated" date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="bg-gray-50 dark:bg-[#0F0F0F] p-4 rounded-lg">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Email: privacy@fluxor.com<br />
                                    Address: [Your Business Address]
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Back Button Bottom Removed */}

            </div>
        </div >
    );
}
