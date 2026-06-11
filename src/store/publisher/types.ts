import type { CommentInfo } from '@/common/types/commentTypes';
import type { PublisherDetailsType } from '@/common/types/courseType';

export interface PublisherStore {
  publishers: Record<number, PublisherDetailsType>;
  cachePublishers: (users: PublisherDetailsType[]) => void;
  fetchPublishers: (publisherId: number) => Promise<PublisherDetailsType>;
  ensurePublishers: (publisherIds: number[]) => Promise<void>;
  /** 从课评列表写入发布者仓 + 课程详情仓 */
  ingestFromEvaluations: (list: CommentInfo[]) => void;
}
