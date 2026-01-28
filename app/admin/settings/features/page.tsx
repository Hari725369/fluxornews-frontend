'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useConfig } from '@/contexts/ConfigContext';
import { configAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { SiteFeatures } from '@/contexts/ConfigContext';

export default function FeatureSettingsPage() {
    const router = useRouter();
    const { config, refreshConfig } = useConfig();
    const [loading, setLoading] = useState(false);

    // Default state matching interface
    const [features, setFeatures] = useState<SiteFeatures>({
        enableEmailSubscribe: true,
        enableTags: true,
        enableComments: true,
        enableDarkMode: true,
        enableReadingTime: true,
        enableRelatedArticles: true,
        enableSocialShare: true,
        enableSearch: true,
        showAuthorName: true,
        showCountryName: true,
        showDateTime: true,
        showSignInButton: true,
        enableSaveForLater: true,
        showPostIntro: true,
    });

    useEffect(() => {
        if (config?.features) {
            setFeatures(config.features);
        }
    }, [config]);

    const handleToggle = (key: keyof SiteFeatures) => {
        setFeatures(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await configAPI.update({
                features: features
            });

            if (!response.success) throw new Error(response.message || 'Failed to update features');

            await refreshConfig();
            toast.success('Features updated successfully!', { id: 'feature-save' });
            router.refresh();

        } catch (error: any) {
            console.error('Features update error:', error);
            toast.error(error.message || 'Failed to update features');
        } finally {
            setLoading(false);
        }
    };

    // Helper component for a toggle switch
    const FeatureToggle = ({
        label,
        description,
        featureKey,
        enabled
    }: {
        label: string,
        description: string,
        featureKey: keyof SiteFeatures,
        enabled: boolean
    }) => (
        <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-neutral-200 rounded-lg group hover:border-primary/30 transition-colors">
            <div className="flex-1 pr-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => handleToggle(featureKey)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                role="switch"
                aria-checked={enabled}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Feature Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Toggle site functionality and UI elements globally.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/admin/settings')}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Settings
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="primary"
                        disabled={loading}
                        className="min-w-[140px] shadow-sm"
                    >
                        {loading ? 'Saving...' : 'Save Features'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                    {/* Global Site Features */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">🌍</span> Global Features
                        </h2>

                        <FeatureToggle
                            label="Dark Mode"
                            description="Allow users to switch between light and dark themes."
                            featureKey="enableDarkMode"
                            enabled={features.enableDarkMode}
                        />
                        <FeatureToggle
                            label="Global Search"
                            description="Show search bar in header and allow article searching."
                            featureKey="enableSearch"
                            enabled={features.enableSearch}
                        />
                        <FeatureToggle
                            label="Sign In Button"
                            description="Show 'Sign In' button in the header for readers."
                            featureKey="showSignInButton"
                            enabled={features.showSignInButton}
                        />
                        <FeatureToggle
                            label="Save For Later"
                            description="Allow logged-in readers to bookmark articles."
                            featureKey="enableSaveForLater"
                            enabled={features.enableSaveForLater}
                        />
                    </div>

                    {/* Article Display */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">📄</span> Article Display
                        </h2>
                        <FeatureToggle
                            label="Author Name"
                            description="Display the author's name on article pages."
                            featureKey="showAuthorName"
                            enabled={features.showAuthorName}
                        />
                        <FeatureToggle
                            label="Publish Date"
                            description="Show the date when the article was published."
                            featureKey="showDateTime"
                            enabled={features.showDateTime}
                        />
                        <FeatureToggle
                            label="Reading Time"
                            description="Show estimated reading time (e.g. '5 min read')."
                            featureKey="enableReadingTime"
                            enabled={features.enableReadingTime}
                        />
                        <FeatureToggle
                            label="Country / Location"
                            description="Show location tag if specified in article."
                            featureKey="showCountryName"
                            enabled={features.showCountryName}
                        />
                        <FeatureToggle
                            label="Intro Paragraph"
                            description="Display the bold intro/catchment text before content."
                            featureKey="showPostIntro"
                            enabled={features.showPostIntro}
                        />
                    </div>

                    {/* Engagement & Social */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">💬</span> Engagement
                        </h2>
                        <FeatureToggle
                            label="Comments System"
                            description="Allow readers to post comments on articles."
                            featureKey="enableComments"
                            enabled={features.enableComments}
                        />
                        <FeatureToggle
                            label="Social Share Buttons"
                            description="Show Facebook, Twitter, LinkedIn share buttons."
                            featureKey="enableSocialShare"
                            enabled={features.enableSocialShare}
                        />
                        <FeatureToggle
                            label="Email Subscription"
                            description="Show newsletter subscription form in footer/sidebar."
                            featureKey="enableEmailSubscribe"
                            enabled={features.enableEmailSubscribe}
                        />
                    </div>

                    {/* Taxonomy & Navigation */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">🏷️</span> Taxonomy
                        </h2>
                        <FeatureToggle
                            label="Tags System"
                            description="Enable tagging system and display tags on articles."
                            featureKey="enableTags"
                            enabled={features.enableTags}
                        />
                        <FeatureToggle
                            label="Related Articles"
                            description="Show 'You might also like' section at bottom of articles."
                            featureKey="enableRelatedArticles"
                            enabled={features.enableRelatedArticles}
                        />
                    </div>

                </div>

            </form>
        </div>
    );
}
