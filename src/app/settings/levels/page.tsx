import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createLevel } from '@/lib/actions/academic-structure';

export default async function LevelsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const levels = await db.level.findMany({
    where: { orgId: session.orgId },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">المستويات</h1>

      <form
        action={createLevel}
        className="mb-8 flex flex-wrap items-start gap-3 rounded-xl border border-black/10 bg-white p-4"
      >
        <input
          name="name"
          placeholder="اسم المستوى"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="sortOrder"
          placeholder="الترتيب"
          min={0}
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          إضافة مستوى
        </button>
      </form>

      <ul className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
        {levels.map((l) => (
          <li key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{l.name}</span>
            <span className="text-gray-500">ترتيب {l.sortOrder}</span>
          </li>
        ))}
        {levels.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">لا توجد مستويات بعد.</li>
        )}
      </ul>
    </div>
  );
}
