import { Text, View } from '@tarojs/components';
import React, { useCallback, useMemo, useState } from 'react';

import './index.scss';

import { CommentCard, Loading } from '@/common/components';
import type { DiscussionComment } from '@/common/types/commentTypes';

interface ReplySectionProps {
  rootId: number;
  // replyCount当前后端仅计算直接子评论，存在误差，目前前端仅用来判断是否有子评论
  replyCount: number;
  repliesHasMore?: boolean;
  replies?: DiscussionComment[];
  expanded: boolean;

  onExpandedChange: (expanded: boolean) => void;
  onLoadReplies: (rootId: number, lastId: number, limit: number) => Promise<void>;
  onCommentClick?: (comment: DiscussionComment) => void;
  onCommentLongPress?: (comment: DiscussionComment) => void;
  getReplyIndicator?: (reply: DiscussionComment) => { show: boolean; nickname?: string };
}

const ReplySection: React.FC<ReplySectionProps> = ({
  rootId,
  replyCount,
  repliesHasMore = false,
  replies = [],
  expanded,
  onExpandedChange,
  onLoadReplies,
  onCommentClick,
  onCommentLongPress,
  getReplyIndicator,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExpand = useCallback(async () => {
    onExpandedChange(true);
    setIsLoading(true);
    try {
      await onLoadReplies(rootId, 0, 3);
    } finally {
      setIsLoading(false);
    }
  }, [rootId, onLoadReplies, onExpandedChange]);

  const handleLoadMore = useCallback(async () => {
    const lastServerId = [...replies].reverse().find((r) => r.id > 0)?.id ?? 0;
    setIsLoading(true);
    try {
      await onLoadReplies(rootId, lastServerId, 10);
    } finally {
      setIsLoading(false);
    }
  }, [rootId, onLoadReplies, replies]);

  const handleCollapse = useCallback(() => {
    onExpandedChange(false);
  }, [onExpandedChange]);

  // store 里子评论按接口顺序旧到新存放；展示层反转为新到旧，分页游标仍用原数组
  const displayReplies = useMemo(() => [...replies].reverse(), [replies]);

  const showReplies = expanded && (replies.length > 0 || isLoading);
  const showExpandOnly = !expanded && replyCount > 0;
  // 整楼总数待后端修正；分页以上次拉取是否满页为准，不用 reply_count
  const subHasMore = repliesHasMore;
  // const remainingCount = replyCount - replies.length;

  if (replyCount === 0) return null;

  return (
    <View className="secondary_replies_container">
      {showReplies && (
        <View className="secondary_replies_list">
          {displayReplies.map((reply) => {
            const indicator = getReplyIndicator?.(reply);
            return (
              <View className="reply_item_wrapper" key={reply.id}>
                <CommentCard
                  comment={reply}
                  level="secondary"
                  onClick={onCommentClick}
                  onLongPress={onCommentLongPress}
                  showReplyIndicator={indicator?.show ?? false}
                  replyToNickname={indicator?.nickname}
                  showBorder={false}
                />
              </View>
            );
          })}
        </View>
      )}

      <View className="secondary_replies_footer">
        {showExpandOnly && !isLoading && (
          <View className="secondary_replies_toggle" onClick={handleExpand}>
            <Text className="secondary_replies_toggle_text">展开回复</Text>
          </View>
        )}

        {expanded && isLoading && (
          <View className="secondary_replies_loading">
            <Loading isCenter={false} size={32} type="circular" />
          </View>
        )}

        {showReplies && !isLoading && (
          <View className="secondary_replies_expanded_footer">
            {subHasMore && (
              <View className="secondary_replies_more" onClick={handleLoadMore}>
                <Text className="secondary_replies_more_text">展开更多回复</Text>
              </View>
            )}
            <View className="secondary_replies_collapse" onClick={handleCollapse}>
              <Text className="secondary_replies_collapse_text">收起</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReplySection;
