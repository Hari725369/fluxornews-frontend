import api from './api';

export interface HomepageConfig {
    _id: string;
    heroArticle: any; // Can be ID or populated object
    subFeaturedArticles: any[];
    breakingNews: {
        active: boolean;
        text: string;
        link: string;
    };
    sections: {
        category: string;
        layout: 'grid' | 'list' | 'carousel';
        order: number;
        active: boolean;
        _id?: string;
    }[];
    lastUpdated: string;
}

export interface UpdateHomepageConfigData {
    heroArticle?: string;
    subFeaturedArticles?: string[];
    breakingNews?: {
        active: boolean;
        text: string;
        link: string;
    };
    sections?: {
        category: string;
        layout: string;
        order: number;
        active: boolean;
    }[];
}

export const homepageService = {
    // Get current configuration
    getConfig: async (): Promise<HomepageConfig> => {
        const response = await api.get('/homepage');
        return response.data;
    },

    // Update configuration
    updateConfig: async (data: UpdateHomepageConfigData): Promise<HomepageConfig> => {
        const response = await api.put('/homepage', data);
        return response.data;
    }
};
