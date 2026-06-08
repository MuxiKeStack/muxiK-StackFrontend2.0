import type { EvaluationStatus } from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';

import type { DataSource } from '@/store/types';

export interface EvaluationHistoryCache {
  list: CommentInfo[];
  lastId: number | undefined;
  hasMore: boolean;
  status: EvaluationStatus;
}

export interface EvaluationHistoryStore {
  cache: Record<string, EvaluationHistoryCache>;
  source: DataSource | null;
  activeStatus: EvaluationStatus;
  loading: boolean;

  setCache: (status: EvaluationStatus, data: EvaluationHistoryCache) => void;
  setActiveStatus: (status: EvaluationStatus) => Promise<void>;
  fetchPage: (append: boolean) => Promise<CommentInfo[]>;
  loadMore: () => Promise<void>;
  load: (
    status: EvaluationStatus,
    curLastId: number,
    append: boolean,
    options?: { force?: boolean }
  ) => Promise<CommentInfo[]>;
  toggleStatus: (
    evaluationId: number,
    targetStatus: EvaluationStatus,
    currentStatus: EvaluationStatus
  ) => Promise<void>;
  removeItem: (status: EvaluationStatus, evaluationId: number) => void;
  moveItem: (
    fromStatus: EvaluationStatus,
    toStatus: EvaluationStatus,
    evaluationId: number
  ) => void;
  invalidateCache: (status: EvaluationStatus) => void;
  refresh: (status: EvaluationStatus) => Promise<CommentInfo[]>;
  clearCache: () => void;
  patchEvaluationLike: (evaluationId: number, willLike: boolean) => CommentInfo | undefined;
}

export const PAGE_SIZE = 10;
