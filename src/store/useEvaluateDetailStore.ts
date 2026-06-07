import { create } from 'zustand';

import { useCourseStore } from '@/store/useCourseStore';

import {
  getCommentReplies,
  getTopLevelComments,
  publishComment,
} from '@/common/request/api/comments';
import { getEvaluationDetail } from '@/common/request/api/evaluations';
import { BusinessError } from '@/common/request/errors/BusinessError';
import type { CommentType, User } from '@/common/types/commentTypes';

import type { DataSource } from './types';

// 评课详情体（FeedCard 用，结构与评论不同，留待后续单独收敛）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvaluationRow = any;

async function attachUserProfiles(comments: CommentType[]): Promise<CommentType[]> {
  const ids = [
    ...new Set(
      comments
        .filter((c) => !c.user?.nickname && c.commentator_id && c.commentator_id !== 0)
        .map((c) => c.commentator_id)
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
  evaluation: EvaluationRow | null;
  comments: CommentType[];
  commentsLoaded: boolean;
  hasMore: boolean;
  source: DataSource | null;
  loadEvaluation: (bizId: number) => Promise<EvaluationRow | null>;
  loadComments: (
    bizId: number,
    isRefresh: boolean,
    lastId?: number
  ) => Promise<CommentType[]>;
  loadReplies: (rootId: number, lastId: number, limit: number) => Promise<CommentType[]>;
  publishReply: (params: {
    bizId: number;
    content: string;
    parentId: number;
    rootId: number;
  }) => Promise<CommentType>;
  // 乐观更新：插入临时评论，返回临时 id（负数）供后续确认/回滚
  addOptimisticReply: (params: {
    bizId: number;
    content: string;
    rootId: number;
    parentId: number;
    replyToUid: number;
    user: User;
  }) => number;
  // 请求成功：用服务端返回替换临时评论
  replaceOptimisticReply: (
    optimisticId: number,
    rootId: number,
    serverComment: CommentType
  ) => void;
  // 请求失败：移除临时评论并回滚计数
  removeOptimisticReply: (optimisticId: number, rootId: number) => void;
}

export const useEvaluateDetailStore = create<EvaluateDetailStore>()((set) => ({
  evaluation: null,
  comments: [],
  commentsLoaded: false,
  hasMore: false,
  source: null,

  async loadEvaluation(bizId) {
    const data = await getEvaluationDetail(bizId);
    set({ evaluation: data, source: 'network' });
    return data as EvaluationRow;
  },

  async loadComments(bizId, isRefresh, lastId = 0) {
    const data = await getTopLevelComments({
      biz: 'Evaluation',
      biz_id: bizId,
      cur_comment_id: lastId,
      limit: 10,
    });
    const filled = await attachUserProfiles((data as CommentType[]) || []);
    set((state) => {
      const existingIds = new Set(state.comments.map((c) => c.id));
      const nextPage = filled.filter((c) => !existingIds.has(c.id));
      return {
        comments: isRefresh ? filled : [...state.comments, ...nextPage],
        hasMore: (data as CommentType[])?.length === 10,
        commentsLoaded: true,
        source: 'network',
      };
    });
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
      const data = await publishComment({
        biz: 'Evaluation',
        biz_id: bizId,
        content,
        parent_id: parentId,
        root_id: rootId,
      });
      const [filled] = await attachUserProfiles([data as CommentType]);
      return filled ?? (data as CommentType);
    } catch (error) {
      if (error instanceof BusinessError && error.code === 409002) {
        throw error;
      }
      throw new Error('评论失败');
    }
  },

  addOptimisticReply({ bizId, content, rootId, parentId, replyToUid, user }) {
    const optimisticId = -Date.now();
    const newComment: CommentType = {
      id: optimisticId,
      commentator_id: 0,
      biz: 'Evaluation',
      biz_id: bizId,
      content,
      root_comment_id: rootId,
      parent_comment_id: parentId,
      reply_to_uid: replyToUid,
      ctime: Date.now(),
      utime: Date.now(),
      user,
    };
    if (rootId === 0) {
      set((s) => ({ comments: [newComment, ...s.comments] }));
    } else {
      set((s) => ({
        comments: s.comments.map((c) =>
          c.id === rootId
            ? {
                ...c,
                reply_count: (c.reply_count || 0) + 1,
                has_replies: true,
                replies: c.replies ? [newComment, ...c.replies] : [newComment],
                total_comment_count: (c.total_comment_count || 0) + 1,
              }
            : c
        ),
      }));
    }
    return optimisticId;
  },

  replaceOptimisticReply(optimisticId, rootId, serverComment) {
    if (rootId === 0) {
      set((s) => ({
        comments: s.comments.map((c) => (c.id === optimisticId ? serverComment : c)),
      }));
    } else {
      set((s) => ({
        comments: s.comments.map((c) => {
          if (c.id !== rootId) return c;
          const replies = c.replies?.map((r) => (r.id === optimisticId ? serverComment : r));
          return { ...c, replies };
        }),
      }));
    }
  },

  removeOptimisticReply(optimisticId, rootId) {
    if (rootId === 0) {
      set((s) => ({ comments: s.comments.filter((c) => c.id !== optimisticId) }));
    } else {
      set((s) => ({
        comments: s.comments.map((c) => {
          if (c.id !== rootId) return c;
          const replies = c.replies?.filter((r) => r.id !== optimisticId);
          return {
            ...c,
            replies,
            reply_count: Math.max((c.reply_count || 1) - 1, 0),
            total_comment_count: Math.max((c.total_comment_count || 1) - 1, 0),
          };
        }),
      }));
    }
  },
}));
