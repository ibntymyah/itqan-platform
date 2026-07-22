import { describe, expect, it } from 'vitest';
import { can, assertCan } from './permissions';

describe('can()', () => {
  it('يسمح لمالك النظام بإدارة البنية الأكاديمية', () => {
    expect(can(['system_owner'], 'academic_structure.manage')).toBe(true);
  });

  it('يسمح لمشرف المؤسسة بإدارة البنية الأكاديمية', () => {
    expect(can(['org_admin'], 'academic_structure.manage')).toBe(true);
  });

  it('لا يسمح للمعلم بإدارة البنية الأكاديمية — عرض فقط', () => {
    expect(can(['teacher'], 'academic_structure.manage')).toBe(false);
    expect(can(['teacher'], 'academic_structure.view')).toBe(true);
  });

  it('لا يسمح للطالب أو ولي الأمر برؤية بيانات غير بياناته', () => {
    expect(can(['student'], 'students.view')).toBe(false);
    expect(can(['student'], 'students.view_own')).toBe(true);
    expect(can(['parent'], 'students.view')).toBe(false);
  });

  it('يسمح للمعلم بتسجيل الحضور والتسميع لحلقته فقط', () => {
    expect(can(['teacher'], 'attendance.enter_own_circle')).toBe(true);
    expect(can(['teacher'], 'progress.enter_own_circle')).toBe(true);
  });

  it('المشرف لا يستطيع إدارة إعدادات المؤسسة (بحسب المصفوفة — القسم 5)', () => {
    expect(can(['supervisor'], 'org_settings.manage')).toBe(false);
  });

  it('دور غير معروف لا يملك أي صلاحية', () => {
    expect(can(['unknown_role'], 'students.view')).toBe(false);
  });

  it('مستخدم بأدوار متعددة يأخذ أوسع الصلاحيات', () => {
    expect(can(['teacher', 'supervisor'], 'circles.manage')).toBe(true);
  });
});

describe('assertCan()', () => {
  it('لا يرمي خطأ عند وجود الصلاحية', () => {
    expect(() => assertCan(['org_admin'], 'students.manage')).not.toThrow();
  });

  it('يرمي خطأ عند غياب الصلاحية', () => {
    expect(() => assertCan(['teacher'], 'org_settings.manage')).toThrow();
  });
});
