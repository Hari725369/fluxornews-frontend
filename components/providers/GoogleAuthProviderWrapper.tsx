'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    if (!clientId) {
        console.warn('Google Client ID is missing in environment variables');
        // Return children without provider to avoid crash, but auth won't work
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
