import { create } from 'zustand';

import type { DataSource } from '@/store/types';

import type { CommentInfo, CommentType, User } from '@/common/types/commentTypes';

import {
  getEvaluationBucket,
  patchEvaluationBucket,
  type EvaluationDetailBucket,
} from '../shared/types';
import { patchCommentInfoLike } from '../shared/patchLike';
import { mergeRepliesIntoList, mergeTopLevelComments } from './commentTransforms';
import { fetchEvaluationDetail, submitCommentReply } from './loaders';
import {
  buildOptimisticComment,
  createOptimisticId,
  insertOptimisticComment,
  removeOptimisticComment,
} from './optimisticReply';
import { patchEvaluationFields as patchFields } from './patch';

const commentsLoadGen: Record<number, number> = {};

interface EvaluateDetailStore {
  activeBizId: number | null;
  buckets: Record<number, EvaluationDetailBucket>;
  source: DataSource | null;

  openEvaluation: (item: CommentInfo) => number | null;
  resetCommentsForBizId: (bizId: number) => void;
  patchEvaluationFields: (fields: Partial<CommentInfo>, bizId?: number) => void;
  loadEvaluation: (bizId: number) => Promise<CommentInfo | null>;
  ingestTopLevelComments: (
    bizId: number,
    isRefresh: boolean,
    filled: CommentType[],
    hasMore: boolean
  ) => CommentType[];
  ingestMergedReplies: (bizId: number, rootId: number, filled: CommentType[]) => void;
  publishReply: (params: {
    bizId: number;
    content: string;
    parentId: number;
    rootId: number;
  }) => Promise<void>;
  addOptimisticReply: (params: {
    bizId: number;
    content: string;
    rootId: number;
    parentId: number;
    replyToUid: number;
    replyToUser?: User;
    user: User;
  }) => { optimisticId: number; expandRootId?: number };
  removeOptimisticReply: (bizId: number, optimisticId: number, rootId: number) => void;
  patchEvaluationLike: (
    evaluationId: number,
    willLike: boolean
  ) => CommentInfo | undefined;
}

export const useEvaluateDetailStore = create<EvaluateDetailStore>()((set, get) => ({
  activeBizId: null,
  buckets: {},
  source: null,

  openEvaluation(item) {
    const bizId = Number(item.id);
    if (!bizId) return null;
    set((s) => ({
      activeBizId: bizId,
      buckets: patchEvaluationBucket(s.buckets, bizId, {
        evaluation: item,
        comments: [],
        commentsLoaded: false,
        hasMore: false,
      }),
    }));
    return bizId;
  },

  resetCommentsForBizId(bizId) {
    set((s) => ({
      buckets: patchEvaluationBucket(s.buckets, bizId, {
        comments: [],
        commentsLoaded: false,
        hasMore: false,
      }),
    }));
  },

  patchEvaluationFields(fields, bizId) {
    const id = bizId ?? get().activeBizId;
    if (id == null) return;
    set((s) => {
      const bucket = getEvaluationBucket(s.buckets, id);
      return {
        buckets: patchEvaluationBucket(s.buckets, id, {
          evaluation: patchFields(bucket.evaluation, fields),
        }),
      };
    });
  },

  async loadEvaluation(bizId) {
    const data = await fetchEvaluationDetail(bizId);
    set((s) => ({
      buckets: patchEvaluationBucket(s.buckets, bizId, { evaluation: data }),
      source: 'network',
    }));
    return data;
  },

  ingestTopLevelComments(bizId, isRefresh, filled, hasMore) {
    commentsLoadGen[bizId] = (commentsLoadGen[bizId] ?? 0) + 1;
    const gen = commentsLoadGen[bizId];
    if (isRefresh) get().resetCommentsForBizId(bizId);

    let result = filled;
    set((state) => {
      if (gen !== commentsLoadGen[bizId]) return state;
      const bucket = getEvaluationBucket(state.buckets, bizId);
      result = mergeTopLevelComments(bucket.comments, filled, isRefresh);
      return {
        activeBizId: bizId,
        buckets: patchEvaluationBucket(state.buckets, bizId, {
          comments: result,
          hasMore,
          commentsLoaded: true,
        }),
        source: 'network',
      };
    });
    return result;
  },

  ingestMergedReplies(bizId, rootId, filled) {
    if (!filled.length) return;
    set((s) => {
      const bucket = getEvaluationBucket(s.buckets, bizId);
      const comments = bucket.comments.map((c) => {
        if (c.id !== rootId) return c;
        const merged = mergeRepliesIntoList(c.replies ?? [], filled);
        return { ...c, replies: merged, has_replies: merged.length > 0 };
      });
      return { buckets: patchEvaluationBucket(s.buckets, bizId, { comments }) };
    });
  },

  publishReply(params) {
    return submitCommentReply(params);
  },

  addOptimisticReply(params) {
    const optimisticId = createOptimisticId();
    const comment = buildOptimisticComment({ optimisticId, ...params });
    const { bizId, rootId } = params;

    set((s) => {
      const bucket = getEvaluationBucket(s.buckets, bizId);
      return {
        buckets: patchEvaluationBucket(s.buckets, bizId, {
          comments: insertOptimisticComment(bucket.comments, comment, rootId),
        }),
      };
    });

    return {
      optimisticId,
      expandRootId: rootId !== 0 ? rootId : undefined,
    };
  },

  removeOptimisticReply(bizId, optimisticId, rootId) {
    set((s) => {
      const bucket = getEvaluationBucket(s.buckets, bizId);
      return {
        buckets: patchEvaluationBucket(s.buckets, bizId, {
          comments: removeOptimisticComment(bucket.comments, optimisticId, rootId),
        }),
      };
    });
  },

  patchEvaluationLike(evaluationId, willLike) {
    let patched: CommentInfo | undefined;
    set((s) => {
      const bucket = getEvaluationBucket(s.buckets, evaluationId);
      if (!bucket.evaluation || Number(bucket.evaluation.id) !== Number(evaluationId)) {
        return s;
      }
      patched = patchCommentInfoLike(bucket.evaluation, willLike);
      return {
        buckets: patchEvaluationBucket(s.buckets, evaluationId, { evaluation: patched }),
      };
    });
    return patched;
  },
}));
