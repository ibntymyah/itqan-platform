import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * اختبار عزل المؤسسات (multi-tenant isolation) — القسم 29 من تعليمات المشروع.
 *
 * لا يعمل هذا الاختبار داخل بيئة المراجعة الحالية لأن الشبكة هناك لا تصل إلى
 * مستودع محركات Prisma الثنائية (binaries.prisma.sh)، وبالتالي لا يمكن الاتصال
 * بقاعدة بيانات فعلية. شغّله محلياً بعد إعداد DATABASE_URL حقيقي عبر:
 *
 *   npm run test:integration
 *
 * نُموّه next/headers و next/cache فقط (طبقة Next.js التي تحتاج سياق طلب HTTP
 * حقيقياً) — منطق الأعمال وفحوصات ملكية المؤسسة تعمل ضد قاعدة بيانات حقيقية.
 */

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, getSession: vi.fn() };
});

const RUN = process.env.RUN_DB_TESTS === '1';

describe.skipIf(!RUN)('عزل المؤسسات على مستوى الاستعلام والـ server actions', () => {
  let db: typeof import('@/lib/db').db;
  let getSession: import('vitest').Mock;
  let createCircle: typeof import('@/lib/actions/academic-structure').createCircle;
  let createTerm: typeof import('@/lib/actions/academic-structure').createTerm;

  let orgA: { id: string };
  let orgB: { id: string };
  let branchA: { id: string };
  let termA: { id: string };
  let periodA: { id: string };
  let levelA: { id: string };
  let userB: { id: string };

  beforeAll(async () => {
    ({ db } = await import('@/lib/db'));
    ({ getSession } = (await import('@/lib/auth')) as unknown as { getSession: import('vitest').Mock });
    ({ createCircle, createTerm } = await import('@/lib/actions/academic-structure'));

    orgA = await db.organization.create({ data: { name: 'مؤسسة اختبار أ' } });
    orgB = await db.organization.create({ data: { name: 'مؤسسة اختبار ب' } });

    branchA = await db.branch.create({ data: { orgId: orgA.id, name: 'فرع أ' } });
    const yearA = await db.academicYear.create({
      data: {
        orgId: orgA.id,
        name: 'سنة اختبار أ',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-01')
      }
    });
    termA = await db.term.create({
      data: {
        academicYearId: yearA.id,
        name: 'فصل أ',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-01')
      }
    });
    periodA = await db.studyPeriod.create({ data: { orgId: orgA.id, name: 'العصر' } });
    levelA = await db.level.create({ data: { orgId: orgA.id, name: 'المستوى الأول' } });

    userB = await db.user.create({
      data: { orgId: orgB.id, email: 'admin@org-b.test', passwordHash: 'not-a-real-hash' }
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
    await db.$disconnect();
  });

  it('يرفض إنشاء حلقة تُشير إلى فرع/فصل/فترة/مستوى تخص مؤسسة أخرى', async () => {
    getSession.mockResolvedValue({ userId: userB.id, orgId: orgB.id, roles: ['org_admin'] });

    const formData = new FormData();
    formData.set('branchId', branchA.id);
    formData.set('termId', termA.id);
    formData.set('studyPeriodId', periodA.id);
    formData.set('levelId', levelA.id);
    formData.set('name', 'حلقة متسللة عبر المؤسسات');

    await expect(createCircle(formData)).rejects.toThrow();

    const leaked = await db.circle.findFirst({ where: { name: 'حلقة متسللة عبر المؤسسات' } });
    expect(leaked).toBeNull();
  });

  it('يرفض ربط فصل دراسي بسنة دراسية تخص مؤسسة أخرى', async () => {
    getSession.mockResolvedValue({ userId: userB.id, orgId: orgB.id, roles: ['org_admin'] });

    const yearAId = (await db.academicYear.findFirstOrThrow({ where: { orgId: orgA.id } })).id;

    const formData = new FormData();
    formData.set('academicYearId', yearAId);
    formData.set('name', 'فصل متسلل');
    formData.set('startDate', '2026-01-01');
    formData.set('endDate', '2026-06-01');

    await expect(createTerm(formData)).rejects.toThrow();
  });

  it('لا تُظهر قوائم المؤسسة ب أي فروع أو حلقات تخص المؤسسة أ', async () => {
    const branchesForB = await db.branch.findMany({ where: { orgId: orgB.id } });
    expect(branchesForB.some((b) => b.id === branchA.id)).toBe(false);

    const circlesForB = await db.circle.findMany({ where: { branch: { orgId: orgB.id } } });
    expect(circlesForB).toHaveLength(0);
  });
});
