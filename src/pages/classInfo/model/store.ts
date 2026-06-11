import { create } from 'zustand';

import type { CommentInfo, Course } from '@/common/types/commentTypes';
import type { GradeChart, WebQuestionVo } from '@/common/types/userTypes';
import { useEvaluationStore } from '@/store/evaluations';

export type QuestionUpsertPayload = Partial<WebQuestionVo>;

// 班级页「视图态」:课程/成绩/收藏 + 课评 id 顺序 + 问题列表。课评数据在 store/evaluations
interface ClassInfoView {
  course: Course | null;
  grade: GradeChart | undefined;
  collect: boolean | undefined;
  commentIds: number[];
  questionlist: WebQuestionVo[];
  loading: boolean;

  setLoading: (b: boolean) => void;
  setCollect: (b: boolean) => void;
  setClassData: (data: {
    course: Course | null;
    grade: GradeChart | undefined;
    collect: boolean | undefined;
    comments: CommentInfo[];
    questionlist: WebQuestionVo[];
  }) => void;
  prependEvaluation: (courseId: number, evaluation: CommentInfo) => void;
  upsertQuestion: (courseId: number, question: QuestionUpsertPayload) => void;
}

export const useClassInfoView = create<ClassInfoView>()((set) => ({
  course: null,
  grade: undefined,
  collect: undefined,
  commentIds: [],
  questionlist: [],
  loading: false,

  setLoading: (b) => set({ loading: b }),
  setCollect: (b) => set({ collect: b }),

  setClassData({ course, grade, collect, comments, questionlist }) {
    useEvaluationStore.getState().upsertMany(comments);
    set({
      course,
      grade,
      collect,
      commentIds: comments.map((c) => Number(c.id)).filter(Boolean),
      questionlist,
    });
  },

  prependEvaluation(courseId, evaluation) {
    if (!evaluation || evaluation.course_id !== courseId) return;
    useEvaluationStore.getState().upsertOne(evaluation);
    set((s) => {
      const id = Number(evaluation.id);
      if (!id || s.commentIds.includes(id)) return s;
      return { commentIds: [id, ...s.commentIds] };
    });
  },

  upsertQuestion(courseId, question) {
    if (!question) return;
    if (question.biz_id != null && question.biz_id !== courseId) return;
    set((s) => {
      const list = s.questionlist;
      if (question.id == null)
        return { questionlist: [question as WebQuestionVo, ...list] };
      const idx = list.findIndex((item) => item.id === question.id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...list[idx], ...question };
        return { questionlist: updated };
      }
      return { questionlist: [question as WebQuestionVo, ...list] };
    });
  },
}));
