import type { DataSource } from '@/store/types';

import type { QuestionDetailBucket } from '../shared/types';

export interface QuestionDetail {
  id: number;
  questioner_id: number;
  biz: string;
  biz_id: number;
  content: string;
  answer_cnt: number;
  preview_answers: null | Array<{ id: number; content: string }>;
  utime: number;
  ctime: number;
}

export interface AnswerDetail {
  id: number;
  publisher_id: number;
  question_id: number;
  content: string;
  stance: number;
  total_support_count: number;
  total_comment_count: number;
  utime: number;
  ctime: number;
  publisher?: {
    id: number;
    avatar: string;
    nickname: string;
    using_title?: string;
    level?: number;
  };
}

export interface QuestionDetailStore {
  activeQuestionId: number | null;
  buckets: Record<number, QuestionDetailBucket>;
  source: DataSource | null;

  loadQuestion: (questionId: number) => Promise<QuestionDetail | null>;
  loadAnswers: (questionId: number) => Promise<AnswerDetail[]>;
  loadMoreAnswers: (questionId: number) => Promise<AnswerDetail[]>;
  publishReply: (questionId: number, content: string) => Promise<void>;
  addOptimisticAnswer: (params: {
    questionId: number;
    content: string;
    publisher: NonNullable<AnswerDetail['publisher']>;
  }) => number;
  confirmOptimisticAnswer: (
    optimisticId: number,
    questionId: number
  ) => QuestionDetail | null;
  removeOptimisticAnswer: (optimisticId: number, questionId: number) => void;
}
