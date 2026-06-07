import { Text, View } from '@tarojs/components';
import React, { useCallback, useState } from 'react';

import './index.scss';

import { CommentCard, Loading } from '@/common/components';
import type { DiscussionComment } from '@/common/types/commentTypes';

interface ReplySectionProps {
  rootId: number;
  replyCount: number;
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
    const lastServerId =
      [...replies].reverse().find((r) => r.id > 0)?.id ?? 0;
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

  const showReplies = expanded && (replies.length > 0 || isLoading);
  const showExpandOnly = !expanded && replyCount > 0;
  const subHasMore = replyCount > replies.length;
  const remainingCount = replyCount - replies.length;

  if (replyCount === 0) return null;

  return (
    <View className="secondary_replies_container">
      {showReplies && (
        <View className="secondary_replies_list">
          {replies.map((reply) => {
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
            <Text className="secondary_replies_toggle_text">展开{replyCount}条回复</Text>
          </View>
        )}

        {expanded && isLoading && <Loading isCenter={false} size={32} type="circular" />}

        {showReplies && !isLoading && (
          <View className="secondary_replies_expanded_footer">
            {subHasMore && (
              <View className="secondary_replies_more" onClick={handleLoadMore}>
                <Text className="secondary_replies_more_text">
                  展开{remainingCount}条回复
                </Text>
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
