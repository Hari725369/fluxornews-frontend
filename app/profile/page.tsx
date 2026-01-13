'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { readerAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import EditProfileModal from '@/components/user/EditProfileModal';

const INTERESTS = [
    "World News",
    "Breaking News",
    "Politics",
    "Business & Economy",
    "Technology",
    "Sports",
    "Entertainment",
    "Health",
    "Stock Market"
];

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = (searchParams.get('tab') as 'saved' | 'interests' | 'notifications') || 'saved';

    const [activeTab, setActiveTab] = useState<'saved' | 'interests' | 'notifications'>(initialTab);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [savedArticles, setSavedArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('readerToken');
        if (!token) {
            router.push('/');
            return;
        }

        fetchData();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, savedRes] = await Promise.all([
                readerAPI.getMe(),
                readerAPI.getSavedArticles()
            ]);

            if (profileRes.success) setUser(profileRes.data);
            if (savedRes.success) setSavedArticles(savedRes.data);
        } catch (err) {
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleInterest = async (interest: string) => {
        if (!user) return;
        const newInterests = user.interests.includes(interest)
            ? user.interests.filter((i: string) => i !== interest)
            : [...user.interests, interest];

        setUpdating(true);
        try {
            const res = await readerAPI.updateMe({ interests: newInterests });
            if (res.success) {
                setUser(res.data);
                localStorage.setItem('readerUser', JSON.stringify(res.data));
            }
        } catch {
            setError('Failed to update interests');
        } finally {
            setUpdating(false);
        }
    };

    const handleUnsave = async (articleId: string) => {
        try {
            const res = await readerAPI.unsaveArticle(articleId);
            if (res.success) {
                setSavedArticles(prev => prev.filter(a => a._id !== articleId));
            }
        } catch {
            setError('Failed to remove article');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex flex-col pt-16 md:pt-20">
            <div className="flex-1 container mx-auto px-4 max-w-[1000px] py-6">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl relative group">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-white dark:border-gray-800 shadow-lg">
                        {(user?.name || user?.email || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name || 'Reader'}</h1>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-gray-400 hover:text-primary transition-colors p-1"
                                title="Edit Name"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                                {user?.authProvider === 'google' ? 'Google Account' : 'Email Verified'}
                            </span>
                            <span className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                                {savedArticles.length} Saved Articles
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'notifications'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'saved'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Saved Articles
                    </button>
                    <button
                        onClick={() => setActiveTab('interests')}
                        className={`px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'interests'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        My Interests
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl text-center py-20">
                            <div className="text-5xl mb-4 text-gray-300">🔔</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No new notifications</h3>
                            <p className="text-gray-500 dark:text-gray-400">We'll let you know when something important happens.</p>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="grid gap-6">
                            {savedArticles.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="text-5xl mb-4 text-gray-300">🔖</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved articles yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">Articles you save will appear here for quick access.</p>
                                    <Link href="/" className="px-6 py-2 bg-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity">
                                        Browse News
                                    </Link>
                                </div>
                            ) : (
                                savedArticles.map(article => (
                                    <div key={article._id} className="group flex flex-col sm:flex-row gap-6 p-4 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
                                        <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shadow-inner">
                                            <img
                                                src={getImageUrl(article.image)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {article.category && (
                                                <div
                                                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                                                    style={{ backgroundColor: article.category.color || '#e11e24' }}
                                                >
                                                    {article.category.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <Link href={`/article/${article.slug}`}>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(article.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <Link href={`/article/${article.slug}`} className="text-sm font-bold text-primary hover:underline">
                                                    Read Article
                                                </Link>
                                                <button
                                                    onClick={() => handleUnsave(article._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Remove from saved"
                                                >
                                                    <svg className="w-5 h-5 font-bold" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'interests' && (
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                            <h2 className="text-xl font-bold mb-2">Personalize Your Feed</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Select topics you're interested in to get a more tailored news experience.</p>

                            <div className="flex flex-wrap gap-3">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest}
                                        onClick={() => handleToggleInterest(interest)}
                                        disabled={updating}
                                        className={`px-6 py-3 rounded-full text-sm font-bold border transition-all active:scale-95 ${user.interests.includes(interest)
                                            ? 'bg-primary text-white border-primary shadow-md'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>

                            {updating && <p className="mt-6 text-sm text-primary animate-pulse font-medium">Updating your preferences...</p>}
                        </div>
                    )}
                </div>

                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onUpdate={(updatedUser) => {
                        setUser(updatedUser);
                        localStorage.setItem('readerUser', JSON.stringify(updatedUser)); // Update local storage too
                    }}
                />
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            }>
                <ProfileContent />
            </Suspense>
            <Footer />
        </>
    );
}
