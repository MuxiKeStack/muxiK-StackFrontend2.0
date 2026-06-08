import { usePublisherStore } from '@/store/publisher';

export async function ensurePublisherIds(ids: number[]): Promise<void> {
  const unique = [...new Set(ids.filter((id) => id > 0))];
  if (unique.length) {
    await usePublisherStore.getState().ensurePublishers(unique);
  }
}
