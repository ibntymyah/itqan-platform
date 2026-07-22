import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/permissions';

const links = [
  { href: '/settings/branches', label: 'الفروع' },
  { href: '/settings/academic-years', label: 'السنوات والفصول الدراسية' },
  { href: '/settings/study-periods', label: 'الفترات الدراسية' },
  { href: '/settings/levels', label: 'المستويات' },
  { href: '/settings/circles', label: 'الحلقات' }
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!can(session.roles, 'academic_structure.manage') && !can(session.roles, 'academic_structure.view')) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-6 px-4 py-8">
      <nav className="w-52 shrink-0 space-y-1 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
