'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { configAPI } from '@/lib/api';
import { GoogleOAuthProvider } from '@react-oauth/google';

export interface SiteFeatures {
    enableEmailSubscribe: boolean;
    enableTags: boolean;
    enableComments: boolean;
    enableDarkMode: boolean;
    enableReadingTime: boolean;
    enableRelatedArticles: boolean;
    enableSocialShare: boolean;
    enableSearch: boolean;
    showAuthorName: boolean;
    showCountryName: boolean;
    showDateTime: boolean;
    showSignInButton: boolean;
    enableSaveForLater: boolean;
    showPostIntro: boolean;
}

export interface SiteConfig {
    homeLayout: {
        columns: number;
    };
    branding: {
        logo: string;
        favicon: string;
    };
    features: SiteFeatures;
    socialLinks: {
        [key: string]: {
            url: string;
            enabled: boolean;
        };
    };
    footer: {
        copyrightText: string;
        description: string;
    };
}

const defaultFeatures: SiteFeatures = {
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
};

// Default config that matches the structure
const defaultConfig: SiteConfig = {
    homeLayout: { columns: 3 },
    branding: { logo: '', favicon: '' },
    features: defaultFeatures,
    socialLinks: {},
    footer: { copyrightText: '', description: '' },
};

interface ConfigContextType {
    config: SiteConfig | null;
    loading: boolean;
    refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType>({
    config: defaultConfig,
    loading: true,
    refreshConfig: async () => { },
});

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            console.log('🔄 Fetching site config...');
            const response = await configAPI.get();
            if (response.success && response.data) {
                console.log('✅ Config loaded:', response.data);
                const receivedConfig = response.data as Partial<SiteConfig>;
                // Merge received config with defaults to ensure all fields exist
                // This handles cases where API might list a partial config
                setConfig((prev) => ({
                    ...prev,
                    ...receivedConfig,
                    features: {
                        ...prev.features,
                        ...(receivedConfig.features || {})
                    }
                } as SiteConfig));
            }
        } catch (error) {
            console.error('❌ Failed to fetch site config:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <ConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
                {children}
            </ConfigContext.Provider>
        </GoogleOAuthProvider>
    );
}

export function useConfig() {
    return useContext(ConfigContext);
}

// Convenience hooks for specific features
export function useFeature(featureName: keyof SiteFeatures): boolean {
    const { config } = useConfig();
    if (!config) return defaultFeatures[featureName];
    return config.features[featureName] ?? defaultFeatures[featureName];
}
