import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // 1. Belum login: Cegah akses dashboard DAN root (/), lempar ke login
  if (!token && (path.startsWith('/dashboard') || path === '/')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Jika ada token, decode dan arahkan sesuai role
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      const role = decodedPayload.role; 

      if (path === '/' || path === '/auth/login') {
        const targetUrl = role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/nasabah';
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }

      if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/nasabah', request.url));
      }
      if (path.startsWith('/dashboard/nasabah') && role !== 'NASABAH') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/', '/auth/login', '/dashboard/:path*'] };