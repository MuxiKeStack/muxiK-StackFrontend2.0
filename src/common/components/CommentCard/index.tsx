import { Text, View } from '@tarojs/components';
import React, { memo } from 'react';

import './index.scss';

import { UserIdentity } from '@/common/components';
import type { DiscussionComment } from '@/common/types/commentTypes';
import { formatDate } from '@/common/utils';

interface CommentCardProps {
  comment: DiscussionComment;
  level?: 'primary' | 'secondary';
  onClick?: (comment: DiscussionComment) => void;
  onLongPress?: (comment: DiscussionComment) => void;
  showReplyIndicator?: boolean;
  replyToNickname?: string;
  showBorder?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = memo(({
  comment,
  level = 'primary',
  onClick,
  onLongPress,
  showReplyIndicator = false,
  replyToNickname,
  showBorder = true,
}) => {
  const userInfo = comment.user || comment.publisher;

  return (
    <View
      className={`comment_card ${level === 'secondary' ? 'comment_card_secondary' : ''} ${showBorder ? '' : 'no_border'}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(comment);
      }}
      onLongPress={(e) => {
        e.stopPropagation();
        onLongPress?.(comment);
      }}
    >
      <View className="comment_card_header">
        <View className="comment_card_header_left">
          <UserIdentity
            avatar={userInfo?.avatar ?? ''}
            username={userInfo?.nickname ?? '匿名用户'}
            level={userInfo?.level}
            title={userInfo?.using_title}
            avatarSize={65}
            avatarClassName="cc_avatar"
            className="comment_card_identity"
          />
        </View>
        <View className="comment_card_header_right">
          <View className="comment_card_header_time">
            {formatDate(new Date(comment.ctime).toISOString(), 'yyyy.MM.dd. hh:mm')}
          </View>
        </View>
      </View>

      <View className="comment_card_content">
        <Text>
          {showReplyIndicator && replyToNickname && (
            <Text className="comment_card_content_reply_indicator">
              @{replyToNickname}:
            </Text>
          )}
          {comment.content}
        </Text>
      </View>
    </View>
  );
});

export default CommentCard;
