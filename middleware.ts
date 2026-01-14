import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // COMPLETELY DISABLE AUTH IN DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.next();
    }

    // For production, keep auth checks
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('adminToken')?.value;

        if (!token && pathname !== '/admin/login') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
