import type { PublisherDetailsType } from '@/common/types/courseType';

export interface PublisherStore {
  publishers: Record<number, PublisherDetailsType>;
  cachePublishers: (users: PublisherDetailsType[]) => void;
  fetchPublishers: (publisherId: number) => Promise<PublisherDetailsType>;
  ensurePublishers: (publisherIds: number[]) => Promise<void>;
}
