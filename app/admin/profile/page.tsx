'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Initial load from localStorage for immediate display
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUser(parsed);
                setProfileForm({ name: parsed.name, email: parsed.email });
            } catch {
                // Invalid data
            }
        }

        // Fetch fresh data from API
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) return;

                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        const freshUser = {
                            name: data.data.name,
                            email: data.data.email,
                            role: data.data.role,
                            _id: data.data._id
                        };

                        // Update state and localStorage with fresh data
                        setUser(freshUser);
                        setProfileForm({ name: freshUser.name, email: freshUser.email });
                        localStorage.setItem('adminUser', JSON.stringify(freshUser));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const getToken = () => localStorage.getItem('adminToken');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(profileForm),
            });
            const data = await res.json();

            if (data.success) {
                // Update localStorage
                localStorage.setItem('adminUser', JSON.stringify(data.data));
                setUser(data.data);
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setMessage({ type: 'success', text: 'Password updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update password' });
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'writer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    if (!user) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Back Button */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings</p>
                </div>
                <Link href="/admin/dashboard">
                    <span className="inline-block">
                        <Button variant="secondary">
                            ← Back to Dashboard
                        </Button>
                    </span>
                </Link>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* User Info Card */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{user.name}</h2>
                        <p className="text-gray-500 dark:text-[var(--text-secondary)]">{user.email}</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize mt-2 ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Update Profile Form */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-4">Update Profile</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Name</label>
                        <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Email</label>
                        <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-[#1a1a1a] p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-4">Change Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.current ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword.current ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword.new ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-neutral-200 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword.confirm ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Updating...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
