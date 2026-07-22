import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * ملاحظة أمنية (القسم 23 من تعليمات المشروع):
 * هذا سقالة أولية (scaffold) لإثبات المفهوم فقط. قبل الإنتاج يجب:
 *  - نقل AUTH_SECRET إلى سرّ مُدار (secrets manager)، وليس .env عادي.
 *  - إضافة تحديد معدل الطلبات (rate limiting) على تسجيل الدخول.
 *  - إضافة قفل الحساب بعد محاولات فاشلة متكررة.
 *  - دعم انتهاء صلاحية الجلسة وتدويرها (session rotation).
 *  - تسجيل محاولات الدخول الفاشلة في audit_logs.
 */

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET غير معرَّف في متغيرات البيئة');
}
const secretKey = new TextEncoder().encode(AUTH_SECRET);

const SESSION_COOKIE = 'itqan_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 ساعات عمل

export interface SessionClaims {
  userId: string;
  orgId: string;
  roles: string[]; // أسماء الأدوار المرتبطة بالمستخدم
  [key: string]: unknown;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(claims: SessionClaims): Promise<void> {
  const token = await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function getSession(): Promise<SessionClaims | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}
