import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token dari cookie
  const token = request.cookies.get('token')?.value;

  // Jika belum login (tidak ada token) tapi nekat buka dashboard -> Paksa ke login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika sudah login (ada token) tapi iseng buka halaman login -> Paksa ke dashboard
  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Target file mana saja yang mau diawasi middleware ini
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};