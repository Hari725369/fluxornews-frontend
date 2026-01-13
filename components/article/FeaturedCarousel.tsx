'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';

interface FeaturedCarouselProps {
    articles: Article[];
}

export default function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const featuredArticles = articles.filter(article => article.isFeatured);

    // Auto-scroll every 5 seconds
    useEffect(() => {
        if (featuredArticles.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === featuredArticles.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredArticles.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? featuredArticles.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === featuredArticles.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (featuredArticles.length === 0) {
        return null;
    }

    const currentArticle = featuredArticles[currentIndex];

    // Safety check for image URL
    const safeImage = (currentArticle.featuredImage && !currentArticle.featuredImage.startsWith('file://'))
        ? currentArticle.featuredImage
        : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

    return (
        <div className="relative w-full h-[380px] rounded-lg overflow-hidden mb-8 group">
            {/* Main Image */}
            <Link href={`/article/${currentArticle.slug}`}>
                <div className="relative w-full h-full">
                    <Image
                        src={safeImage}
                        alt={currentArticle.imageAlt || currentArticle.title}
                        fill
                        className="object-cover transition-transform duration-700"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Content */}
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 font-sans">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-primary text-white rounded-md text-xs font-bold shadow-sm uppercase tracking-wide">
                                {(currentArticle.category && typeof currentArticle.category === 'object') ? currentArticle.category.name : 'News'}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2 text-white drop-shadow-md leading-tight font-serif">
                            {currentArticle.title}
                        </h2>
                        <p className="text-sm text-gray-200 line-clamp-2 max-w-3xl drop-shadow-sm font-medium leading-relaxed">
                            {currentArticle.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                    </div>
                </div>
            </Link>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-white/20"
                aria-label="Previous slide"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-white/20"
                aria-label="Next slide"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {featuredArticles.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-primary w-4'
                            : 'bg-white/50 hover:bg-white/80 w-1.5'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
