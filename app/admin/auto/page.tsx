'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLogin() {
    const router = useRouter();

    useEffect(() => {
        // Auto-login in development mode
        const autoLogin = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/dev-login', {
                    method: 'POST',
                });
                const data = await response.json();

                if (data.success && data.data?.token) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('adminToken', data.data.token);
                    if (data.data.user) {
                        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
                    }
                    // Redirect to dashboard
                    router.push('/admin/dashboard');
                } else {
                    console.error('Auto-login failed');
                }
            } catch (error) {
                console.error('Auto-login error:', error);
            }
        };

        autoLogin();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0F0F0F]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Logging you in...</p>
            </div>
        </div>
    );
}
