import {
  attachUserProfiles,
  collectCommentPublisherIds,
} from '@/store/publisher/attachProfiles';
import { usePublisherStore } from '@/store/publisher';

import type { CommentType } from '@/common/types/commentTypes';

/** 编排：拉取 publisher 缓存并挂载到评论列表 */
export async function attachProfilesToComments(
  comments: CommentType[]
): Promise<CommentType[]> {
  const ids = collectCommentPublisherIds(comments);
  if (ids.length) {
    await usePublisherStore.getState().ensurePublishers(ids);
  }
  return attachUserProfiles(comments, usePublisherStore.getState().publishers);
}
