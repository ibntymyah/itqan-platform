import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'إتقان — إدارة مدارس وحلقات القرآن',
  description: 'منصة إتقان لإدارة مدارس وحلقات تحفيظ القرآن الكريم'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[var(--surface-0,_#f7f6f2)] text-right font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
