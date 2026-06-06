import { create } from 'zustand';

import {
  getCommentReplies,
  getTopLevelComments,
  publishComment,
} from '@/common/request/api/comments';
import { getEvaluationDetail } from '@/common/request/api/evaluations';
import { BusinessError } from '@/common/request/errors/BusinessError';
import { useCourseStore } from '@/store/useCourseStore';

import type { DataSource } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommentRow = any;

async function attachUserProfiles(comments: CommentRow[]): Promise<CommentRow[]> {
  const ids = [
    ...new Set(
      comments
        .filter((c) => !c.user?.nickname && c.commentator_id && c.commentator_id !== 0)
        .map((c: CommentRow) => c.commentator_id as number)
    ),
  ];
  await useCourseStore.getState().ensurePublishers(ids);
  const publishers = useCourseStore.getState().publishers;
  return comments.map((c) => {
    if (c.user?.nickname || !c.commentator_id) return c;
    return {
      ...c,
      user: publishers[c.commentator_id] || {
        id: c.commentator_id,
        nickname: '未知用户',
        avatar: '',
      },
    };
  });
}

interface EvaluateDetailStore {
  evaluation: CommentRow | null;
  comments: CommentRow[];
  commentsLoaded: boolean;
  hasMore: boolean;
  source: DataSource | null;
  loadEvaluation: (bizId: number) => Promise<CommentRow | null>;
  loadComments: (
    bizId: number,
    isRefresh: boolean,
    lastId?: number
  ) => Promise<CommentRow[]>;
  loadReplies: (rootId: number, lastId: number, limit: number) => Promise<CommentRow[]>;
  publishReply: (params: {
    bizId: number;
    content: string;
    parentId: number;
    rootId: number;
  }) => Promise<void>;
}

export const useEvaluateDetailStore = create<EvaluateDetailStore>()((set, get) => ({
  evaluation: null,
  comments: [],
  commentsLoaded: false,
  hasMore: false,
  source: null,

  async loadEvaluation(bizId) {
    const data = await getEvaluationDetail(bizId);
    set({ evaluation: data, source: 'network' });
    return data as CommentRow;
  },

  async loadComments(bizId, isRefresh, lastId = 0) {
    const data = await getTopLevelComments({
      biz: 'Evaluation',
      biz_id: bizId,
      cur_comment_id: lastId,
      limit: 10,
    });
    const filled = await attachUserProfiles((data as CommentRow[]) || []);
    set((state) => ({
      comments: isRefresh ? filled : [...state.comments, ...filled],
      hasMore: (data as CommentRow[])?.length === 10,
      commentsLoaded: true,
      source: 'network',
    }));
    return filled;
  },

  async loadReplies(rootId, lastId, limit) {
    const data = await getCommentReplies({
      root_id: rootId,
      cur_comment_id: lastId,
      limit,
    });
    if (!Array.isArray(data)) return [];
    return attachUserProfiles(data);
  },

  async publishReply({ bizId, content, parentId, rootId }) {
    try {
      await publishComment({
        biz: 'Evaluation',
        biz_id: bizId,
        content,
        parent_id: parentId,
        root_id: rootId,
      });
    } catch (error) {
      if (error instanceof BusinessError && error.code === 409002) {
        throw error;
      }
      throw new Error('评论失败');
    }
  },
}));
