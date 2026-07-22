import { PrismaClient } from '@prisma/client';

// نمط singleton قياسي — يمنع فتح اتصالات جديدة عند كل Hot Reload في التطوير.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
