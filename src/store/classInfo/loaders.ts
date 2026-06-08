import { collectCourses, getCourseDetail } from '@/common/request/api/courses';
import { getCourseEvaluations } from '@/common/request/api/evaluations';
import { getCourseGrades } from '@/common/request/api/grade';
import { getQuestionsList } from '@/common/request/api/questions';
import type { CommentInfo, Course } from '@/common/types/commentTypes';
import type { GradeChart, WebQuestionVo } from '@/common/types/userTypes';

import type { ClassInfoData } from './types';

export async function fetchClassInfo(courseId: number): Promise<ClassInfoData> {
  const [courseData, gradesData, commentsData, questionsData] = await Promise.all([
    getCourseDetail(courseId),
    getCourseGrades(courseId),
    getCourseEvaluations(courseId, { cur_evaluation_id: 0, limit: 10 }),
    getQuestionsList({
      biz: 'Course',
      biz_id: courseId,
      cur_question_id: 0,
      limit: 10,
    }),
  ]);

  return {
    course: courseData as Course,
    collect: (courseData as Course)?.is_collected,
    grade: gradesData as GradeChart,
    comments: (commentsData as CommentInfo[]) ?? [],
    questionlist: (questionsData as WebQuestionVo[]) ?? [],
  };
}

export async function fetchCourseEvaluations(
  courseId: number
): Promise<CommentInfo[]> {
  const data = await getCourseEvaluations(courseId, {
    cur_evaluation_id: 0,
    limit: 10,
  });
  return (data as CommentInfo[]) ?? [];
}

export async function apiToggleCollect(
  courseId: number,
  nextCollect: boolean
): Promise<void> {
  await collectCourses(String(courseId), { collect: nextCollect });
}
