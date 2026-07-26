import type { CommentType } from '@/common/types/commentTypes';

import { attachUserProfiles, collectCommentPublisherIds } from './attachProfiles';
import { usePublisherStore } from './store';

/** 拉取 publisher 缓存并挂载到评论列表 */
export async function attachProfilesToComments(
  comments: CommentType[]
): Promise<CommentType[]> {
  const ids = collectCommentPublisherIds(comments);
  if (ids.length) {
    await usePublisherStore.getState().ensurePublishers(ids);
  }
  return attachUserProfiles(comments, usePublisherStore.getState().publishers);
}

export async function ensurePublisherIds(ids: number[]): Promise<void> {
  const unique = [...new Set(ids.filter((id) => id > 0))];
  if (unique.length) {
    await usePublisherStore.getState().ensurePublishers(unique);
  }
}
