import { UserIdentity } from '@/common/components';
import { formatDate } from '@/common/utils';
import { Text, View } from '@tarojs/components';
import React from 'react';
import './index.scss';

interface CommentCardUserInfo {
  id: number;
  avatar: string;
  nickname: string;
  using_title?: string;
  level?: number;
}

interface CommentCardComment {
  id: number;
  content: string;
  ctime: number;
  user?: CommentCardUserInfo;
  publisher?: CommentCardUserInfo;
  root_comment_id?: number;
  parent_comment_id?: number;
  reply_to_uid?: number;
}

interface CommentCardProps {
  comment: CommentCardComment;
  level?: 'primary' | 'secondary';
  onClick?: (comment: any) => void;
  onLongPress?: (comment: any) => void;
  showReplyIndicator?: boolean;
  replyToNickname?: string;
  showBorder?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
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
};

export default CommentCard;
