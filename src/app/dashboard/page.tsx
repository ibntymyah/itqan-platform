import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

async function getIndicators(orgId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalStudents, activeStudents, totalEmployees, activeCircles, todaysAttendance] =
    await Promise.all([
      db.student.count({ where: { orgId, deletedAt: null } }),
      db.student.count({ where: { orgId, deletedAt: null, status: 'active' } }),
      db.employee.count({ where: { orgId, deletedAt: null } }),
      db.circle.count({ where: { branch: { orgId }, isActive: true } }),
      db.attendanceRecord.findMany({
        where: { circle: { branch: { orgId } }, studyDate: today },
        select: { status: true }
      })
    ]);

  const presentToday = todaysAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRateToday =
    todaysAttendance.length > 0 ? Math.round((presentToday / todaysAttendance.length) * 100) : null;

  return {
    totalStudents,
    activeStudents,
    totalEmployees,
    activeCircles,
    attendanceRateToday
    // TODO Phase 1: غياب متتالٍ، من لم يُسمَّع اليوم، حلقات غير مكتملة —
    // تُبنى مع محرّك تقارير الحضور والتسميع (القسم 12، ووحدة Circle Operations)
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const indicators = await getIndicators(session.orgId);

  const cards = [
    { label: 'إجمالي الطلاب', value: indicators.totalStudents },
    { label: 'الطلاب النشطون', value: indicators.activeStudents },
    { label: 'إجمالي الموظفين', value: indicators.totalEmployees },
    { label: 'الحلقات النشطة', value: indicators.activeCircles },
    {
      label: 'نسبة الحضور اليوم',
      value: indicators.attendanceRateToday !== null ? `${indicators.attendanceRateToday}٪` : '—'
    }
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-lg font-medium">لوحة المؤشرات</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-black/10 bg-white p-4">
            <p className="mb-2 text-xs text-gray-500">{card.label}</p>
            <p className="text-2xl font-medium">{card.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
