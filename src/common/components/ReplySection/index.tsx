import { Text, View } from '@tarojs/components';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './index.scss';

import { CommentCard, Loading } from '@/common/components';

interface ReplySectionProps {
  rootId: number;
  replyCount: number;
  preloadedReplies?: any[];
  autoExpand?: boolean;
  onLoadReplies: (rootId: number, lastId: number, limit: number) => Promise<any[]>;
  onCommentClick?: (comment: any) => void;
  onCommentLongPress?: (comment: any) => void;
  getReplyIndicator?: (reply: any) => { show: boolean; nickname?: string };
}

const ReplySection: React.FC<ReplySectionProps> = ({
  rootId,
  replyCount,
  preloadedReplies = [],
  autoExpand = false,
  onLoadReplies,
  onCommentClick,
  onCommentLongPress,
  getReplyIndicator,
}) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mergedReplies = useMemo(() => {
    const existingIds = new Set(replies.map((r: any) => r.id));
    const newFromParent = preloadedReplies.filter((r: any) => !existingIds.has(r.id));
    const merged = [...newFromParent, ...replies];
    const seen = new Set<number>();
    return merged.filter((r: any) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [replies, preloadedReplies]);

  const prevAutoExpandRef = useRef(autoExpand);
  useEffect(() => {
    if (autoExpand && autoExpand !== prevAutoExpandRef.current) {
      prevAutoExpandRef.current = autoExpand;
      setIsExpanded(true);
      if (preloadedReplies.length === 0 && mergedReplies.length === 0) {
        setIsLoading(true);
        onLoadReplies(rootId, 0, 3)
          .then((data) => {
            if (Array.isArray(data)) setReplies(data);
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [autoExpand, rootId, onLoadReplies, mergedReplies.length, preloadedReplies.length]);

  const handleExpand = useCallback(async () => {
    setIsExpanded(true);
    setIsLoading(true);
    try {
      const data = await onLoadReplies(rootId, 0, 3);
      if (Array.isArray(data)) setReplies(data);
    } finally {
      setIsLoading(false);
    }
  }, [rootId, onLoadReplies]);

  const handleLoadMore = useCallback(async () => {
    const lastId = mergedReplies[mergedReplies.length - 1]?.id || 0;
    setIsLoading(true);
    try {
      const data = await onLoadReplies(rootId, lastId, 10);
      if (Array.isArray(data)) setReplies((prev) => [...prev, ...data]);
    } finally {
      setIsLoading(false);
    }
  }, [rootId, onLoadReplies, mergedReplies]);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const repliesLoaded = replies.length > 0;
  const showReplies = repliesLoaded && isExpanded;
  const showExpandOnly = (!repliesLoaded || !isExpanded) && replyCount > 0;
  const subHasMore = replyCount > replies.length;
  const remainingCount = replyCount - replies.length;

  if (replyCount === 0) return null;

  return (
    <View className="secondary_replies_container">
      {showReplies && (
        <View className="secondary_replies_list">
          {mergedReplies.map((reply: any) => {
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

        {isLoading && <Loading isCenter={false} size={32} type="circular" />}

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
