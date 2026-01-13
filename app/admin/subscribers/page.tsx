'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserRole } from '@/components/admin/RoleGate';
import Button from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Reader {
    _id: string;
    email: string;
    name: string;
    isSubscriber: boolean;
    isRegistered: boolean;
    authProvider: 'otp' | 'google';
    status: string;
    createdAt: string;
    subscribedAt: string;
    lastLogin: string;
}

interface Stats {
    total: number;
    subscribers: number;
    registered: number;
    active: number;
    suspended: number;
    newThisWeek: number;
}

export default function SubscribersPage() {
    const router = useRouter();
    const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
    const [readers, setReaders] = useState<Reader[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'subscribers' | 'registered'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (roleLoading) return;

        if (!isSuperAdmin) {
            router.push('/admin/dashboard');
            return;
        }

        fetchStats();
        fetchReaders();
    }, [isSuperAdmin, roleLoading, router, filter, search, page]);

    const getToken = () => localStorage.getItem('adminToken');

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/subscribers/stats`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch {
            console.error('Failed to load stats');
        }
    };

    const fetchReaders = async () => {
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('type', filter);
            if (search) params.append('search', search);
            params.append('page', page.toString());
            params.append('limit', '20');

            const res = await fetch(`${API_URL}/subscribers?${params.toString()}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setReaders(data.data);
                setTotalPages(data.pages);
            }
        } catch {
            setError('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (id: string) => {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        try {
            await fetch(`${API_URL}/subscribers/${id}/suspend`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchReaders();
            fetchStats();
        } catch {
            setError('Failed to suspend user');
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await fetch(`${API_URL}/subscribers/${id}/activate`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchReaders();
            fetchStats();
        } catch {
            setError('Failed to activate user');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) return;
        try {
            await fetch(`${API_URL}/subscribers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchReaders();
            fetchStats();
        } catch {
            setError('Failed to delete subscriber');
        }
    };

    const handleExport = () => {
        window.open(`${API_URL}/subscribers/export?token=${getToken()}`, '_blank');
    };

    if (roleLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Subscribers & Readers</h1>
                    <p className="text-gray-600 dark:text-[var(--text-secondary)] mt-1">Manage newsletter subscribers and registered users</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/dashboard">
                        <span className="inline-block">
                            <Button variant="secondary">
                                ← Back to Dashboard
                            </Button>
                        </span>
                    </Link>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Subscribers</p>
                        <p className="text-2xl font-bold text-primary">{stats.subscribers}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Registered</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.registered}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Active</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Suspended</p>
                        <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-[#1a1a1a]">
                        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">New This Week</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.newThisWeek}</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex gap-2">
                    {['all', 'subscribers', 'registered'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f as any); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-300 dark:hover:bg-gray-600/50'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'subscribers' ? 'Subscribers Only' : 'Registered Only'}
                        </button>
                    ))}
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by email or name..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#1a1a1a] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#1a1a1a]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[#1a1a1a]">
                            {readers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-[var(--text-secondary)]">
                                        No subscribers found
                                    </td>
                                </tr>
                            ) : (
                                readers.map((reader) => (
                                    <tr key={reader._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{reader.name || 'No name'}</p>
                                                <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">{reader.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {reader.isSubscriber && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                                        Newsletter
                                                    </span>
                                                )}
                                                {reader.isRegistered && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                                        Registered
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${reader.authProvider === 'google'
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                {reader.authProvider?.toUpperCase() || 'OTP'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${reader.status === 'active'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                }`}>
                                                {reader.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                                            {new Date(reader.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {reader.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleSuspend(reader._id)}
                                                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                                    >
                                                        Suspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(reader._id)}
                                                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(reader._id)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--text-primary)] disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--text-primary)] disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
