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
                {/* General Settings - NEW */}
                <Link href="/admin/settings/general" className="group">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-neutral-200 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-lg transition-all duration-200">
                        <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">General Settings</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Site Name, Description, SEO Keywords, and Branding.
                        </p>
                    </div>
                </Link>

                {/* Feature Management - NEW */}
                <Link href="/admin/settings/features" className="group">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-neutral-200 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-200">
                        <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Feature Control</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Toggle Dark Mode, Comments, Search, and other global features.
                        </p>
                    </div>
                </Link>
                {/* Profile Settings */}
                <Link href="/admin/profile" className="group">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-neutral-200 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200">
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
            </div>
        </div>
    );
}
