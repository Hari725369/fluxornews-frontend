'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioReaderProps {
    content: string;
    onSentenceChange?: (sentence: string) => void;
    onActiveIndexChange?: (index: number) => void;
    onWordBoundary?: (charIndex: number) => void;
}

export default function AudioReader({ content, onSentenceChange, onActiveIndexChange, onWordBoundary }: AudioReaderProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sentences, setSentences] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Parse content into sentences
    useEffect(() => {
        // More robust splitting to catch bullet points and small fragments
        const cleanContent = content.replace(/<[^>]*>/g, ' ');
        const splitSentences = cleanContent
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 3);
        setSentences(splitSentences);
    }, [content]);

    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(-1);
        if (onActiveIndexChange) onActiveIndexChange(-1);
        if (onWordBoundary) onWordBoundary(0);
    };

    const handleReplay = (e: React.MouseEvent) => {
        e.stopPropagation();
        stopSpeech();
        setTimeout(() => {
            setIsPlaying(true);
            setIsPaused(false);
            playSentence(0);
        }, 100);
    };

    const playSentence = (index: number) => {
        if (index >= sentences.length) {
            stopSpeech();
            return;
        }

        setCurrentIndex(index);
        if (onActiveIndexChange) onActiveIndexChange(index);
        if (onSentenceChange) onSentenceChange(sentences[index]);
        if (onWordBoundary) onWordBoundary(0); // Reset char index for new sentence

        const utterance = new SpeechSynthesisUtterance(sentences[index]);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            if (window.speechSynthesis.paused) return; // Don't advance if manually paused
            playSentence(index + 1);
        };

        utterance.onboundary = (event) => {
            if (event.name === 'word' && onWordBoundary) {
                onWordBoundary(event.charIndex);
            }
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handleToggle = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            setIsPaused(false);
            playSentence(0);
        } else {
            // If playing, pause. If paused, resume.
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
        }
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Helper for active state
    const isActive = isPlaying && !isPaused;

    return (
        <div className="fixed bottom-24 md:bottom-24 lg:bottom-12 right-4 md:right-8 lg:right-[160px] z-40 flex items-center justify-center">
            {/* Satellite Buttons Container */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isActive ? 'z-[105]' : '-z-10'}`}>

                {/* Close Button (Left) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        stopSpeech();
                    }}
                    className={`absolute w-10 h-10 bg-[#EF4444] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer pointer-events-auto
                        ${isActive ? '-translate-y-12 -translate-x-10 scale-100 opacity-100' : 'translate-y-0 translate-x-0 scale-50 opacity-0'}
                    `}
                    title="Stop Reading"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Replay Button (Right) */}
                <button
                    onClick={handleReplay}
                    className={`absolute w-10 h-10 bg-[#D02C5A] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-75 cursor-pointer pointer-events-auto
                        ${isActive ? '-translate-y-12 translate-x-10 scale-100 opacity-100' : 'translate-y-0 translate-x-0 scale-50 opacity-0'}
                    `}
                    title="Replay from Start"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Main Toggle Button */}
            <div className={`relative z-[110] group rounded-full ${!isActive ? 'animate-glow-pulse' : ''}`}>
                <style jsx>{`
                    @keyframes glowPulse {
                        0%, 100% { box-shadow: 0 0 0 1px #D02C5A, 0 0 0 0px rgba(208, 44, 90, 0); }
                        50% { box-shadow: 0 0 0 1px #D02C5A, 0 0 5px 0px rgba(208, 44, 90, 0.6); }
                    }
                    .animate-glow-pulse {
                        animation: glowPulse 2s ease-in-out infinite;
                    }
                `}</style>

                <button
                    onClick={handleToggle}
                    className="relative w-12 h-12 bg-black dark:bg-gray-900 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 z-10 border border-white/10"
                    title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Listen to Article'}
                >
                    {isActive ? (
                        /* Pause Icon */
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1.5" />
                            <rect x="14" y="4" width="4" height="16" rx="1.5" />
                        </svg>
                    ) : (
                        /* Speaker Icon */
                        <svg className="w-6 h-6 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" fillOpacity="0.2" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
