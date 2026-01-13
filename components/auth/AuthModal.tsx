'use client';

import { useState, useEffect, useRef } from 'react';
import { readerAPI } from '@/lib/api';
import { GoogleLogin, GoogleCredentialResponse } from '@react-oauth/google'; // Import GoogleLogin

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'signin' | 'signup' | 'subscribe'; // Kept for prop compatibility, though flow is unified
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Fallback if readerAPI not used everywhere, but helper uses readerAPI

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [subscribe, setSubscribe] = useState(true);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setStep('email');
            setEmail('');
            setOtp(['', '', '', '', '', '']);
            setError('');
            setTimer(30);
            setCanResend(false);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/readers/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();

            if (data.success) {
                setStep('otp');
                setTimer(30);
                setCanResend(false);
                // Focus first OTP input
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/readers/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    otp: otpValue,
                    subscribe
                }),
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('readerToken', data.data.token);
                localStorage.setItem('readerUser', JSON.stringify(data.data.user));
                window.dispatchEvent(new Event('readerAuthChange'));
                onClose();
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit if filled
        if (index === 5 && value) {
            // Wait for state update then verify
            // (Using the local variable directly for safety)
            // handleVerifyOTP() called manually or by effect if needed, usually button click is safer UX
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleGoogleSuccess = async (response: GoogleCredentialResponse) => {
        console.log('[GoogleAuth] handleGoogleSuccess called', { hasCredential: !!response.credential });
        if (!response.credential) {
            setError('Google Sign-In failed');
            return;
        }
        setLoading(true);
        setError('');
        try {
            console.log('[GoogleAuth] Calling readerAPI.googleLogin');
            const res = await readerAPI.googleLogin(response.credential);
            console.log('[GoogleAuth] API response:', { success: res.success, hasData: !!res.data });
            if (res.success) {
                localStorage.setItem('readerToken', res.data.token);
                localStorage.setItem('readerUser', JSON.stringify(res.data.user));
                console.log('[GoogleAuth] Tokens saved, dispatching auth change event');
                window.dispatchEvent(new Event('readerAuthChange'));
                console.log('[GoogleAuth] Calling onClose()');
                onClose();
                console.log('[GoogleAuth] onClose() called successfully');
            } else {
                console.error('[GoogleAuth] Login failed:', res.message);
                setError(res.message || 'Google Login failed');
            }
        } catch (err: any) {
            console.error('[GoogleAuth] Exception during login:', err);
            setError(err.message || 'Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0F0F0F] w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">

                {/* Auth Flow */}
                <div className="p-8 md:p-12 flex flex-col justify-center relative">
                    {/* Close Button - Moved inside content padding */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <span className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Fluxor.</span>
                    </div>

                    {step === 'email' ? (
                        <>
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6 font-serif">
                                Sign in or create an account
                            </h2>

                            {/* Google Sign In Button */}
                            <div className="flex justify-center mb-6 w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Sign-In failed')}
                                    useOneTap
                                    theme="outline"
                                    width="320"
                                />
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-500"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#E94044] hover:bg-[#d63a3e] text-white font-bold rounded shadow-sm transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                                >
                                    {loading ? 'Sending OTP...' : 'Continue'}
                                </button>

                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={subscribe}
                                        onChange={(e) => setSubscribe(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                                        Subscribe to Newsletter and latest updates
                                    </span>
                                </label>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2 font-serif">
                                Verify Email Address
                            </h2>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                                OTP sent to <span className="font-semibold text-gray-900 dark:text-gray-300">{email}</span>
                                <br />
                                <button onClick={() => setStep('email')} className="text-primary hover:underline font-medium mt-1">
                                    Change email address
                                </button>
                            </p>

                            <div className="space-y-8">
                                <div className="flex justify-between gap-2 max-w-[300px] mx-auto">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => { otpRefs.current[index] = el }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-10 h-12 text-center text-xl font-bold border border-gray-300 dark:border-neutral-200 rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={loading}
                                    className="w-full py-3 bg-[#E94044] hover:bg-[#d63a3e] text-white font-bold rounded shadow-sm transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>

                                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    {canResend ? (
                                        <button
                                            onClick={() => handleSendOTP()}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Resend OTP
                                        </button>
                                    ) : (
                                        <span>Resend OTP {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded text-center">
                            {error}
                        </div>
                    )}

                    <div className="mt-auto pt-8 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            After completing login, you agree to our <a href="#" className="underline font-medium text-gray-700 dark:text-gray-400">Terms</a> & <a href="#" className="underline font-medium text-gray-700 dark:text-gray-400">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
