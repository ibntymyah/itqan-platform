'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession, type SessionClaims } from '@/lib/auth';
import { assertCan } from '@/lib/permissions';
import {
  createBranchSchema,
  createAcademicYearSchema,
  createTermSchema,
  createStudyPeriodSchema,
  createLevelSchema,
  createCircleSchema,
  assignTeacherSchema
} from '@/lib/schemas/academic-structure';

class TenantViolationError extends Error {
  constructor(entity: string) {
    // رسالة عامة عمداً — لا نكشف للمستخدم أن السجل موجود في مؤسسة أخرى (القسم 22)
    super(`${entity} غير موجود`);
  }
}

async function requireOrgAdmin(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) throw new Error('غير مصرَّح — الرجاء تسجيل الدخول');
  assertCan(session.roles, 'academic_structure.manage');
  return session;
}

async function writeAuditLog(params: {
  orgId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  after: unknown;
}) {
  await db.auditLog.create({
    data: {
      orgId: params.orgId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      afterJson: params.after as never
    }
  });
}

// ---------------------------------------------------------------------------
// الفروع
// ---------------------------------------------------------------------------

export async function createBranch(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = createBranchSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') || undefined
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  const branch = await db.branch.create({
    data: { orgId: session.orgId, ...parsed.data }
  });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'branch.create',
    entityType: 'Branch',
    entityId: branch.id,
    after: branch
  });

  revalidatePath('/settings/branches');
  return branch;
}

// ---------------------------------------------------------------------------
// السنوات الدراسية والفصول
// ---------------------------------------------------------------------------

export async function createAcademicYear(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = createAcademicYearSchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate')
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  const year = await db.academicYear.create({
    data: { orgId: session.orgId, ...parsed.data }
  });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'academic_year.create',
    entityType: 'AcademicYear',
    entityId: year.id,
    after: year
  });

  revalidatePath('/settings/academic-years');
  return year;
}

export async function createTerm(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = createTermSchema.safeParse({
    academicYearId: formData.get('academicYearId'),
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate')
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  // فحص ملكية المؤسسة قبل الكتابة — لا يكفي أن السنة الدراسية موجودة، يجب أن
  // تخصّ نفس مؤسسة المستخدم الحالي (القسم 22: عزل متعدد المؤسسات إلزامي في كل طبقة)
  const year = await db.academicYear.findFirst({
    where: { id: parsed.data.academicYearId, orgId: session.orgId }
  });
  if (!year) throw new TenantViolationError('السنة الدراسية');

  const term = await db.term.create({ data: parsed.data });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'term.create',
    entityType: 'Term',
    entityId: term.id,
    after: term
  });

  revalidatePath('/settings/academic-years');
  return term;
}

// ---------------------------------------------------------------------------
// الفترات الدراسية والمستويات
// ---------------------------------------------------------------------------

export async function createStudyPeriod(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = createStudyPeriodSchema.safeParse({
    name: formData.get('name'),
    sortOrder: formData.get('sortOrder') || 0
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  const period = await db.studyPeriod.create({ data: { orgId: session.orgId, ...parsed.data } });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'study_period.create',
    entityType: 'StudyPeriod',
    entityId: period.id,
    after: period
  });

  revalidatePath('/settings/study-periods');
  return period;
}

export async function createLevel(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = createLevelSchema.safeParse({
    name: formData.get('name'),
    sortOrder: formData.get('sortOrder') || 0
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  const level = await db.level.create({ data: { orgId: session.orgId, ...parsed.data } });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'level.create',
    entityType: 'Level',
    entityId: level.id,
    after: level
  });

  revalidatePath('/settings/levels');
  return level;
}

// ---------------------------------------------------------------------------
// الحلقات
// ---------------------------------------------------------------------------

export async function createCircle(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = createCircleSchema.safeParse({
    branchId: formData.get('branchId'),
    termId: formData.get('termId'),
    studyPeriodId: formData.get('studyPeriodId'),
    levelId: formData.get('levelId'),
    name: formData.get('name'),
    capacity: formData.get('capacity') || undefined
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  // فحص ملكية كل مفتاح أجنبي على حدة قبل الكتابة — منع أي إدخال عابر للمؤسسات
  // حتى لو كان معرّف UUID صحيحاً شكلياً لكنه يخص مؤسسة أخرى (القسم 22 و25، القاعدة 7)
  const [branch, term, period, level] = await Promise.all([
    db.branch.findFirst({ where: { id: parsed.data.branchId, orgId: session.orgId } }),
    db.term.findFirst({
      where: { id: parsed.data.termId, academicYear: { orgId: session.orgId } }
    }),
    db.studyPeriod.findFirst({ where: { id: parsed.data.studyPeriodId, orgId: session.orgId } }),
    db.level.findFirst({ where: { id: parsed.data.levelId, orgId: session.orgId } })
  ]);
  if (!branch) throw new TenantViolationError('الفرع');
  if (!term) throw new TenantViolationError('الفصل الدراسي');
  if (!period) throw new TenantViolationError('الفترة الدراسية');
  if (!level) throw new TenantViolationError('المستوى');

  const circle = await db.circle.create({ data: parsed.data });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'circle.create',
    entityType: 'Circle',
    entityId: circle.id,
    after: circle
  });

  revalidatePath('/settings/circles');
  return circle;
}

export async function assignTeacherToCircle(formData: FormData) {
  const session = await requireOrgAdmin();
  const parsed = assignTeacherSchema.safeParse({
    circleId: formData.get('circleId'),
    employeeId: formData.get('employeeId')
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة');

  const [circle, employee] = await Promise.all([
    db.circle.findFirst({ where: { id: parsed.data.circleId, branch: { orgId: session.orgId } } }),
    db.employee.findFirst({ where: { id: parsed.data.employeeId, orgId: session.orgId, deletedAt: null } })
  ]);
  if (!circle) throw new TenantViolationError('الحلقة');
  if (!employee) throw new TenantViolationError('الموظف');

  // يسمح بأكثر من معلم لنفس الحلقة — متطلب أصلي محفوظ، لذا لا نغلق التعيينات السابقة هنا
  const assignment = await db.circleTeacherAssignment.create({ data: parsed.data });

  await writeAuditLog({
    orgId: session.orgId,
    userId: session.userId,
    action: 'circle_teacher_assignment.create',
    entityType: 'CircleTeacherAssignment',
    entityId: assignment.id,
    after: assignment
  });

  revalidatePath('/settings/circles');
  return assignment;
}
