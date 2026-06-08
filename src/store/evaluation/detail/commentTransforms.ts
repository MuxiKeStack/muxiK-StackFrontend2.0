import type { CommentType } from '@/common/types/commentTypes';

export function mergeRepliesIntoList(
  existing: CommentType[],
  incoming: CommentType[]
): CommentType[] {
  if (!incoming.length) return existing;
  const ids = new Set(existing.map((r) => r.id));
  const pendingKeys = new Set(
    existing.filter((r) => r.id < 0).map((r) => `${r.parent_comment_id}:${r.content}`)
  );
  const next = incoming.filter((r) => {
    if (ids.has(r.id)) return false;
    if (pendingKeys.has(`${r.parent_comment_id}:${r.content}`)) return false;
    return true;
  });
  if (!next.length) return existing;
  return [...existing, ...next];
}

export function mergeTopLevelComments(
  existing: CommentType[],
  filled: CommentType[],
  isRefresh: boolean
): CommentType[] {
  const existingById = new Map(existing.map((c) => [c.id, c]));
  const preserveLoadedReplies = (list: CommentType[]) =>
    list.map((c) => {
      const prev = existingById.get(c.id);
      if (!prev?.replies?.length) return c;
      return {
        ...c,
        replies: prev.replies,
        reply_count: prev.reply_count ?? c.reply_count,
        has_replies: prev.has_replies ?? c.has_replies,
        total_comment_count: prev.total_comment_count ?? c.total_comment_count,
      };
    });

  if (isRefresh) return preserveLoadedReplies(filled);

  const existingIds = new Set(existing.map((c) => c.id));
  const nextPage = filled.filter((c) => !existingIds.has(c.id));
  return [...existing, ...preserveLoadedReplies(nextPage)];
}
