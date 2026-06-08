import type { CommentInfo, Course } from '@/common/types/commentTypes';
import type { GradeChart, WebQuestionVo } from '@/common/types/userTypes';

import type { DataSource } from '@/store/types';

export interface ClassInfoData {
  course: Course | null;
  comments: CommentInfo[];
  grade: GradeChart | undefined;
  questionlist: WebQuestionVo[];
  collect: boolean | undefined;
}

export type QuestionUpsertPayload = Partial<WebQuestionVo> & {
  id?: number;
  biz_id: number;
};

export interface ClassInfoStore extends ClassInfoData {
  source: DataSource | null;
  loading: boolean;

  load: (courseId: number) => Promise<ClassInfoData>;
  refreshComments: (courseId: number) => Promise<CommentInfo[]>;
  toggleCollect: (courseId: number, collect: boolean) => Promise<boolean>;
  upsertQuestion: (courseId: number, question: QuestionUpsertPayload) => void;
  prependEvaluation: (courseId: number, evaluation: CommentInfo) => void;
  patchEvaluationLike: (
    evaluationId: number,
    willLike: boolean
  ) => CommentInfo | undefined;
}
