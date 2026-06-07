import { View } from '@tarojs/components';
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';

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
  ) => Promise<void>;
  onCommentClick?: (comment: DiscussionComment) => void;
  onCommentLongPress?: (comment: DiscussionComment) => void;
  supportsReplies?: (item: DiscussionComment) => boolean;
  getReplyIndicator?: (reply: DiscussionComment) => { show: boolean; nickname?: string };
  expandedReplyRootIds?: readonly number[];
  onReplyExpandedChange?: (rootId: number, expanded: boolean) => void;
}

type IsReplyExpandedFn = (rootId: number) => boolean;

const ReplyExpandedContext = createContext<IsReplyExpandedFn>(() => false);

interface DiscussionRowProps {
  item: DiscussionComment;
  showReplies: boolean;
  onCommentClick?: (comment: DiscussionComment) => void;
  onCommentLongPress?: (comment: DiscussionComment) => void;
  onLoadMoreReplies?: (
    rootId: number,
    lastId: number,
    limit: number
  ) => Promise<void>;
  onReplyExpandedChange?: (rootId: number, expanded: boolean) => void;
  getReplyIndicator?: (reply: DiscussionComment) => { show: boolean; nickname?: string };
}

const DiscussionRow = memo(function DiscussionRow({
  item,
  showReplies,
  onCommentClick,
  onCommentLongPress,
  onLoadMoreReplies,
  onReplyExpandedChange,
  getReplyIndicator,
}: DiscussionRowProps) {
  const isReplyExpanded = useContext(ReplyExpandedContext);
  const expanded = isReplyExpanded(item.id);

  return (
    <View className="review_comment_card">
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
          replies={item.replies}
          expanded={expanded}
          onExpandedChange={(open) => onReplyExpandedChange?.(item.id, open)}
          onLoadReplies={onLoadMoreReplies}
          onCommentClick={onCommentClick}
          onCommentLongPress={onCommentLongPress}
          getReplyIndicator={getReplyIndicator}
        />
      )}
    </View>
  );
});

const ReviewDiscussion: React.FC<ReviewDiscussionProps> = memo(({
  comments,
  hasMore = false,
  initialLoading = false,
  onLoadMore,
  onLoadMoreReplies,
  onCommentClick,
  onCommentLongPress,
  supportsReplies,
  getReplyIndicator,
  expandedReplyRootIds,
  onReplyExpandedChange,
}) => {
  const isReplyExpanded = useMemo<IsReplyExpandedFn>(() => {
    if (!expandedReplyRootIds?.length) return () => false;
    const ids = expandedReplyRootIds;
    return (rootId: number) => ids.includes(rootId);
  }, [expandedReplyRootIds]);

  const handlersRef = useRef({
    onCommentClick,
    onCommentLongPress,
    supportsReplies,
    getReplyIndicator,
    onLoadMoreReplies,
    onReplyExpandedChange,
  });
  handlersRef.current = {
    onCommentClick,
    onCommentLongPress,
    supportsReplies,
    getReplyIndicator,
    onLoadMoreReplies,
    onReplyExpandedChange,
  };

  const Row = useMemo(
    () =>
      ({ data, index }: { id: number; data: DiscussionComment[]; index: number }) => {
        const item = data[index];
        if (!item) return null;

        const {
          onCommentClick: onClick,
          onCommentLongPress: onLongPress,
          supportsReplies: supports,
          getReplyIndicator: getIndicator,
          onLoadMoreReplies: loadReplies,
          onReplyExpandedChange: onExpandedChange,
        } = handlersRef.current;

        const showReplies = supports?.(item) ?? false;

        return (
          <DiscussionRow
            key={item.id}
            item={item}
            showReplies={showReplies}
            onCommentClick={onClick}
            onCommentLongPress={onLongPress}
            onLoadMoreReplies={loadReplies}
            onReplyExpandedChange={onExpandedChange}
            getReplyIndicator={getIndicator}
          />
        );
      },
    []
  );

  const getItemKey = useCallback((item: DiscussionComment) => item.id, []);

  return (
    <ReplyExpandedContext.Provider value={isReplyExpanded}>
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
    </ReplyExpandedContext.Provider>
  );
});

ReviewDiscussion.displayName = 'ReviewDiscussion';

export default ReviewDiscussion;
