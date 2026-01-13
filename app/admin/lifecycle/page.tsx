'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';

// API helper for lifecycle
const lifecycleAPI = {
    getStats: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lifecycle/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.json();
    },
    getCandidates: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lifecycle/candidates`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.json();
    },
    archive: async (ids: string[]) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lifecycle/archive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ articleIds: ids })
        });
        return res.json();
    }
};

export default function LifecyclePage() {
    const router = useRouter();
    const [stats, setStats] = useState({ active: 0, archived: 0, trash: 0 });
    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, candidatesRes] = await Promise.all([
                lifecycleAPI.getStats(),
                lifecycleAPI.getCandidates()
            ]);

            if ((statsRes as any).success) setStats((statsRes as any).data);
            if ((candidatesRes as any).success) setCandidates((candidatesRes as any).data);
        } catch (error) {
            console.error('Failed to fetch lifecycle data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleArchive = async () => {
        if (!confirm(`Archive ${selectedIds.length} articles?`)) return;

        try {
            const res = await lifecycleAPI.archive(selectedIds);
            if (res.success) {
                alert('Articles archived successfully');
                setSelectedIds([]);
                fetchData();
            }
        } catch (error) {
            alert('Failed to archive');
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === candidates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(candidates.map(c => c._id));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading lifecycle data...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Lifecycle</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage archival and automated expiration rules</p>
                    </div>
                    <Button onClick={() => router.push('/admin/dashboard')} variant="secondary">
                        Back to Dashboard
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Content</h3>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Archived</h3>
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.archived}</div>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-gray-200 dark:border-neutral-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Trash</h3>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.trash}</div>
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-neutral-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-neutral-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Candidates for Archival</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Articles older than 90 days with low activity</p>
                        </div>
                        {selectedIds.length > 0 && (
                            <Button onClick={handleArchive} variant="primary" className="bg-amber-600 hover:bg-amber-700">
                                Archive Selected ({selectedIds.length})
                            </Button>
                        )}
                    </div>

                    {candidates.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 italic">No candidates found for archival.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-neutral-200">
                                        <th className="p-4 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === candidates.length && candidates.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 dark:border-neutral-500 bg-white dark:bg-[#1A1A1A] text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((article) => (
                                        <tr key={article._id} className="border-b border-gray-100 dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(article._id)}
                                                    onChange={() => handleSelect(article._id)}
                                                    className="rounded border-gray-300 dark:border-neutral-500 bg-white dark:bg-[#1A1A1A] text-primary focus:ring-primary"
                                                />
                                            </td>
                                            <td className="p-4 font-medium text-gray-900 dark:text-gray-200">{article.title}</td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{article.author?.name || 'Unknown'}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                                {new Date(article.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">{article.views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
