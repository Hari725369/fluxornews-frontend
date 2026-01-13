'use client';

import { useState, useEffect } from 'react';
import { useUserRole } from '@/components/admin/RoleGate';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface AuditLog {
    _id: string;
    action: string;
    targetType: string;
    targetName?: string;
    performedByName: string;
    performedByRole: string;
    details?: Record<string, any>;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import { usersAPI } from '@/lib/api';

// ... other imports

export default function AuditLogsPage() {
    const router = useRouter();
    const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        targetType: '',
        performedBy: '',
    });

    useEffect(() => {
        // Wait for role to be loaded before checking permissions
        if (roleLoading) return;

        if (!isSuperAdmin) {
            router.push('/admin/dashboard');
            return;
        }
        fetchLogs();
        fetchUsers();
    }, [isSuperAdmin, roleLoading, router, page, filters]);

    const fetchUsers = async () => {
        try {
            const res = await usersAPI.getAll();
            if (res.success && res.data) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const getToken = () => localStorage.getItem('adminToken');

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '30',
            });
            if (filters.action) params.append('action', filters.action);
            if (filters.targetType) params.append('targetType', filters.targetType);
            if (filters.performedBy) params.append('performedBy', filters.performedBy);

            const res = await fetch(`${API_URL}/audit?${params}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
                setTotalPages(data.pages);
            }
        } catch {
            console.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            create: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
            update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            soft_delete: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            restore: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
            publish: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            unpublish: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
            approve: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            reject: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
            submit_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            login: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        };
        return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Audit Logs</h1>
                    <p className="text-gray-600 dark:text-[var(--text-secondary)] mt-1">Track all admin actions</p>
                </div>
                <Link href="/admin/dashboard">
                    <span className="inline-block">
                        <Button variant="secondary">
                            ← Back to Dashboard
                        </Button>
                    </span>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    value={filters.action}
                    onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
                    className="px-4 py-2 border border-gray-300 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)]"
                >
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="publish">Publish</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="soft_delete">Soft Delete</option>
                    <option value="restore">Restore</option>
                </select>
                <select
                    value={filters.targetType}
                    onChange={(e) => { setFilters({ ...filters, targetType: e.target.value }); setPage(1); }}
                    className="px-4 py-2 border border-gray-300 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)]"
                >
                    <option value="">All Types</option>
                    <option value="article">Article</option>
                    <option value="user">User</option>
                    <option value="category">Category</option>
                    <option value="tag">Tag</option>
                </select>
                <select
                    value={filters.performedBy}
                    onChange={(e) => { setFilters({ ...filters, performedBy: e.target.value }); setPage(1); }}
                    className="px-4 py-2 border border-gray-300 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)]"
                >
                    <option value="">All Users</option>
                    {users.map((user: any) => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-[#1a1a1a] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#1a1a1a]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase">Action</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase">Target</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase">User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#1a1a1a]">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-[var(--text-primary)]">{log.targetName || '-'}</div>
                                            <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)] capitalize">{log.targetType}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-[var(--text-primary)]">{log.performedByName}</div>
                                            <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)] capitalize">{log.performedByRole}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 dark:border-[#1a1a1a] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-600 dark:text-[var(--text-secondary)]">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 dark:border-[#1a1a1a] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
