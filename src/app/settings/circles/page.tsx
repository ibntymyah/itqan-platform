import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createCircle, assignTeacherToCircle } from '@/lib/actions/academic-structure';

export default async function CirclesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [branches, terms, periods, levels, circles, teachers] = await Promise.all([
    db.branch.findMany({ where: { orgId: session.orgId, isActive: true }, orderBy: { name: 'asc' } }),
    db.term.findMany({
      where: { academicYear: { orgId: session.orgId } },
      include: { academicYear: true },
      orderBy: { startDate: 'desc' }
    }),
    db.studyPeriod.findMany({ where: { orgId: session.orgId }, orderBy: { sortOrder: 'asc' } }),
    db.level.findMany({ where: { orgId: session.orgId }, orderBy: { sortOrder: 'asc' } }),
    db.circle.findMany({
      where: { branch: { orgId: session.orgId } },
      include: {
        branch: true,
        studyPeriod: true,
        level: true,
        teacherAssignments: { where: { endedAt: null }, include: { employee: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.employee.findMany({
      where: { orgId: session.orgId, jobTitle: 'teacher', deletedAt: null },
      orderBy: { fullName: 'asc' }
    })
  ]);

  const canCreate = branches.length > 0 && terms.length > 0 && periods.length > 0 && levels.length > 0;

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">الحلقات</h1>

      {!canCreate && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          أضف فرعاً واحداً على الأقل، وفصلاً دراسياً، وفترة دراسية، ومستوى، قبل إنشاء حلقة.
        </p>
      )}

      {canCreate && (
        <form
          action={createCircle}
          className="mb-8 grid grid-cols-2 gap-3 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-3"
        >
          <input
            name="name"
            placeholder="اسم الحلقة"
            required
            className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-1"
          />
          <select name="branchId" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">الفرع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select name="termId" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">الفصل الدراسي</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.academicYear.name} — {t.name}
              </option>
            ))}
          </select>
          <select name="studyPeriodId" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">الفترة الدراسية</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select name="levelId" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">المستوى</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="capacity"
            placeholder="السعة (اختياري)"
            min={1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 sm:col-span-3"
          >
            إضافة حلقة
          </button>
        </form>
      )}

      <div className="space-y-3">
        {circles.map((circle) => (
          <div key={circle.id} className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-sm font-medium">{circle.name}</span>
                <span className="ms-2 text-xs text-gray-500">
                  {circle.branch.name} · {circle.studyPeriod.name} · {circle.level.name}
                </span>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap gap-2">
              {circle.teacherAssignments.map((a) => (
                <span
                  key={a.id}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                >
                  {a.employee.fullName}
                </span>
              ))}
              {circle.teacherAssignments.length === 0 && (
                <span className="text-xs text-amber-700">لا يوجد معلم معيَّن بعد</span>
              )}
            </div>

            {teachers.length > 0 && (
              <form action={assignTeacherToCircle} className="flex items-center gap-2">
                <input type="hidden" name="circleId" value={circle.id} />
                <select
                  name="employeeId"
                  required
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                >
                  <option value="">تعيين معلم…</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  تعيين
                </button>
              </form>
            )}
          </div>
        ))}
        {circles.length === 0 && (
          <p className="rounded-xl border border-black/10 bg-white px-4 py-6 text-center text-sm text-gray-500">
            لا توجد حلقات بعد.
          </p>
        )}
      </div>
    </div>
  );
}
