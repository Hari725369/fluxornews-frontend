import React, { useState } from 'react';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    className?: string;
    variant?: 'inline' | 'prominent';
}

export default function SearchBar({
    placeholder = 'Search articles...',
    onSearch,
    className = '',
    variant = 'inline',
}: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && onSearch) {
            onSearch(query.trim());
        }
    };

    const handleClear = () => {
        setQuery('');
    };

    if (variant === 'prominent') {
        // Prominent search for hero sections
        return (
            <form onSubmit={handleSubmit} className={`w-full ${className}`}>
                <div className="relative">
                    <div className="relative flex items-center">
                        {/* Search Icon */}
                        <div className="absolute left-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            className="w-full h-14 pl-12 pr-32 text-base bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C4161C] dark:focus:ring-[#E5484D] focus:border-transparent transition-all shadow-sm"
                        />

                        {/* Clear Button */}
                        {query && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-24 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label="Clear search"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="absolute right-2 h-10 px-5 bg-[#C4161C] dark:bg-[#E5484D] hover:bg-[#A01217] dark:hover:bg-[#D63C42] text-white rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    // Inline search for headers
    return (
        <form onSubmit={handleSubmit} className={`w-full ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-10 pl-4 pr-20 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C4161C] dark:focus:ring-[#E5484D] focus:border-transparent transition-all"
                />

                {/* Clear Button */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Clear search"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Search Button */}
                <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 bg-[#C4161C] dark:bg-[#E5484D] hover:bg-[#A01217] dark:hover:bg-[#D63C42] text-white rounded-md text-xs font-semibold transition-all active:scale-95"
                >
                    Search
                </button>
            </div>
        </form>
    );
}
