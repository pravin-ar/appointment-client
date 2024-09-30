import { NextResponse } from 'next/server';

export function middleware(req) {
    const adminSession = req.cookies.get('adminSession'); // Read the cookie from the request

    // If there is no admin session cookie, redirect to login
    if (!adminSession) {
        return NextResponse.redirect(new URL('/user/login', req.url));
    }

    // Allow the request if authenticated
    return NextResponse.next();
}

// Apply the middleware to all routes under /admin
export const config = {
    matcher: ['/admin/:path*'], // Protect all routes under /admin
};
