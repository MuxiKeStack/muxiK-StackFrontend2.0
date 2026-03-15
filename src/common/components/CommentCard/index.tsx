import { formatDate } from '@/common/utils';
import { Image, Text, View } from '@tarojs/components';
import React from 'react';
import './index.scss';

interface CommentCardProps {
  comment: CommentType;
  level?: 'primary' | 'secondary';
  onClick?: (comment: CommentType) => void;
  showReplyIndicator?: boolean;
  replyToNickname?: string;
  showBorder?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  level = 'primary',
  onClick,
  showReplyIndicator = false,
  replyToNickname,
  showBorder = true,
}) => {
  return (
    <View
      className={`comment_card ${level === 'secondary' ? 'comment_card_secondary' : ''} ${showBorder ? '' : 'no_border'}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(comment);
      }}
    >
      <View className="comment_card_header">
        <View className="comment_card_header_left">
          <Image
            src={comment.user?.avatar ?? ''}
            className="comment_card_header_avatar"
          />
          <Text className="comment_card_header_nickname">{comment.user?.nickname}</Text>
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
};

export default CommentCard;
