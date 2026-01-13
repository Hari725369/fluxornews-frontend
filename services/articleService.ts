import api from './api';

export interface Article {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: { _id: string; name: string; slug: string } | string;
    author: { _id: string; name: string };
    status: 'draft' | 'published' | 'archived';
    image?: string;
    tags: string[];
    views: number;
    createdAt: string;
    publishedAt?: string;
}

export interface GetArticlesParams {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    tag?: string;
}

export interface ArticlesResponse {
    articles: Article[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}

const articleService = {
    getArticles: async (params: GetArticlesParams = {}): Promise<ArticlesResponse> => {
        const response = await api.get('/articles', { params });
        return response.data;
    },

    getArticle: async (idOrSlug: string): Promise<Article> => {
        const response = await api.get(`/articles/${idOrSlug}`);
        return response.data;
    },

    createArticle: async (data: Partial<Article>): Promise<Article> => {
        const response = await api.post('/articles', data);
        return response.data;
    },

    updateArticle: async (id: string, data: Partial<Article>): Promise<Article> => {
        const response = await api.put(`/articles/${id}`, data);
        return response.data;
    },

    deleteArticle: async (id: string): Promise<void> => {
        await api.delete(`/articles/${id}`);
    }
};

export default articleService;
