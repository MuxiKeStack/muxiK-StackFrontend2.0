import {
  getCommentReplies,
  getTopLevelComments,
  publishComment,
} from '@/common/request/api/comments';
import { getEvaluationDetail } from '@/common/request/api/evaluations';
import { BusinessError } from '@/common/request/errors/BusinessError';
import type { CommentInfo, CommentType } from '@/common/types/commentTypes';

export async function fetchEvaluationDetail(bizId: number): Promise<CommentInfo> {
  const data = await getEvaluationDetail(bizId);
  return data as CommentInfo;
}

export const TOP_LEVEL_COMMENT_PAGE_SIZE = 10;

export async function fetchTopLevelComments(
  bizId: number,
  lastId: number,
  limit = TOP_LEVEL_COMMENT_PAGE_SIZE
): Promise<{ raw: CommentType[]; hasMore: boolean }> {
  const data = await getTopLevelComments({
    biz: 'Evaluation',
    biz_id: bizId,
    cur_comment_id: lastId,
    limit,
  });
  const raw = (data as CommentType[]) || [];
  return { raw, hasMore: raw.length === limit };
}

export async function fetchCommentReplies(
  rootId: number,
  lastId: number,
  limit: number
): Promise<CommentType[]> {
  const data = await getCommentReplies({
    root_id: rootId,
    cur_comment_id: lastId,
    limit,
  });
  if (!Array.isArray(data) || !data.length) return [];
  return data as CommentType[];
}

export async function submitCommentReply(params: {
  bizId: number;
  content: string;
  parentId: number;
  rootId: number;
}): Promise<void> {
  try {
    await publishComment({
      biz: 'Evaluation',
      biz_id: params.bizId,
      content: params.content,
      parent_id: params.parentId,
      root_id: params.rootId,
    });
  } catch (error) {
    if (error instanceof BusinessError && error.code === 409002) {
      throw error;
    }
    throw new Error('评论失败');
  }
}
