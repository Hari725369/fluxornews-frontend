// Article type
export interface Article {
    _id: string;
    title: string;
    slug: string;
    intro?: string; // Added optional intro
    content: string;
    featuredImage: string;
    imageAlt: string;
    category: Category | string | null;
    tags: string[];
    country?: string;
    status: 'draft' | 'review' | 'published' | 'inactive' | 'rejected';
    author: AdminUser; // Author is mandatory in backend
    editor?: AdminUser; // Editor is optional
    views: number;
    lifecycleStage?: 'hot' | 'archive' | 'cold';
    isFeatured?: boolean;
    isTrending?: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    showPublishDate?: boolean;
    isDeleted?: boolean;
    deletedAt?: string;
    deletedBy?: AdminUser | string;
}

// Category type
export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    metaTitle?: string;
    metaKeywords?: string;
    parent?: Category | string; // Can be populated object or ID
    isActive?: boolean;
    showInHeader?: boolean;
    order: number;
    articleCount?: number;
    createdAt: string;
}

// Tag type
export interface Tag {
    _id: string;
    name: string;
    slug: string;
    createdAt: string;
}

// Admin User type
export interface AdminUser {
    _id: string;
    email: string;
    name: string;
    role: 'superadmin' | 'editor' | 'writer';
    status?: 'active' | 'suspended';
    directPublishEnabled?: boolean; // Added permission flag
    createdAt: string;
}

// Comment type
export interface Comment {
    _id: string;
    article: string | Article;
    authorName: string;
    content: string;
    reader?: string;
    likes: number;
    likedBy: string[];
    status: 'approved' | 'rejected' | 'spam' | 'pending';
    isEdited?: boolean;
    editedAt?: string;
    createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    count?: number;
    total?: number;
    page?: number;
    pages?: number;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: 'superadmin' | 'editor' | 'writer';
    };
}

// Homepage Config type
export interface HomepageConfig {
    heroArticle?: Article | null;
    subFeaturedArticles?: Article[];
    breakingNews?: {
        active: boolean;
        text: string;
        link: string;
    };
    sections?: {
        _id: string;
        category: string;
        layout: 'grid' | 'list' | 'carousel';
        order: number;
        active: boolean;
    }[];
    lastUpdated?: string;
}

export interface SiteFeatures {
    enableEmailSubscribe?: boolean;
    enableTags?: boolean;
    enableComments?: boolean;
    enableDarkMode?: boolean;
    enableReadingTime?: boolean;
    enableRelatedArticles?: boolean;
    enableSocialShare?: boolean;
    enableSearch?: boolean;
    showAuthorName?: boolean;
    showCountryName?: boolean;
    showDateTime?: boolean;
    showSignInButton?: boolean;
    enableSaveForLater?: boolean;
}

export interface SiteConfig {
    homeLayout?: {
        columns: number;
    };
    branding?: {
        logo: string;
        favicon: string;
    };
    features?: SiteFeatures;
    socialLinks?: Record<string, { url: string; enabled: boolean }>;
    footer?: {
        copyrightText: string;
        description: string;
    };
    policies?: any;
    updatedBy?: string;
    updatedAt?: string;
}

