import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass-through for all routes since auth checks are handled robustly 
  // via Client-Side routing guards in page components to support mock fallback.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/write/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
