import { create } from 'zustand';

import type { CommentInfo, CommentType, User } from '@/common/types/commentTypes';
import { registerSessionReset } from '@/common/utils/resetSession';
import { useEvaluationStore } from '@/store/evaluations';

import type { DataSource } from '@/common/types/loadType';

import {
  fetchEvaluationDetail,
  submitCommentReply,
  TOP_LEVEL_COMMENT_PAGE_SIZE,
} from './api';
import { getEvaluationDetailSessionGen } from './sessionGen';
import {
  applyPendingComment,
  createPendingComment,
  createTempId,
  mergeComments,
  mergeReplies,
  removePendingComment,
} from './commentTree';
import { getEvaluationEntry, patchEvaluationEntry } from './entry';
import type { EvaluationDetailEntry } from './types';

const commentsLoadGen: Record<number, number> = {};

interface EvaluateDetailStore {
  byId: Record<number, EvaluationDetailEntry>;
  source: DataSource | null;

  activate: (bizId: number) => void;
  reset: () => void;
  resetComments: (bizId: number) => void;
  loadEvaluation: (bizId: number) => Promise<CommentInfo | null>;
  setComments: (
    bizId: number,
    isRefresh: boolean,
    comments: CommentType[],
    hasMore: boolean,
    expectedGen?: number
  ) => CommentType[];
  appendReplies: (
    bizId: number,
    rootId: number,
    replies: CommentType[],
    limit: number
  ) => void;
  publishReply: (params: {
    bizId: number;
    content: string;
    parentId: number;
    rootId: number;
  }) => Promise<void>;
  addPendingReply: (params: {
    bizId: number;
    content: string;
    rootId: number;
    parentId: number;
    replyToUid: number;
    replyToUser?: User;
    user: User;
  }) => { tempId: number; expandRootId?: number };
  removePendingReply: (bizId: number, tempId: number, rootId: number) => void;
}

export const useEvaluateDetailStore = create<EvaluateDetailStore>()((set, get) => ({
  byId: {},
  source: null,

  activate(bizId) {
    if (!(bizId > 0)) return;
    set((s) => ({
      byId: patchEvaluationEntry(s.byId, bizId, {
        comments: [],
        commentsLoaded: false,
        hasMore: false,
      }),
    }));
  },

  reset() {
    for (const key of Object.keys(commentsLoadGen)) {
      delete commentsLoadGen[Number(key)];
    }
    set({ byId: {}, source: null });
  },

  resetComments(bizId) {
    set((s) => ({
      byId: patchEvaluationEntry(s.byId, bizId, {
        comments: [],
        commentsLoaded: false,
        hasMore: false,
      }),
    }));
  },

  async loadEvaluation(bizId) {
    const data = await fetchEvaluationDetail(bizId);
    useEvaluationStore.getState().upsertOne(data);
    set({ source: 'network' });
    return data;
  },

  setComments(bizId, isRefresh, comments, hasMore, expectedGen) {
    if (expectedGen != null && expectedGen !== getEvaluationDetailSessionGen()) {
      return comments;
    }

    commentsLoadGen[bizId] = (commentsLoadGen[bizId] ?? 0) + 1;
    const gen = commentsLoadGen[bizId];
    if (isRefresh) get().resetComments(bizId);

    let nextHasMore =
      comments.length === TOP_LEVEL_COMMENT_PAGE_SIZE ? hasMore : false;

    let result = comments;
    set((state) => {
      if (gen !== commentsLoadGen[bizId]) return state;
      if (expectedGen != null && expectedGen !== getEvaluationDetailSessionGen()) {
        return state;
      }
      const entry = getEvaluationEntry(state.byId, bizId);
      const prevLen = entry.comments.length;
      result = mergeComments(entry.comments, comments, isRefresh);
      if (!isRefresh && comments.length > 0 && result.length === prevLen) {
        nextHasMore = false;
      }
      return {
        byId: patchEvaluationEntry(state.byId, bizId, {
          comments: result,
          hasMore: nextHasMore,
          commentsLoaded: true,
        }),
        source: 'network',
      };
    });
    return result;
  },

  appendReplies(bizId, rootId, replies, limit) {
    set((s) => {
      const entry = getEvaluationEntry(s.byId, bizId);
      const comments = entry.comments.map((c) => {
        if (c.id !== rootId) return c;
        if (!replies.length) {
          return { ...c, replies_has_more: false };
        }
        const merged = mergeReplies(c.replies ?? [], replies);
        const added = merged.length - (c.replies?.length ?? 0);
        return {
          ...c,
          replies: merged,
          has_replies: merged.length > 0,
          // 不以 reply_count 判断整楼是否还有更多，用本次是否满页
          replies_has_more: replies.length >= limit && added > 0,
        };
      });
      return { byId: patchEvaluationEntry(s.byId, bizId, { comments }) };
    });
  },

  publishReply(params) {
    return submitCommentReply(params);
  },

  addPendingReply(params) {
    const tempId = createTempId();
    const reply = createPendingComment({ tempId, ...params });
    const { bizId, rootId } = params;

    set((s) => {
      const entry = getEvaluationEntry(s.byId, bizId);
      return {
        byId: patchEvaluationEntry(s.byId, bizId, {
          comments: applyPendingComment(entry.comments, reply, rootId),
        }),
      };
    });

    return {
      tempId,
      expandRootId: rootId !== 0 ? rootId : undefined,
    };
  },

  removePendingReply(bizId, tempId, rootId) {
    set((s) => {
      const entry = getEvaluationEntry(s.byId, bizId);
      return {
        byId: patchEvaluationEntry(s.byId, bizId, {
          comments: removePendingComment(entry.comments, tempId, rootId),
        }),
      };
    });
  },
}));

registerSessionReset(() => useEvaluateDetailStore.getState().reset());
