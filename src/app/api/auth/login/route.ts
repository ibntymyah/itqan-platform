import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

const loginSchema = z.object({
  identifier: z.string().min(3), // بريد إلكتروني أو رقم جوال
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 400 });
  }

  const { identifier, password } = parsed.data;

  const user = await db.user.findFirst({
    where: {
      isActive: true,
      OR: [{ email: identifier }, { phone: identifier }]
    },
    include: {
      roles: { include: { role: true } }
    }
  });

  // رسالة موحّدة سواء كان المستخدم غير موجود أو كلمة المرور خاطئة — تمنع تعداد الحسابات
  const genericError = NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });

  if (!user) return genericError;

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) return genericError;

  await createSession({
    userId: user.id,
    orgId: user.orgId,
    roles: user.roles.map((r) => r.role.name)
  });

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // TODO Phase 1: تسجيل حدث الدخول في audit_logs (القسم 23 و12 — إحصاءات دخول النظام)

  return NextResponse.json({ ok: true });
}
