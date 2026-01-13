'use client';

import { Category } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onSignIn: () => void;
    user: { name: string; email: string } | null;
    showSignIn?: boolean;
}

export default function Sidebar({ isOpen, onClose, categories, onSignIn, user, showSignIn }: SidebarProps) {
    const pathname = usePathname();

    // Filter categories to show only active ones
    const activeCategories = categories.filter(c => c.isActive !== false);
    const topLevelCategories = activeCategories.filter(c => !c.parent);

    const getChildren = (parentId: string) => {
        return activeCategories.filter(c => {
            if (typeof c.parent === 'string') return c.parent === parentId;
            if (c.parent && typeof c.parent === 'object') return c.parent._id === parentId;
            return false;
        });
    };

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-[190] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer (Right Side) */}
            <div className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white shadow-2xl z-[200] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header/Close Area */}
                <div className="flex flex-col border-b border-gray-200 dark:border-gray-900/50">
                    <div className="flex items-center justify-between p-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            Menu
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Sign In / User Section in Sidebar */}
                    <div className="px-4 pb-4">

                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100vh-140px)] scrollbar-hide">
                    <div className="py-2">
                        <ul className="flex flex-col">
                            {/* Home Link */}
                            <li>
                                <Link
                                    href="/"
                                    onClick={onClose}
                                    className={`flex items-center px-6 py-3 text-[14px] font-medium transition-colors border-b border-gray-100 dark:border-gray-900 ${isActive('/')
                                        ? 'bg-primary-50 text-primary border-primary-100 dark:bg-primary dark:text-white dark:border-primary'
                                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    Home
                                </Link>
                            </li>

                            {topLevelCategories.map(cat => {
                                const children = getChildren(cat._id);
                                const isCatActive = isActive(`/category/${cat.slug}`);

                                return (
                                    <li key={cat._id}>
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            onClick={onClose}
                                            className={`flex items-center px-6 py-3 text-[14px] font-medium transition-colors border-b border-gray-100 dark:border-gray-900 ${isCatActive
                                                ? 'bg-primary-50 text-primary border-primary-100 dark:bg-primary dark:text-white dark:border-primary'
                                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            {cat.name}
                                        </Link>

                                        {/* Subcategories */}
                                        {children.length > 0 && (
                                            <ul className="bg-gray-50 dark:bg-[#050505]">
                                                {children.map(child => (
                                                    <li key={child._id}>
                                                        <Link
                                                            href={`/category/${child.slug}`}
                                                            onClick={onClose}
                                                            className={`flex items-center pl-10 pr-6 py-2 text-[14px] transition-colors border-b border-gray-100 dark:border-gray-900/50 ${isActive(`/category/${child.slug}`)
                                                                ? 'text-primary font-medium dark:text-white dark:bg-white/5'
                                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
