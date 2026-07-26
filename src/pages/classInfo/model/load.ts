import { collectCourses, getCourseDetail } from '@/common/request/api/courses';
import { getCourseEvaluations } from '@/common/request/api/evaluations';
import { getCourseGrades } from '@/common/request/api/grade';
import { getQuestionsList } from '@/common/request/api/questions';
import type { CommentInfo, Course } from '@/common/types/commentTypes';
import type { GradeChart, WebQuestionVo } from '@/common/types/userTypes';
import { bus } from '@/common/utils';
import { useMyCollectionsStore } from '@/store/collections';
import { useCourseStore } from '@/store/course';

import type { CollectionProps } from '@/common/types/collectionsType';

import { useClassInfoView } from './store';

interface ClassInfoData {
  course: Course | null;
  comments: CommentInfo[];
  grade: GradeChart | undefined;
  questionlist: WebQuestionVo[];
  collect: boolean | undefined;
}

/** 拉班级页全部数据,写入视图态 + 课程详情实体仓 */
export async function loadClassInfo(courseId: number): Promise<ClassInfoData> {
  useClassInfoView.getState().setLoading(true);
  try {
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

    const course = courseData as Course;
    const data: ClassInfoData = {
      course,
      collect: course?.is_collected,
      grade: gradesData as GradeChart,
      comments: (commentsData as CommentInfo[]) ?? [],
      questionlist: (questionsData as WebQuestionVo[]) ?? [],
    };

    useClassInfoView.getState().setClassData(data);

    if (course) {
      useCourseStore.getState().cacheCourseDetails({
        [courseId]: { name: course.name, teacher: course.teacher, school: '' },
      });
    }
    return data;
  } finally {
    useClassInfoView.getState().setLoading(false);
  }
}

// 收藏切换 + 同步 collections store
export async function toggleClassCollect(
  courseId: number,
  course: Course,
  collect: boolean
): Promise<boolean> {
  const nextCollect = !collect;
  await collectCourses(String(courseId), { collect: nextCollect });
  useClassInfoView.getState().setCollect(nextCollect);

  const { id, name, teacher, composite_score, type, features } = course;
  const { addCollection, removeCollection } = useMyCollectionsStore.getState();
  if (nextCollect) {
    addCollection({
      id,
      course_id: id,
      name,
      teacher,
      composite_score,
      courseType: type,
      features: Object.keys(features || {}),
      is_collected: true,
    } as CollectionProps);
  } else {
    removeCollection(courseId);
  }
  return nextCollect;
}

// 订阅发评 / 发问后的列表同步
export function subscribeClassInfoEvents(courseId: number): () => void {
  const offQuestion = bus.on('question', (q: WebQuestionVo) => {
    if (q) useClassInfoView.getState().upsertQuestion(courseId, q);
  });
  const offEvaluation = bus.on('evaluation', (e: CommentInfo) => {
    if (e) useClassInfoView.getState().prependEvaluation(courseId, e);
  });
  return () => {
    offQuestion();
    offEvaluation();
  };
}
