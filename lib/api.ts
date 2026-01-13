import { ApiResponse, Article, Category, Tag, LoginCredentials, AuthResponse, Comment } from '@/types';

const API_URL = 'http://127.0.0.1:5000/api';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log('Currently using API_URL:', API_URL);

// Helper function to get auth token from localStorage
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        // Check for reader token first (for public/reader auth), then admin token
        return localStorage.getItem('readerToken') || localStorage.getItem('token');
    }
    return null;
};

// Helper function to make API requests
export async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        // Handle case where local token exists but user doesn't exist in DB (e.g. DB reset)
        if (response.status === 401 && data.message === 'Reader not found') {
            if (typeof window !== 'undefined') {
                console.warn('Reader not found, clearing local session...');
                localStorage.removeItem('readerToken');
                localStorage.removeItem('readerUser');
                window.location.href = '/'; // Redirect to home/refresh to clear state
                return data; // Stop propagation or return empty
            }
        }
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

// Auth API
export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
        const response = await fetchAPI<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Store token and user data
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('adminToken', response.data.token);
        }
        if (response.data?.user) {
            localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        }

        return response;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },

    verifyToken: async (): Promise<ApiResponse<any>> => {
        return fetchAPI('/auth/verify', { method: 'POST' });
    },

    getCurrentUser: async (): Promise<ApiResponse<any>> => {
        return fetchAPI('/auth/me');
    },
};

// Articles API
export const articlesAPI = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        search?: string;
        status?: string;
        isTrending?: boolean;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<Article[]>> => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });
        }
        const query = queryParams.toString();
        return fetchAPI(`/articles${query ? `?${query}` : ''}`);
    },

    getBySlug: async (slug: string): Promise<ApiResponse<Article>> => {
        return fetchAPI(`/articles/${slug}`);
    },

    getById: async (id: string): Promise<ApiResponse<Article>> => {
        return fetchAPI(`/articles/id/${id}`);
    },

    getStats: async (): Promise<ApiResponse<{ total: number; published: number; drafts: number; views: number }>> => {
        return fetchAPI('/articles/stats');
    },

    create: async (articleData: Partial<Article>): Promise<ApiResponse<Article>> => {
        return fetchAPI('/articles', {
            method: 'POST',
            body: JSON.stringify(articleData),
        });
    },

    update: async (id: string, articleData: Partial<Article>): Promise<ApiResponse<Article>> => {
        return fetchAPI(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(articleData),
        });
    },

    togglePublish: async (id: string): Promise<ApiResponse<Article>> => {
        return fetchAPI(`/articles/${id}/publish`, {
            method: 'PATCH',
        });
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
        return fetchAPI(`/articles/${id}`, {
            method: 'DELETE',
        });
    },

    submitForReview: async (id: string): Promise<ApiResponse<Article>> => {
        return fetchAPI(`/articles/${id}/submit`, {
            method: 'PATCH',
        });
    },

    getRelated: async (id: string): Promise<ApiResponse<Article[]>> => {
        return fetchAPI(`/articles/${id}/related`);
    },
};

// Categories API
export const categoriesAPI = {
    getAll: async (): Promise<ApiResponse<Category[]>> => {
        return fetchAPI('/categories');
    },

    getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
        return fetchAPI(`/categories/${slug}`);
    },

    create: async (categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
        return fetchAPI('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    },

    update: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
        return fetchAPI(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
        return fetchAPI(`/categories/${id}`, {
            method: 'DELETE',
        });
    },

    reorder: async (categories: { _id: string, order: number, isActive?: boolean, showInHeader?: boolean }[]): Promise<ApiResponse<void>> => {
        return fetchAPI('/categories/reorder', {
            method: 'PUT',
            body: JSON.stringify({ categories })
        });
    },
};

// Tags API
export const tagsAPI = {
    getAll: async (): Promise<ApiResponse<Tag[]>> => {
        return fetchAPI('/tags');
    },

    create: async (tagData: Partial<Tag>): Promise<ApiResponse<Tag>> => {
        return fetchAPI('/tags', {
            method: 'POST',
            body: JSON.stringify(tagData),
        });
    },

    update: async (id: string, tagData: Partial<Tag>): Promise<ApiResponse<Tag>> => {
        return fetchAPI(`/tags/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tagData),
        });
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
        return fetchAPI(`/tags/${id}`, {
            method: 'DELETE',
        });
    },
};

// Users API
export const usersAPI = {
    getAll: async (): Promise<ApiResponse<any[]>> => {
        return fetchAPI('/users');
    },

    getUserStats: async (userId: string, startDate?: Date, endDate?: Date): Promise<ApiResponse<any>> => {
        let url = `/users/${userId}/stats`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return fetchAPI(url);
    },
};

// Upload API
export const uploadAPI = {
    uploadImage: async (file: File, folder?: string): Promise<ApiResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append('image', file);

        const token = getToken();
        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const url = folder ? `${API_URL}/upload?folder=${folder}` : `${API_URL}/upload`;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data;
    },
};

export const configAPI = {
    get: () => fetchAPI('/config', { cache: 'no-store' }),
    update: (data: any) => fetchAPI('/config', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

// Reader/Public Auth API
export const readerAPI = {
    sendOTP: async (email: string): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    verifyOTP: async (email: string, otp: string, name?: string, interests?: string[]): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp, name, interests }),
        });
    },

    updateProfile: async (data: { name?: string; interests?: string[] }): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    googleLogin: async (token: string): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/google-login', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },
    getMe: async (): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
        });
    },
    updateMe: async (data: { name?: string; interests?: string[] }): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/me', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` },
            body: JSON.stringify(data),
        });
    },
    getSavedArticles: async (): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/saved-articles', {
            headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
        });
    },
    saveArticle: async (articleId: string): Promise<ApiResponse<any>> => {
        return fetchAPI(`/readers/saved-articles/${articleId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
        });
    },
    unsaveArticle: async (articleId: string): Promise<ApiResponse<any>> => {
        return fetchAPI(`/readers/saved-articles/${articleId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
        });
    },

    subscribe: async (email: string): Promise<ApiResponse<any>> => {
        return fetchAPI('/readers/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }
};

// Comments API
export const commentsAPI = {
    getArticleComments: (articleId: string) => fetchAPI<Comment[]>(`/comments/article/${articleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
    }),
    postComment: (data: { articleId: string, authorName: string, content: string, readerId?: string }) =>
        fetchAPI<Comment>('/comments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    toggleLike: (commentId: string) => fetchAPI<{ likes: number, hasLiked: boolean }>(`/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
    }),
    deleteComment: (commentId: string) => fetchAPI<void>(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` }
    }),
    updateComment: (commentId: string, content: string) => fetchAPI<Comment>(`/comments/${commentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('readerToken')}` },
        body: JSON.stringify({ content })
    }),
};

export const newsletterAPI = {
    send: (data: { subject: string, html: string }) => fetchAPI('/newsletter/send', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    test: (data: { subject: string, html: string }) => fetchAPI('/newsletter/test', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

export const homepageAPI = {
    get: async (): Promise<ApiResponse<any>> => {
        return fetchAPI('/homepage', { cache: 'no-store' });
    },
    update: async (data: any): Promise<ApiResponse<any>> => {
        return fetchAPI('/homepage', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};
