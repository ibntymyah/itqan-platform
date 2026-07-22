import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// فحص وجود كوكي الجلسة فقط هنا (Edge Runtime لا يدعم jose+bcrypt بسهولة).
// التحقق الكامل من صحة التوقيع والصلاحيات يتم داخل كل صفحة/route عبر getSession().
const PROTECTED_PREFIXES = ['/dashboard', '/students', '/circles', '/attendance', '/settings'];

export function middleware(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has('itqan_session');
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/circles/:path*',
    '/attendance/:path*',
    '/settings/:path*'
  ]
};
