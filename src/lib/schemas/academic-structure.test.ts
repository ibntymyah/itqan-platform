import { describe, expect, it } from 'vitest';
import {
  createBranchSchema,
  createAcademicYearSchema,
  createTermSchema,
  createCircleSchema
} from './academic-structure';

describe('createBranchSchema', () => {
  it('يقبل اسماً صحيحاً بدون عنوان', () => {
    const result = createBranchSchema.safeParse({ name: 'الفرع الرئيسي' });
    expect(result.success).toBe(true);
  });

  it('يرفض اسماً أقصر من حرفين', () => {
    const result = createBranchSchema.safeParse({ name: 'ا' });
    expect(result.success).toBe(false);
  });
});

describe('createAcademicYearSchema', () => {
  it('يرفض تاريخ نهاية قبل تاريخ البداية', () => {
    const result = createAcademicYearSchema.safeParse({
      name: '١٤٤٧هـ',
      startDate: '2026-09-01',
      endDate: '2026-08-01'
    });
    expect(result.success).toBe(false);
  });

  it('يقبل مدى تواريخ صحيحاً', () => {
    const result = createAcademicYearSchema.safeParse({
      name: '١٤٤٧هـ',
      startDate: '2026-09-01',
      endDate: '2027-06-01'
    });
    expect(result.success).toBe(true);
  });
});

describe('createTermSchema', () => {
  it('يرفض معرّف سنة دراسية غير صحيح الشكل', () => {
    const result = createTermSchema.safeParse({
      academicYearId: 'not-a-uuid',
      name: 'الفصل الأول',
      startDate: '2026-09-01',
      endDate: '2026-12-01'
    });
    expect(result.success).toBe(false);
  });
});

describe('createCircleSchema', () => {
  const validUuid = '11111111-1111-1111-1111-111111111111';

  it('يرفض سعة سالبة أو صفرية', () => {
    const result = createCircleSchema.safeParse({
      branchId: validUuid,
      termId: validUuid,
      studyPeriodId: validUuid,
      levelId: validUuid,
      name: 'حلقة الأشبال',
      capacity: 0
    });
    expect(result.success).toBe(false);
  });

  it('يقبل مدخلاً كاملاً وصحيحاً بدون سعة', () => {
    const result = createCircleSchema.safeParse({
      branchId: validUuid,
      termId: validUuid,
      studyPeriodId: validUuid,
      levelId: validUuid,
      name: 'حلقة الأشبال'
    });
    expect(result.success).toBe(true);
  });
});
