'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useConfig } from '@/contexts/ConfigContext';
import { configAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function GeneralSettingsPage() {
    const router = useRouter();
    const { config, refreshConfig } = useConfig();
    const [loading, setLoading] = useState(false);

    // Local state for the form
    const [formData, setFormData] = useState({
        siteName: '',
        siteDescription: '',
        siteKeywords: ''
    });

    // Load initial values from context when available
    useEffect(() => {
        if (config?.siteIdentity) {
            setFormData({
                siteName: config.siteIdentity.siteName || 'Fluxor News',
                siteDescription: config.siteIdentity.siteDescription || '',
                siteKeywords: config.siteIdentity.siteKeywords || ''
            });
        }
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Use centralized API client which handles tokens automatically
            const response = await configAPI.update({
                siteIdentity: formData
            });

            if (!response.success) throw new Error(response.message || 'Failed to update settings');

            await refreshConfig(); // Refresh context to update global UI immediately
            toast.success('Settings updated successfully!');
            router.refresh(); // Refresh Next.js server components if any

        } catch (error: any) {
            console.error('Settings update error:', error);
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">General Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Configuring site identity and global SEO.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/admin/settings')}
                    >
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Settings
                    </Button>
                    <Button
                        type="submit"
                        form="general-settings-form"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-neutral-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <form id="general-settings-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Site Identity Section */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </span>
                                Site Identity
                            </h2>
                            <div className="space-y-6 pl-10">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Site Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="siteName"
                                        value={formData.siteName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-neutral-200 bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g. Fluxor News"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        This name appears in the browser tab, header, and footer.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Default Meta Description
                                    </label>
                                    <textarea
                                        name="siteDescription"
                                        value={formData.siteDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-neutral-200 bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Brief description of your news publication..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Global Keywords
                                    </label>
                                    <input
                                        type="text"
                                        name="siteKeywords"
                                        value={formData.siteKeywords}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-neutral-200 bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g. news, politics, world, tech"
                                    />
                                </div>
                            </div>
                        </section>


                    </form>
                </div>
            </div>
        </div>
    );
}
