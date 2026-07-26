import { create } from 'zustand';

import { endorseEvaluation as endorseEvaluationApi } from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';
import { toggleCommentLike } from '@/common/utils/comment';
import { useEvaluationHistoryStore } from '../evaluationHistory/store';
import { registerSessionReset } from '@/common/utils/resetSession';

const MAX_ENTITIES = 500;

/**
 * 课评实体仓:全项目「一条课评」的唯一真相,按 id 存。
 * 首页 / 班级页 / 历史页 / 详情页都只引用这里的同一份;
 * 点赞、评论数等就地改动只改这里一处,所有页面自动联动,无需扇出。
 */
interface EvaluationEntityStore {
  byId: Record<number, CommentInfo>;

  upsertMany: (items: CommentInfo[]) => void;
  upsertOne: (item: CommentInfo) => void;
  get: (id: number) => CommentInfo | undefined;
  patch: (id: number, fields: Partial<CommentInfo>) => CommentInfo | undefined;
  toggleLike: (id: number, willLike: boolean) => CommentInfo | undefined;
  incrementCommentCount: (id: number, delta?: number) => CommentInfo | undefined;
  /** API 点赞/取消 + 实体仓更新 + 历史页副本同步 */
  endorse: (id: number, willLike: boolean) => Promise<CommentInfo | undefined>;
  clear: () => void;
}

function idOf(item: CommentInfo): number {
  return Number(item.id);
}

export const useEvaluationStore = create<EvaluationEntityStore>()((set, get) => ({
  byId: {},

  upsertMany(items) {
    if (!items.length) return;
    set((state) => {
      const next = { ...state.byId };
      for (const item of items) {
        const id = idOf(item);
        if (!id) continue;
        // 合并而非替换:字段少的接口不能洗掉字段多的接口已有的数据
        next[id] = { ...next[id], ...item };
      }
      const keys = Object.keys(next);
      while (keys.length > MAX_ENTITIES) {
        delete next[Number(keys.shift())];
      }
      return { byId: next };
    });
  },

  upsertOne(item) {
    get().upsertMany([item]);
  },

  get(id) {
    return get().byId[Number(id)];
  },

  patch(id, fields) {
    const key = Number(id);
    let patched: CommentInfo | undefined;
    set((state) => {
      const prev = state.byId[key];
      if (!prev) return state;
      patched = { ...prev, ...fields };
      return { byId: { ...state.byId, [key]: patched } };
    });
    return patched;
  },

  toggleLike(id, willLike) {
    const key = Number(id);
    let patched: CommentInfo | undefined;
    set((state) => {
      const prev = state.byId[key];
      if (!prev) return state;
      patched = toggleCommentLike(prev, willLike);
      return { byId: { ...state.byId, [key]: patched } };
    });
    return patched;
  },

  incrementCommentCount(id, delta = 1) {
    const key = Number(id);
    let patched: CommentInfo | undefined;
    set((state) => {
      const prev = state.byId[key];
      if (!prev) return state;
      patched = {
        ...prev,
        total_comment_count: (prev.total_comment_count || 0) + delta,
      };
      return { byId: { ...state.byId, [key]: patched } };
    });
    return patched;
  },

  async endorse(id, willLike) {
    await endorseEvaluationApi(id, { stance: willLike ? 1 : 0 });
    const patched = get().toggleLike(id, willLike);
    useEvaluationHistoryStore.getState().patchEvaluationLike(id, willLike);
    return patched;
  },

  clear() {
    set({ byId: {} });
  },
}));

registerSessionReset(() => useEvaluationStore.getState().clear());
