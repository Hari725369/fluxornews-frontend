'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { articlesAPI, authAPI } from '@/lib/api';
import TrendChart from '@/components/admin/TrendChart';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        views: 0,
    });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [statsRange, setStatsRange] = useState(30);

    const [personalStats, setPersonalStats] = useState<any>(null);

    const [showGlobalStats, setShowGlobalStats] = useState(false);

    useEffect(() => {
        verifyAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, statsRange, showGlobalStats]);

    const verifyAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data) {
                setUser(response.data);
                // Default to global stats for superadmin if they have no personal articles (optional inference)
                // For now, let's just let them toggle it.
            } else {
                authAPI.logout();
                router.push('/admin/login');
            }
        } catch (error: any) {
            if (window.location.pathname !== '/admin/login') {
                authAPI.logout();
                router.push('/admin/login');
            }
            setLoading(false);
            setUser(null);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch global stats (for cards)
            const globalRes = await articlesAPI.getStats();
            if (globalRes.success && globalRes.data) {
                setStats(globalRes.data);
            }

            // Fetch trend stats (Personal or Global)
            if (user && user._id) {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - statsRange);

                const trendRes = await import('@/lib/api').then(m =>
                    m.usersAPI.getUserStats(user._id, startDate, endDate, showGlobalStats)
                );

                if (trendRes.success && trendRes.data) {
                    setPersonalStats(trendRes.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of the code)

    // In the return block for TrendChart:
    /*
                {personalStats && personalStats.dailyStats && (
                    <div className="mb-8">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {showGlobalStats ? 'Site Performance' : 'Your Performance'}
                            </h2>
                            
                            {user?.role === 'superadmin' && (
                                <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setShowGlobalStats(false)}
                                        className={`px-3 py-1 text-sm rounded-md transition-all ${!showGlobalStats ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        My Stats
                                    </button>
                                    <button
                                        onClick={() => setShowGlobalStats(true)}
                                        className={`px-3 py-1 text-sm rounded-md transition-all ${showGlobalStats ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        Global
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <TrendChart
                            data={personalStats.dailyStats}
                            title={showGlobalStats ? "Site Traffic Source" : "Your Content Views"}
                            subtitle={`Views over the last ${statsRange} days`}
                            onRangeChange={setStatsRange}
                        />
                    </div>
                )}
    */

    const handleLogout = () => {
        authAPI.logout();
        router.push('/admin/login');
    };

    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] transition-colors duration-200">
            {/* Top Navigation */}
            <nav className="bg-white dark:bg-[#1A1A1A] shadow-md border-b border-gray-200 dark:border-[#1a1a1a]">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="relative h-8 w-32 md:h-10 md:w-36">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary text-primary text-sm font-medium">
                                Welcome, {user?.name || 'Admin'}
                            </span>

                            {/* Theme Toggle */}
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                            >
                                <span className="hidden dark:inline">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                                <span className="inline dark:hidden">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                </span>
                            </button>

                            {/* Profile Link */}
                            <Link
                                href="/admin/profile"
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Profile Settings"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 bg-primary hover:bg-primary-600 text-white rounded-full text-[14px] font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards - Premium Redesign */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Articles */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border border-gray-200 dark:border-neutral-200 group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full" />
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">ALL</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</p>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Articles</h3>
                    </div>

                    {/* Published */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border border-gray-200 dark:border-neutral-200 group hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/20 to-transparent rounded-bl-full" />
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs text-green-500 font-semibold">LIVE</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.published}</p>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Published</h3>
                    </div>

                    {/* Drafts */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border border-gray-200 dark:border-neutral-200 group hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-bl-full" />
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <span className="text-xs text-yellow-500 font-semibold">WIP</span>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{stats.drafts}</p>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Drafts</h3>
                    </div>

                    {/* Total Views */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border border-gray-200 dark:border-neutral-200 group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full" />
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <span className="text-xs text-purple-500 font-semibold">TOTAL</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stats.views}</p>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Views</h3>
                    </div>
                </div>

                {/* Performance Chart */}
                {personalStats && personalStats.dailyStats && (
                    <div className="mb-8">
                        <TrendChart
                            data={personalStats.dailyStats}
                            title="Your Performance"
                            subtitle={`Views over the last ${statsRange} days`}
                            onRangeChange={setStatsRange}
                        />
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-200 mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href="/admin/articles/new">
                            <Button variant="primary" size="lg" className="w-full">
                                Create New Article
                            </Button>
                        </Link>
                        <Link href="/">
                            <button className="w-full h-12 px-6 text-base rounded-lg inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-gray-300 dark:border-neutral-200 bg-white dark:bg-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-[var(--text-primary)]">
                                View Website
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Article Management - Redesigned */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Article Management</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* All Articles */}
                        <Link href="/admin/articles" className="group">
                            <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all duration-200">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">All Articles</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">View all content</p>
                            </div>
                        </Link>

                        {/* Published */}
                        <Link href="/admin/articles?status=published" className="group">
                            <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all duration-200">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Published</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Live articles</p>
                            </div>
                        </Link>

                        {/* Drafts */}
                        <Link href="/admin/articles?status=draft" className="group">
                            <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-lg transition-all duration-200">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Drafts</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Work in progress</p>
                            </div>
                        </Link>

                        {/* Rejected - Super Admin only */}
                        {user?.role === 'superadmin' && (
                            <Link href="/admin/articles?status=rejected" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Rejected</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Rejected content</p>
                                </div>
                            </Link>
                        )}

                        {/* In Review */}
                        <Link href="/admin/articles?status=review" className="group">
                            <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-200">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">In Review</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pending approval</p>
                            </div>
                        </Link>

                        {/* Categories - Hide from writers */}
                        {user?.role !== 'writer' && (
                            <Link href="/admin/categories" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Categories</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Organize content</p>
                                </div>
                            </Link>
                        )}

                        {/* Tags - Hide from writers */}
                        {user?.role !== 'writer' && (
                            <Link href="/admin/tags" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Tags</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage keywords</p>
                                </div>
                            </Link>
                        )}

                        {/* Comments - New */}
                        <Link href="/admin/comments" className="group">
                            <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-lg transition-all duration-200">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Comments</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Moderation</p>
                            </div>
                        </Link>



                        {/* Trash - Super Admin only */}
                        {user?.role === 'superadmin' && (
                            <Link href="/admin/articles?status=trash" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-gray-500 dark:hover:border-gray-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Trash</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Recently deleted</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>


                {/* Super Admin Only Section */}
                {user?.role === 'superadmin' && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Super Admin</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* User Management */}
                            <Link href="/admin/users" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Users</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage team</p>
                                </div>
                            </Link>

                            {/* Content Lifecycle */}
                            <Link href="/admin/lifecycle" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Lifecycle</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Archival rules</p>
                                </div>
                            </Link>

                            {/* Audit Logs */}
                            <Link href="/admin/audit" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Audit Logs</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Track actions</p>
                                </div>
                            </Link>

                            {/* Subscribers */}
                            <Link href="/admin/subscribers" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Subscribers</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Newsletter</p>
                                </div>
                            </Link>

                            {/* Newsletter */}
                            <Link href="/admin/newsletter" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Newsletter</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage & send email blasts</p>
                                </div>
                            </Link>

                            {/* Policies */}
                            <Link href="/admin/settings/policies" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Policies</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Legal pages</p>
                                </div>
                            </Link>

                            {/* Site Settings */}
                            <Link href="/admin/settings" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Settings</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Site config</p>
                                </div>
                            </Link>

                            {/* Homepage Manager */}
                            <Link href="/admin/homepage" className="group">
                                <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-200 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg transition-all duration-200">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Homepage</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Curate content</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}
