'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const currentProgress = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
            }
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
            <div
                className="h-full bg-[#C4161C] dark:bg-[#E5484D] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
