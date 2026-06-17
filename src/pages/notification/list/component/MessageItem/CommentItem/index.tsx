import { Text, View } from '@tarojs/components';
import { useCallback } from 'react';

import './index.scss';

import { Avatar, CourseTitleBlock, EllipsisText } from '@/common/components';
import { formatDate } from '@/common/utils';
import { CommentMessageProps } from '@/pages/notification/type';
import { openNotificationTarget } from '../../../../load';

export const CommentMessageItem: React.FC<CommentMessageProps> = ({
  title,
  teacher,
  timeStamp,
  userName,
  avatar,
  reply,
  originalComment,
  ctime,
  biz,
  bizId,
}) => {
  const displayTime = ctime
    ? formatDate(new Date(ctime).toISOString(), 'yyyy.MM.dd hh:mm')
    : timeStamp || '';

  const handleClick = useCallback(() => {
    openNotificationTarget({ type: 'comment', biz, bizId });
  }, [biz, bizId]);

  return (
    <View className="message_comment_container" onClick={handleClick}>
      <CourseTitleBlock
        className="comment_header"
        name={title}
        teacher={teacher}
        trailing={<Text className="comment_header_time">{displayTime}</Text>}
      />

      <View className="comment_body">
        {avatar && (
          <Avatar src={avatar} username={userName} size={72} className="notif_avatar" />
        )}
        <View className="comment_content_wrapper">
          <View className="comment_word_container">
            <View className="comment_user_info">
              <EllipsisText className="comment_user_name">{userName}</EllipsisText>
            </View>

            <View className="comment_action_wrapper">
              <EllipsisText className="comment_action_text" lines={2}>
                回复：{reply || ''}
              </EllipsisText>
            </View>

            <View
              className={`comment_original ${!originalComment ? 'comment_original_empty' : ''}`}
            >
              <EllipsisText className="comment_original_text" lines={2}>
                {originalComment || '无'}
              </EllipsisText>
            </View>
          </View>
        </View>
      </View>

      <View className="comment_footer">
        <Text className="comment_footer_text">回复TA:</Text>
      </View>
    </View>
  );
};
