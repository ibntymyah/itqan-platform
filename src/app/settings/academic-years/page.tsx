import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAcademicYear, createTerm } from '@/lib/actions/academic-structure';

export default async function AcademicYearsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const years = await db.academicYear.findMany({
    where: { orgId: session.orgId },
    include: { terms: { orderBy: { startDate: 'asc' } } },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">السنوات الدراسية</h1>

      <form
        action={createAcademicYear}
        className="mb-8 flex flex-wrap items-start gap-3 rounded-xl border border-black/10 bg-white p-4"
      >
        <input
          name="name"
          placeholder="مثال: ١٤٤٧-١٤٤٨هـ"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          name="startDate"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          name="endDate"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          إضافة سنة دراسية
        </button>
      </form>

      <div className="space-y-4">
        {years.map((year) => (
          <div key={year.id} className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">{year.name}</h2>
              {year.isCurrent && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  السنة الحالية
                </span>
              )}
            </div>

            <ul className="mb-3 divide-y divide-black/5 text-sm">
              {year.terms.map((term) => (
                <li key={term.id} className="py-2 text-gray-700">
                  {term.name}
                </li>
              ))}
              {year.terms.length === 0 && (
                <li className="py-2 text-gray-500">لا توجد فصول دراسية بعد.</li>
              )}
            </ul>

            <form action={createTerm} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="academicYearId" value={year.id} />
              <input
                name="name"
                placeholder="اسم الفصل"
                required
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
              />
              <input
                type="date"
                name="startDate"
                required
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
              />
              <input
                type="date"
                name="endDate"
                required
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                إضافة فصل
              </button>
            </form>
          </div>
        ))}
        {years.length === 0 && (
          <p className="rounded-xl border border-black/10 bg-white px-4 py-6 text-center text-sm text-gray-500">
            لا توجد سنوات دراسية بعد.
          </p>
        )}
      </div>
    </div>
  );
}
