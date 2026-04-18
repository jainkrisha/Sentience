import { NextResponse } from 'next/server';

export function middleware(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Protected routes
    const protectedRoutes = ['/dashboard', '/interview', '/questions', '/upgrade'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    // Auth routes
    const authRoutes = ['/sign-in', '/sign-up', '/auth-signin', '/auth-signup'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // If accessing protected route without token, redirect to sign-in
    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/auth-signin', request.url));
    }

    // If accessing auth pages with token, redirect to dashboard
    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect old auth routes to new ones
    if (pathname === '/sign-in' || pathname === '/sign-in/') {
      return NextResponse.redirect(new URL('/auth-signin', request.url), { status: 301 });
    }
    
    if (pathname === '/sign-up' || pathname === '/sign-up/') {
      return NextResponse.redirect(new URL('/auth-signup', request.url), { status: 301 });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next|api|public|.*\\..*|$).*)',
  ],
};