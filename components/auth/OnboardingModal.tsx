'use client';

import { useState, useEffect } from 'react';
import { readerAPI } from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'email' | 'otp' | 'name' | 'interests' | 'welcome';

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

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setStep('email');
            setEmail('');
            setOtp('');
            setName('');
            setSelectedInterests([]);
            setError('');
        }
    }, [isOpen]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await readerAPI.sendOTP(email);
            if (res.success) {
                if ((res.data as any)?.devOtp) {
                    alert(`[DEV MODE] Your OTP Code is: ${(res.data as any).devOtp}`);
                }
                setStep('otp');
            } else {
                setError(res.message || 'Failed to send verification code. Please try again.');
            }
        } catch (err: any) {
            console.error('OTP Error:', err);
            setError(err.message || 'Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Check if user exists fully or needs onboarding
            const res = await readerAPI.verifyOTP(email, otp);

            if (res.success) {
                if (res.data.requiresOnboarding) {
                    // New user - needs to provide name and interests
                    setStep('name');
                } else {
                    // Existing user logged in successfully
                    localStorage.setItem('readerToken', res.data.token);
                    localStorage.setItem('readerUser', JSON.stringify(res.data.user));
                    window.dispatchEvent(new Event('readerAuthChange'));

                    // Check if returning user needs to set interests
                    if (res.data.user.needsInterests) {
                        // User exists but hasn't set interests yet
                        setStep('interests');
                    } else {
                        // User has everything, go straight to welcome
                        setStep('welcome');
                        setTimeout(() => onClose(), 2000);
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setStep('interests');
    };

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // If we have an OTP, we are in the Email Flow
            if (otp) {
                const res = await readerAPI.verifyOTP(email, otp, name, selectedInterests);
                if (res.success) {
                    localStorage.setItem('readerToken', res.data.token);
                    localStorage.setItem('readerUser', JSON.stringify(res.data.user));
                    window.dispatchEvent(new Event('readerAuthChange'));
                    setStep('welcome');
                    setTimeout(() => onClose(), 3000);
                }
            } else {
                // Otherwise, we are in the Google Flow (User is already authenticated)
                const res = await readerAPI.updateProfile({
                    name: name || undefined,
                    interests: selectedInterests
                });

                if (res.success) {
                    // Update local storage with new user data
                    const currentUser = localStorage.getItem('readerUser');
                    if (currentUser) {
                        const parsed = JSON.parse(currentUser);
                        const updated = { ...parsed, ...res.data };
                        localStorage.setItem('readerUser', JSON.stringify(updated));
                        window.dispatchEvent(new Event('readerAuthChange'));
                    }

                    setStep('welcome');
                    setTimeout(() => onClose(), 2000);
                }
            }
        } catch (err: any) {
            console.error('Finalize fail:', err);
            setError(err.message || 'Failed to save details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await readerAPI.googleLogin(response.credential);
            if (res.success) {
                localStorage.setItem('readerToken', res.data.token);
                localStorage.setItem('readerUser', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event('readerAuthChange'));

                // Set name if present from Google
                if (res.data.user.name) setName(res.data.user.name);

                if (!res.data.user.interests || res.data.user.interests.length === 0) {
                    setStep('interests');
                } else {
                    setStep('welcome');
                    setTimeout(() => onClose(), 2000);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">

                {/* Close Button */}
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all z-20 shadow-sm"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Back Button (if not on first step) */}
                {step !== 'email' && step !== 'welcome' && (
                    <button
                        onClick={() => setStep('email')}
                        className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-20"
                        aria-label="Back"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}

                {/* STEPS */}

                {step === 'email' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2">Sign in or Join</h2>
                        <p className="text-gray-500 text-sm mb-6">Enter your email to continue.</p>
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-lg transition-transform active:scale-95">
                                {loading ? 'Sending...' : 'Continue'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-800"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#1A1A1A] px-2 text-gray-400">Or continue with</span></div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Sign-In failed')}
                                useOneTap
                                theme="filled_blue"
                                shape="pill"
                                width="384px"
                            />
                        </div>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2">Verify Email</h2>
                        <p className="text-gray-500 text-sm mb-6">Enter the code sent to {email}</p>
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-primary outline-none transition-all text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-lg transition-transform active:scale-95">
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                            <button type="button" onClick={() => setStep('email')} className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                                Change Email
                            </button>
                        </form>
                    </div>
                )}

                {step === 'name' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
                        <p className="text-gray-500 text-sm mb-6">What verifies should we call you?</p>
                        <form onSubmit={handleNameSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-lg transition-transform active:scale-95">
                                Continue
                            </button>
                        </form>
                    </div>
                )}

                {step === 'interests' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2">Your Interests</h2>
                        <p className="text-gray-500 text-sm mb-6">Personalize your feed.</p>
                        <div className="flex flex-wrap gap-2 mb-8 max-h-[300px] overflow-y-auto">
                            {INTERESTS.map(interest => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedInterests.includes(interest)
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button
                            onClick={handleFinalize}
                            disabled={loading || selectedInterests.length === 0}
                            className={`w-full py-3 font-bold rounded-lg transition-transform active:scale-95 ${selectedInterests.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-600 text-white'
                                }`}
                        >
                            {loading ? 'Finalizing...' : 'Start Reading'}
                        </button>
                    </div>
                )}

                {step === 'welcome' && (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
                            👋
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Welcome, {name || 'Reader'}!</h2>
                        <p className="text-gray-500 mb-8">Your account is ready. Enjoy your personalized news feed.</p>
                        <button onClick={onClose} className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:opacity-90 transition-opacity">
                            Go to Homepage
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
