import { View } from '@tarojs/components';
import React, { useCallback, useMemo } from 'react';

import './index.scss';

import { CommentCard } from '@/common/components';
import ReplySection from '@/common/components/ReplySection';
import type { DiscussionComment } from '@/common/types/commentTypes';
import VirtualList from '../VirtualList';

interface ReviewDiscussionProps {
  comments: DiscussionComment[];
  hasMore?: boolean;
  initialLoading?: boolean;
  onLoadMore?: () => void;
  onLoadMoreReplies?: (
    rootId: number,
    lastId: number,
    limit: number
  ) => Promise<DiscussionComment[]>;
  onCommentClick?: (comment: DiscussionComment) => void;
  onCommentLongPress?: (comment: DiscussionComment) => void;
  supportsReplies?: (item: DiscussionComment) => boolean;
  getReplyIndicator?: (reply: DiscussionComment) => { show: boolean; nickname?: string };
  newReplyRootId?: number;
}

const ReviewDiscussion: React.FC<ReviewDiscussionProps> = ({
  comments,
  hasMore = false,
  initialLoading = false,
  onLoadMore,
  onLoadMoreReplies,
  onCommentClick,
  onCommentLongPress,
  supportsReplies,
  getReplyIndicator,
  newReplyRootId,
}) => {
  const Row = useMemo(
    () =>
      ({ data, index }: { id: number; data: DiscussionComment[]; index: number }) => {
        const item = data[index];
        if (!item) return null;

        const showReplies = supportsReplies?.(item) ?? false;

        return (
          <View className="review_comment_card" key={item.id}>
            <CommentCard
              comment={item}
              level="primary"
              onClick={onCommentClick}
              onLongPress={onCommentLongPress}
              showBorder={false}
            />

            {showReplies && onLoadMoreReplies && (
              <ReplySection
                rootId={item.id}
                replyCount={item.reply_count || 0}
                preloadedReplies={item.replies}
                autoExpand={item.id === newReplyRootId}
                onLoadReplies={onLoadMoreReplies}
                onCommentClick={onCommentClick}
                onCommentLongPress={onCommentLongPress}
                getReplyIndicator={getReplyIndicator}
              />
            )}
          </View>
        );
      },
    [
      onCommentClick,
      onCommentLongPress,
      supportsReplies,
      getReplyIndicator,
      onLoadMoreReplies,
      newReplyRootId,
    ]
  );

  const getItemKey = useCallback((item: DiscussionComment) => item.id, []);

  return (
    <VirtualList
      height="100%"
      width="100%"
      item={Row}
      itemData={comments}
      itemCount={comments.length}
      itemSize={280}
      hasMore={hasMore}
      initialLoading={initialLoading}
      onLoadMore={onLoadMore}
      getItemKey={getItemKey}
      bottomPadding={40}
    />
  );
};

export default ReviewDiscussion;
