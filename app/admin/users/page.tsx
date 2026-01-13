'use client';

import { useState, useEffect } from 'react';
import { useUserRole } from '@/components/admin/RoleGate';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TrendChart from '@/components/admin/TrendChart';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'editor' | 'writer';
    status: 'active' | 'suspended';
    createdAt: string;
    lastLogin?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UserManagementPage() {
    const router = useRouter();
    const { isSuperAdmin, canManageUsers, isLoading: roleLoading } = useUserRole();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', newPassword: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'writer' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [selectedUserStats, setSelectedUserStats] = useState<any>(null);
    const [showStatsModal, setShowStatsModal] = useState(false);

    useEffect(() => {
        // Wait for role to be loaded before checking permissions
        if (roleLoading) return;

        if (!canManageUsers) {
            router.push('/admin/dashboard');
            return;
        }
        fetchUsers();
    }, [canManageUsers, roleLoading, router]);

    const getToken = () => localStorage.getItem('adminToken');

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                // Sort: superadmin first, then editor, then writer
                const sortedUsers = (data.data || []).sort((a: User, b: User) => {
                    const roleOrder = { superadmin: 0, editor: 1, writer: 2 };
                    return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
                });
                setUsers(sortedUsers);
            }
        } catch {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'writer' });
                fetchUsers();
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to create user');
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role, newPassword: '' });
        setShowEditModal(true);
    };

    const handleToggleDirectPublish = async (userId: string, enabled: boolean) => {
        try {
            const res = await fetch(`${API_URL}/users/${userId}/direct-publish`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ enabled }),
            });
            if (res.ok) {
                fetchUsers(); // Refresh the list
            }
        } catch (err) {
            console.error('Failed to toggle direct publish:', err);
        }
    };

    const handleViewStats = async (userId: string) => {
        try {
            const token = getToken();
            if (!token) {
                alert('Please login again to view stats');
                router.push('/admin/login');
                return;
            }

            const res = await fetch(`${API_URL}/users/${userId}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert('Your session has expired. Please login again.');
                router.push('/admin/login');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setSelectedUserStats(data.data);
                setShowStatsModal(true);
            } else {
                alert('Failed to load statistics. Please try again.');
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            alert('An error occurred while loading stats.');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            // Update user details
            const res = await fetch(`${API_URL}/users/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    role: editForm.role,
                }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.message);
                return;
            }

            // If password provided, update password
            if (editForm.newPassword) {
                const pwRes = await fetch(`${API_URL}/users/${editingUser._id}/password`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({ password: editForm.newPassword }),
                });
                const pwData = await pwRes.json();
                if (!pwData.success) {
                    setError(pwData.message);
                    return;
                }
            }

            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch {
            setError('Failed to update user');
        }
    };

    const handleSuspend = async (userId: string) => {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        try {
            await fetch(`${API_URL}/users/${userId}/suspend`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchUsers();
        } catch {
            setError('Failed to suspend user');
        }
    };

    const handleActivate = async (userId: string) => {
        try {
            await fetch(`${API_URL}/users/${userId}/activate`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchUsers();
        } catch {
            setError('Failed to activate user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchUsers();
        } catch {
            setError('Failed to delete user');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'writer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-[var(--text-secondary)]';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        return status === 'active'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    };

    if (!isSuperAdmin) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600 dark:text-[var(--text-secondary)] mt-2">
                    Only Super Admins can access user management.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">User Management</h1>
                    <p className="text-gray-600 dark:text-[var(--text-secondary)] mt-1">Manage writers, editors, and administrators</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard">
                        <span className="inline-block">
                            <Button variant="secondary">
                                ← Back to Dashboard
                            </Button>
                        </span>
                    </Link>
                    <Button onClick={() => setShowCreateModal(true)}>
                        + Add User
                    </Button>
                </div>

                {/* User Stats Modal */}
                {showStatsModal && selectedUserStats && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-neutral-200">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Trend Chart (Last 30 Days) */}
                                <TrendChart data={selectedUserStats.dailyStats} />

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedUserStats.today}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedUserStats.thisWeek}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedUserStats.thisMonth}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedUserStats.total}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">All Time</div>
                                    </div>
                                </div>

                                {/* Views Stats */}
                                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Engagement</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUserStats.totalViews.toLocaleString()}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUserStats.avgViewsPerArticle.toLocaleString()}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg per Article</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Breakdown */}
                                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status Breakdown</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">✅ Published</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedUserStats.statusBreakdown.published}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">📝 Drafts</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedUserStats.statusBreakdown.draft}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">🔍 In Review</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedUserStats.statusBreakdown.review}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-neutral-200 flex justify-end">
                                <button
                                    onClick={() => setShowStatsModal(false)}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-[#1a1a1a] overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#1a1a1a]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Direct Publish</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[#1a1a1a]">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {user.role === 'writer' ? (
                                            <button
                                                onClick={() => handleToggleDirectPublish(user._id, !(user as any).directPublishEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(user as any).directPublishEnabled
                                                    ? 'bg-primary'
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(user as any).directPublishEnabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewStats(user._id)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                📊 Stats
                                            </button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            {/* Only show Suspend/Activate and Delete for non-superadmin users */}
                                            {user.role !== 'superadmin' && (
                                                <>
                                                    {user.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleSuspend(user._id)}
                                                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                                        >
                                                            Suspend
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(user._id)}
                                                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6 border dark:border-[#1a1a1a]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6">Add New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showNewPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="writer">Writer</option>
                                    <option value="editor">Editor</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-[#1a1a1a] text-gray-700 dark:text-[var(--text-secondary)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6 border dark:border-[#1a1a1a]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6">Edit User</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="writer">Writer</option>
                                    <option value="editor">Editor</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password <span className="text-gray-500 dark:text-gray-400 text-xs">(leave blank to keep current)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showEditPassword ? 'text' : 'password'}
                                        value={editForm.newPassword}
                                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        minLength={6}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showEditPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-neutral-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
