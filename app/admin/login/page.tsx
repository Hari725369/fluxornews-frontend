'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authAPI } from '@/lib/api';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });

            if (response.success) {
                router.push('/admin/dashboard');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0F0F0F] transition-colors duration-200">
            <div className="max-w-md w-full bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg p-8 border border-gray-200 dark:border-[#1a1a1a]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Fluxor News</h1>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Login</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your details"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-primary hover:underline text-sm">
                        ← Back to Home
                    </a>
                </div>


            </div>
        </div>
    );
}
