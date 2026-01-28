'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function PoliciesPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data) {
                if (response.data.role !== 'superadmin') {
                    router.push('/admin/dashboard');
                }
                setUser(response.data);
            } else {
                router.push('/admin/login');
            }
        } catch (error) {
            router.push('/admin/login');
        }
    };

    const policies = [
        {
            name: 'Contact Us',
            description: 'Manage contact information, FAQs, business hours, and social media',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            color: 'from-blue-500 to-blue-600',
            href: '/admin/settings/policies/contact'
        },
        {
            name: 'Privacy Policy',
            description: 'Edit privacy policy content and update last modified date',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            color: 'from-green-500 to-green-600',
            href: '/admin/settings/policies/privacy'
        },
        {
            name: 'Cookie Policy',
            description: 'Manage cookie usage information and compliance content',
            icon: (
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3-3c0-.217.031-.444.099-.716a1 1 0 0 0-1.067-1.236A9.956 9.956 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10c0-.049-.003-.097-.007-.16a1.004 1.004 0 0 0-.395-.776zM8.5 6a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3zm-2 8a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3zm2.5-6.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0zm3.5 6.5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3z" />
                </svg>
            ),
            color: 'from-orange-500 to-orange-600',
            href: '/admin/settings/policies/cookies'
        },
        {
            name: 'Terms of Use',
            description: 'Update terms and conditions for using the website',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'from-red-500 to-red-600',
            href: '/admin/settings/policies/terms'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header with Back Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Policies & Legal Pages
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your website's legal and informational pages
                        </p>
                    </div>

                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                {/* Policy Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policies.map((policy) => (
                        <Link
                            key={policy.name}
                            href={policy.href}
                            className="group"
                        >
                            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${policy.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {policy.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                            {policy.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {policy.description}
                                        </p>

                                        {/* Arrow */}
                                        <div className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                                            Edit Policy
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        💡 Quick Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                        <li>• Changes are saved immediately when you click the Save button</li>
                        <li>• Contact Us page supports FAQs, business hours, and social media links</li>
                        <li>• Privacy, Cookie, and Terms pages support rich HTML content</li>
                        <li>• All pages are automatically displayed in the website footer</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
