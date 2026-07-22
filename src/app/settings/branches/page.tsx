import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createBranch } from '@/lib/actions/academic-structure';

export default async function BranchesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const branches = await db.branch.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">الفروع</h1>

      <form
        action={createBranch}
        className="mb-8 flex flex-wrap items-start gap-3 rounded-xl border border-black/10 bg-white p-4"
      >
        <input
          name="name"
          placeholder="اسم الفرع"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="address"
          placeholder="العنوان (اختياري)"
          className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          إضافة فرع
        </button>
      </form>

      <ul className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
        {branches.map((b) => (
          <li key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{b.name}</span>
            <span className="text-gray-500">{b.address ?? '—'}</span>
          </li>
        ))}
        {branches.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">لا توجد فروع بعد.</li>
        )}
      </ul>
    </div>
  );
}
