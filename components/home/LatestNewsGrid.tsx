'use client';

import ArticleCard from '@/components/article/ArticleCard';
import { Article } from '@/types';

interface LatestNewsGridProps {
    articles: Article[];
}

export default function LatestNewsGrid({ articles }: LatestNewsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
            ))}
        </div>
    );
}
