'use client';

import Link from 'next/link';

export default function AdminSettings() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Configure your site settings and legal pages</p>
                </div>
                <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Policies Section */}
                <Link href="/admin/settings/policies" className="group">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Legal Policies</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage Privacy Policy, Terms of Service, Cookie Policy, and Contact info.
                        </p>
                    </div>
                </Link>

                {/* Profile Settings */}
                <Link href="/admin/profile" className="group">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Update your personal information, password, and preferences.
                        </p>
                    </div>
                </Link>

                {/* Categories - Shortcut */}
                <Link href="/admin/categories" className="group">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200">
                        <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Category Structure</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage site categories, subcategories, and navigation structure.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
