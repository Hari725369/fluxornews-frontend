'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, configAPI } from '@/lib/api';

export default function ContactUsEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        enabled: true,
        heading: 'Contact Us',
        description: "Have a question, suggestion, or feedback? We'd love to hear from you.",
        email: '',
        phone: '',
        address: '',
        businessHours: 'Monday - Friday: 9AM - 6PM',
        responseTime: 'We typically respond within 24-48 hours'
    });

    useEffect(() => {
        verifyAuth();
        fetchPolicy();
    }, []);

    const verifyAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data?.role !== 'superadmin') {
                router.push('/admin/dashboard');
            }
        } catch (error) {
            router.push('/admin/login');
        }
    };

    const fetchPolicy = async () => {
        try {
            const response = await configAPI.get();
            if (response.success && (response.data as any)?.policies?.contactUs) {
                const policy = (response.data as any).policies.contactUs;
                setFormData({
                    enabled: policy.enabled ?? true,
                    heading: policy.heading || 'Contact Us',
                    description: policy.description || '',
                    email: policy.otherWays?.email || '',
                    phone: policy.otherWays?.phone || '',
                    address: policy.otherWays?.address || '',
                    businessHours: policy.businessHours?.hours || 'Monday - Friday: 9AM - 6PM',
                    responseTime: policy.responseTime?.text || 'We typically respond within 24-48 hours'
                });
            }
        } catch (error) {
            console.error('Failed to fetch policy:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await configAPI.update({
                policies: {
                    contactUs: {
                        enabled: formData.enabled,
                        heading: formData.heading,
                        description: formData.description,
                        otherWays: {
                            enabled: true,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address
                        },
                        businessHours: {
                            enabled: true,
                            hours: formData.businessHours
                        },
                        responseTime: {
                            enabled: true,
                            text: formData.responseTime
                        }
                    }
                }
            });

            if (response.success) {
                setMessage({ type: 'success', text: 'Contact Us page saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to save contact page' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving contact page' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/admin/settings/policies" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                    <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-neutral-200 p-8">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl">
                                📧
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us Editor</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Manage contact information and page content</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="enabled" checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                            <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Contact Us Page</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Heading</label>
                                <input type="text" value={formData.heading} onChange={(e) => setFormData({ ...formData, heading: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="contact@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="+1 234 567 8900" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="123 News Street, City, Country" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Hours</label>
                                <input type="text" value={formData.businessHours} onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Monday - Friday: 9AM - 6PM" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Time</label>
                                <input type="text" value={formData.responseTime} onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="We typically respond within 24-48 hours" />
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                💡 <strong>Note:</strong> For advanced features like FAQs and social media links, use the existing Site Settings page.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
