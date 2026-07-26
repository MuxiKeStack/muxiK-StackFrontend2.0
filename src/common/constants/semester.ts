export const SEMESTER_NAMES = ['第一学期', '第二学期', '第三学期'] as const;
export type SemesterName = (typeof SEMESTER_NAMES)[number];

export const SEMESTER_NAME_TO_NUM: Record<SemesterName, number> = {
  第一学期: 1,
  第二学期: 2,
  第三学期: 3,
};

export const SEMESTER_ALL = '全部学期';

export function getSemesterNumber(month: number): number {
  if (month >= 9 || month <= 2) return 1;
  if (month <= 6) return 2;
  return 3;
}
