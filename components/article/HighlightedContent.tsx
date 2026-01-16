'use client';

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { Article } from '@/types';

interface HighlightedContentProps {
    htmlContent: string;
    activeIndex: number;
    activeCharIndex?: number;
    readAlsoArticles?: Article[]; // New prop
    className?: string;
}

export default function HighlightedContent({ htmlContent, activeIndex, activeCharIndex = 0, readAlsoArticles = [], className = '' }: HighlightedContentProps) {
    const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Helper component for Read Also card
    const ReadAlso = ({ article }: { article: Article }) => (
        <div className="my-8 p-6 bg-gray-50 dark:bg-zinc-900 border-l-4 border-primary rounded-r-lg not-prose">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Read Also</span>
            <Link
                href={`/article/${article.slug}`}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors leading-tight"
            >
                {article.title}
            </Link>
        </div>
    );

    useEffect(() => {
        // Force all links to open in new tab
        if (containerRef.current) {
            const links = containerRef.current.querySelectorAll('a');
            links.forEach(link => {
                // exclude our own read-also links if any end up inside dangerous html (unlikely)
                if (!link.innerText.includes('Read Also')) {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.classList.add('text-primary', 'hover:underline');
                }
            });
        }
    }, [htmlContent, renderedContent]);

    useEffect(() => {
        // Mode 1: Standard Reading (Inject Read Also)
        if (activeIndex === -1) {
            // Split by paragraph closing tag
            const parts = htmlContent.split('</p>');
            const nodes: React.ReactNode[] = [];

            parts.forEach((part, index) => {
                if (!part.trim()) return;

                // Re-add the closing tag that was stripped
                const htmlSnippet = part + '</p>';
                nodes.push(<div key={`p-${index}`} dangerouslySetInnerHTML={{ __html: htmlSnippet }} />);

                // Inject after paragraph 3 (index 2) and 7 (index 6)
                if (index === 2 && readAlsoArticles[0]) {
                    nodes.push(<ReadAlso key="read-also-1" article={readAlsoArticles[0]} />);
                }
                if (index === 6 && readAlsoArticles[1]) {
                    nodes.push(<ReadAlso key="read-also-2" article={readAlsoArticles[1]} />);
                }
            });

            setRenderedContent(nodes);
            return;
        }

        // Mode 2: Voice Reader (Highlighting Logic)
        // Keep existing complicated logic, but ignore Read Also to ensure smooth reading flow
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const paragraphs = Array.from(tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));

        let sentenceCount = 0;

        const contentNodes = paragraphs.map((par, pIdx) => {
            const htmlPar = par as HTMLElement;
            const text = htmlPar.innerText || '';
            const tag = htmlPar.tagName.toLowerCase();

            // Split text into sentences while trying to be smart about it
            const sentences = text.split(/([.!?]+\s+)/).filter(Boolean);

            // Re-group separator with text
            const groupedSentences: string[] = [];
            for (let i = 0; i < sentences.length; i++) {
                if (i % 2 === 0) {
                    groupedSentences.push(sentences[i] + (sentences[i + 1] || ''));
                }
            }

            const sentenceNodes = groupedSentences.map((s, sIdx) => {
                const globalIndex = sentenceCount++;
                const isHighlight = globalIndex === activeIndex;
                const isPast = globalIndex < activeIndex && activeIndex !== -1;

                if (isHighlight && activeCharIndex >= 0) {
                    // Word-level highlighting logic for the active sentence
                    let charCount = 0;
                    const words = s.split(/(\s+)/); // preserving spaces

                    const wordNodes = words.map((word, wIdx) => {
                        const start = charCount;
                        const end = charCount + word.length;

                        const isActiveWord = activeCharIndex >= start && activeCharIndex < end && word.trim().length > 0;
                        charCount = end;

                        return (
                            <span
                                key={`${pIdx}-${sIdx}-${wIdx}`}
                                className={isActiveWord ? 'bg-primary/20 text-gray-900 dark:text-white rounded-[2px] shadow-[0_0_4px_rgba(208,44,90,0.1)]' : ''}
                            >
                                {word}
                            </span>
                        );
                    });

                    return (
                        <span
                            key={`${pIdx}-${sIdx}`}
                            data-sentence-index={globalIndex}
                            className="transition-all duration-300 rounded-sm inline-block px-0.5 bg-primary/5 dark:bg-primary/10"
                        >
                            {wordNodes}
                        </span>
                    );
                }

                return (
                    <span
                        key={`${pIdx}-${sIdx}`}
                        data-sentence-index={globalIndex}
                        className={`transition-all duration-300 rounded-sm inline-block px-0.5 ${isPast
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-gray-100'
                            }`}
                    >
                        {s}
                    </span>
                );
            });

            const Tag = tag as any;
            return <Tag key={pIdx} className="mb-4 leading-relaxed text-gray-900 dark:text-gray-100">{sentenceNodes}</Tag>;
        });

        // Fallback or empty content
        if (contentNodes.length === 0) {
            setRenderedContent([<div key="fallback" dangerouslySetInnerHTML={{ __html: htmlContent }} />]);
        } else {
            setRenderedContent(contentNodes);
        }

    }, [htmlContent, activeIndex, activeCharIndex, readAlsoArticles]);

    useEffect(() => {
        if (activeIndex === -1) return;

        // Auto-scroll the active sentence into view
        const activeElement = document.querySelector(`[data-sentence-index="${activeIndex}"]`);
        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex]);

    return (
        <div ref={containerRef} className={`editorial-body editorial-typography prose max-w-none dark:prose-invert leading-loose text-[16px] 
            [&_p]:text-[16px] [&_p]:text-gray-800 [&_p]:dark:!text-gray-100 
            [&_h1]:text-gray-900 [&_h1]:dark:!text-white 
            [&_h2]:text-gray-900 [&_h2]:dark:!text-white 
            [&_h3]:text-gray-900 [&_h3]:dark:!text-white 
            [&_li]:text-[16px] [&_li]:text-gray-800 [&_li]:dark:!text-gray-100 
            [&_strong]:text-gray-900 [&_strong]:dark:!text-white
            [&_*]:dark:!text-gray-100/90
            ${className}`}>
            {renderedContent}
        </div>
    );
}
