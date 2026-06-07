import { create } from 'zustand';

import { useMyCollectionsStore } from '@/store/useCollections';
import { useCourseStore } from '@/store/useCourseStore';

import { collectCourses, getCourseDetail } from '@/common/request/api/courses';
import { getCourseEvaluations } from '@/common/request/api/evaluations';
import { getCourseGrades } from '@/common/request/api/grade';
import { getQuestionsList } from '@/common/request/api/questions';
import type { CollectionProps } from '@/common/types/collectionsType';
import type { CommentInfo, Course } from '@/common/types/commentTypes';
import type { GradeChart, WebQuestionVo } from '@/common/types/userTypes';

import type { DataSource } from './types';

interface ClassInfoData {
  course: Course | null;
  comments: CommentInfo[];
  grade: GradeChart | undefined;
  questionlist: WebQuestionVo[];
  collect: boolean | undefined;
}

interface ClassInfoStore extends ClassInfoData {
  source: DataSource | null;
  loading: boolean;
  load: (courseId: number) => Promise<ClassInfoData>;
  refreshComments: (courseId: number) => Promise<CommentInfo[]>;
  toggleCollect: (courseId: number, course: Course, collect: boolean) => Promise<boolean>;
}

export const useClassInfoStore = create<ClassInfoStore>()((set, get) => ({
  course: null,
  comments: [],
  grade: undefined,
  questionlist: [],
  collect: undefined,
  source: null,
  loading: false,

  async load(courseId) {
    set({ loading: true });
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

      const data: ClassInfoData = {
        course: courseData as Course,
        collect: (courseData as Course)?.is_collected,
        grade: gradesData as GradeChart,
        comments: (commentsData as CommentInfo[]) ?? [],
        questionlist: (questionsData as WebQuestionVo[]) ?? [],
      };

      if (courseData) {
        useCourseStore.getState().cacheCourseDetails({
          [courseId]: {
            name: (courseData as Course).name,
            teacher: (courseData as Course).teacher,
            school: '',
          },
        });
      }

      set({ ...data, source: 'network', loading: false });
      return data;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  async refreshComments(courseId) {
    const data = await getCourseEvaluations(courseId, {
      cur_evaluation_id: 0,
      limit: 10,
    });
    const comments = (data as CommentInfo[]) ?? [];
    set({ comments, source: 'network' });
    return comments;
  },

  async toggleCollect(courseId, course, collect) {
    const nextCollect = !collect;
    await collectCourses(String(courseId), { collect: nextCollect });

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

    set({ collect: nextCollect });
    return nextCollect;
  },
}));
