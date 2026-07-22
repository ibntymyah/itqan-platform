import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(2, 'اسم الفرع يجب أن يكون حرفين على الأقل'),
  address: z.string().optional()
});

export const createAcademicYearSchema = z
  .object({
    name: z.string().min(2, 'اسم السنة الدراسية مطلوب'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['endDate']
  });

export const createTermSchema = z
  .object({
    academicYearId: z.string().uuid('سنة دراسية غير صحيحة'),
    name: z.string().min(2, 'اسم الفصل مطلوب'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['endDate']
  });

export const createStudyPeriodSchema = z.object({
  name: z.string().min(2, 'اسم الفترة مطلوب'),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const createLevelSchema = z.object({
  name: z.string().min(2, 'اسم المستوى مطلوب'),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const createCircleSchema = z.object({
  branchId: z.string().uuid('فرع غير صحيح'),
  termId: z.string().uuid('فصل دراسي غير صحيح'),
  studyPeriodId: z.string().uuid('فترة دراسية غير صحيحة'),
  levelId: z.string().uuid('مستوى غير صحيح'),
  name: z.string().min(2, 'اسم الحلقة مطلوب'),
  capacity: z.coerce.number().int().positive().optional()
});

export const assignTeacherSchema = z.object({
  circleId: z.string().uuid(),
  employeeId: z.string().uuid()
});
