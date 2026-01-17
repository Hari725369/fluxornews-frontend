'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { categoriesAPI, configAPI } from '@/lib/api';
import { Category } from '@/types';
import Sidebar from './Sidebar';
import OnboardingModal from '@/components/auth/OnboardingModal';
import { getImageUrl } from '@/lib/utils';
import { useConfig } from '@/contexts/ConfigContext';

interface HeaderProps {
    initialCategories?: Category[];
}

export default function Header({ initialCategories }: HeaderProps) {
    const [theme, setTheme] = useState('light');
    const [categories, setCategories] = useState<Category[]>(initialCategories || []);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | 'subscribe'>('signin');
    const [readerUser, setReaderUser] = useState<{ name: string; email: string } | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const { config } = useConfig();
    const pathname = usePathname();
    const router = useRouter();

    // logo URL logic
    const logoUrl = config?.branding?.logo ? getImageUrl(config.branding.logo) : '/logo.png';

    // Click outside handlers
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // Sync state if prop changes (e.g. navigation between pages with different data)
    useEffect(() => {
        if (initialCategories && initialCategories.length > 0) {
            setCategories(initialCategories);
        }
    }, [initialCategories]);

    useEffect(() => {
        // Initialize theme
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const hasDarkClass = document.documentElement.classList.contains('dark');

            let initialTheme = 'light';
            if (storedTheme) {
                initialTheme = storedTheme;
            } else if (hasDarkClass) {
                initialTheme = 'dark';
            } else if (systemDark) {
                initialTheme = 'dark';
            }

            if (initialTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            setTheme(initialTheme);

            // Check for logged in reader
            const userData = localStorage.getItem('readerUser');
            if (userData) {
                try {
                    setReaderUser(JSON.parse(userData));
                } catch { }
            }
            // Mark auth check as complete
            setIsAuthReady(true);
        }

        const fetchCategories = async () => {
            // Only fetch if we didn't receive initial data
            if (!initialCategories || initialCategories.length === 0) {
                try {
                    const response = await categoriesAPI.getAll();
                    if (response.success && response.data) {
                        setCategories(response.data);
                    }
                } catch (err) {
                    console.error('Failed to load categories', err);
                }
            }
        };

        // If we have initial categories, we skip fetch, or we could fetch purely to revalidate.
        // For now, minimizing flash means NOT fetching if we have data.
        fetchCategories();

        // Listen for auth changes
        const handleAuthChange = () => {
            const userData = localStorage.getItem('readerUser');
            if (userData) {
                try {
                    setReaderUser(JSON.parse(userData));
                } catch { }
            } else {
                setReaderUser(null);
            }
        };
        window.addEventListener('readerAuthChange', handleAuthChange);

        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('readerAuthChange', handleAuthChange);
        };
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setTheme('light');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            router.push(`/search?q=${encodedQuery}`);
        }
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setTimeout(() => {
                const input = document.getElementById('search-input');
                if (input) input.focus();
            }, 100);
        }
    };

    const openAuthModal = (tab: 'signin' | 'signup' | 'subscribe') => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('readerToken');
        localStorage.removeItem('readerUser');
        setReaderUser(null);
        setShowUserMenu(false);
        window.dispatchEvent(new Event('readerAuthChange'));
    };

    // Filter only top-level categories that are enabled for header
    const topLevelCategories = categories.filter(c => !c.parent && c.showInHeader);

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0F0F0F] border-b border-gray-200 dark:border-[#1a1a1a] shadow-sm">
            {/* Auth/Onboarding Modal */}
            <OnboardingModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                categories={categories}
                onSignIn={() => { setIsSidebarOpen(false); openAuthModal('signin'); }}
                user={readerUser}
                showSignIn={config?.features?.showSignInButton}
            />

            <div className="container mx-auto px-4 max-w-[1200px]">
                {/* Top Bar */}
                <div className="flex h-12 items-center justify-between gap-4">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            {/* Logo Logic: Try Image -> Fallback to Text */}
                            {!logoError ? (
                                <div className="relative h-8 leading-none flex items-center">
                                    <img
                                        src={logoUrl}
                                        alt="Fluxor"
                                        className="h-full w-auto object-contain max-w-[180px]"
                                        onError={() => setLogoError(true)}
                                    />
                                </div>
                            ) : (
                                <span className="font-extrabold text-2xl tracking-tight text-primary font-serif">
                                    Fluxor
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <nav className="hidden md:flex flex-1 items-center justify-center gap-6 overflow-x-auto no-scrollbar mx-4">
                        {/* Home Link */}
                        <Link
                            href="/"
                            className={`text-[14px] font-medium whitespace-nowrap transition-colors ${pathname === '/'
                                ? 'text-primary dark:text-primary border-b-2 border-primary dark:border-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-b-2 hover:border-gray-300'
                                }`}
                        >
                            Home
                        </Link>

                        {/* Category Links */}
                        {topLevelCategories.map((cat) => (
                            <Link
                                key={cat._id}
                                href={`/category/${cat.slug}`}
                                className={`text-[14px] font-medium whitespace-nowrap transition-colors ${pathname === `/category/${cat.slug}`
                                    ? 'text-primary dark:text-primary border-b-2 border-primary dark:border-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-b-2 hover:border-gray-300'
                                    }`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Search + Theme Toggle + Auth + Hamburger */}
                    <div className="flex items-center gap-3">

                        {/* Direct Search Link - Conditionally rendered */}
                        {config?.features?.enableSearch !== false && (
                            <Link
                                href="/search"
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Search"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Link>
                        )}

                        {/* Theme Toggle - Hidden if disabled in settings */}
                        {config?.features?.enableDarkMode !== false && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        )}



                        {/* Auth Button / User Menu */}
                        <div>
                            {isAuthReady && config?.features?.showSignInButton !== false && (
                                readerUser ? (
                                    <div ref={userMenuRef} className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                                {(readerUser.name || readerUser.email).charAt(0).toUpperCase()}
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{readerUser.name || 'Reader'}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{readerUser.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/profile?tab=saved"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        My Saved Articles
                                                    </Link>
                                                    <Link
                                                        href="/profile?tab=notifications"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        My Notifications
                                                    </Link>
                                                    <Link
                                                        href="/profile?tab=interests"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        My Interests
                                                    </Link>
                                                </div>
                                                <div className="border-t border-gray-200 dark:border-gray-700">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openAuthModal('signin')}
                                        className="px-4 py-1.5 bg-primary hover:bg-primary-600 text-white rounded-full text-[14px] font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        Sign In
                                    </button>
                                )
                            )}
                        </div>

                        {/* Hamburger Menu - MOVED TO RIGHT */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

