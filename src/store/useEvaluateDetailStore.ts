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

// 将接口返回的子评论并入已有列表：按 id 去重，并跳过与乐观条目同内容的重复
function mergeRepliesIntoList(
  existing: CommentType[],
  incoming: CommentType[]
): CommentType[] {
  if (!incoming.length) return existing;
  const ids = new Set(existing.map((r) => r.id));
  const pendingKeys = new Set(
    existing
      .filter((r) => r.id < 0)
      .map((r) => `${r.parent_comment_id}:${r.content}`)
  );
  const next = incoming.filter((r) => {
    if (ids.has(r.id)) return false;
    if (pendingKeys.has(`${r.parent_comment_id}:${r.content}`)) return false;
    return true;
  });
  if (!next.length) return existing;
  return [...existing, ...next];
}

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
  // 拉取子评论并写入对应根评论的 replies，单一数据源
  fetchAndMergeReplies: (
    rootId: number,
    lastId: number,
    limit: number
  ) => Promise<void>;
  // 仅提交到服务端，成功即完成；本地展示依赖 addOptimisticReply 已插入的数据
  publishReply: (params: {
    bizId: number;
    content: string;
    parentId: number;
    rootId: number;
  }) => Promise<void>;
  // 乐观更新：插入临时评论，返回临时 id（负数）供失败时回滚
  addOptimisticReply: (params: {
    bizId: number;
    content: string;
    rootId: number;
    parentId: number;
    replyToUid: number;
    user: User;
  }) => number;
  // 请求失败：移除临时评论并回滚计数
  removeOptimisticReply: (optimisticId: number, rootId: number) => void;
  expandedReplyRootIds: number[];
  setReplyExpanded: (rootId: number, expanded: boolean) => void;
}

export const useEvaluateDetailStore = create<EvaluateDetailStore>()((set) => ({
  evaluation: null,
  comments: [],
  commentsLoaded: false,
  hasMore: false,
  source: null,
  expandedReplyRootIds: [],

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
      const existingById = new Map(state.comments.map((c) => [c.id, c]));
      const preserveLoadedReplies = (list: CommentType[]) =>
        list.map((c) => {
          const prev = existingById.get(c.id);
          if (!prev?.replies?.length) return c;
          return {
            ...c,
            replies: prev.replies,
            reply_count: prev.reply_count ?? c.reply_count,
            has_replies: prev.has_replies ?? c.has_replies,
            total_comment_count: prev.total_comment_count ?? c.total_comment_count,
          };
        });

      const existingIds = new Set(state.comments.map((c) => c.id));
      const nextPage = filled.filter((c) => !existingIds.has(c.id));
      return {
        comments: isRefresh
          ? preserveLoadedReplies(filled)
          : [...state.comments, ...preserveLoadedReplies(nextPage)],
        hasMore: (data as CommentType[])?.length === 10,
        commentsLoaded: true,
        source: 'network',
      };
    });
    return filled;
  },

  async fetchAndMergeReplies(rootId, lastId, limit) {
    const data = await getCommentReplies({
      root_id: rootId,
      cur_comment_id: lastId,
      limit,
    });
    if (!Array.isArray(data) || !data.length) return;

    const filled = await attachUserProfiles(data as CommentType[]);
    set((s) => ({
      comments: s.comments.map((c) => {
        if (c.id !== rootId) return c;
        const merged = mergeRepliesIntoList(c.replies ?? [], filled);
        return { ...c, replies: merged, has_replies: merged.length > 0 };
      }),
    }));
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
      // 乐观插入与展开状态同一次 set，避免 Zustand + React 双更新导致整表闪两次
      set((s) => ({
        expandedReplyRootIds: s.expandedReplyRootIds.includes(rootId)
          ? s.expandedReplyRootIds
          : [...s.expandedReplyRootIds, rootId],
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

  setReplyExpanded(rootId, expanded) {
    set((s) => {
      const has = s.expandedReplyRootIds.includes(rootId);
      if (expanded && !has) {
        return { expandedReplyRootIds: [...s.expandedReplyRootIds, rootId] };
      }
      if (!expanded && has) {
        return {
          expandedReplyRootIds: s.expandedReplyRootIds.filter((id) => id !== rootId),
        };
      }
      return s;
    });
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
