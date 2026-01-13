import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    // Protect all /admin routes except /admin/login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        // Check for admin token in cookies
        const adminToken = request.cookies.get('adminToken')?.value;

        if (!adminToken) {
            // Redirect to admin login if no token found
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Token exists, allow access
        // Note: Token validation happens on API calls to backend
    }

    return response;
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
