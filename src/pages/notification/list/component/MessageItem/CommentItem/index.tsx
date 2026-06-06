import { Avatar } from '@/common/components';
import { formatDate } from '@/common/utils';
import { CommentMessageProps } from '@/pages/notification/type';
import { getNotificationUrl } from '@/pages/notification/utils';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback } from 'react';
import './index.scss';

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
    const url = getNotificationUrl({ type: 'comment', biz, bizId });
    if (url) void Taro.navigateTo({ url });
  }, [biz, bizId]);

    return (
      <View className="message_comment_container" onClick={handleClick}>
        <View className="comment_header">
          <View className="comment_header_left">
            <Text className="comment_course_name">{title}</Text>
            <Text className="comment_teacher_name">{teacher}</Text>
          </View>
          <Text className="comment_header_time">{displayTime}</Text>
        </View>

        <View className="comment_body">
          {avatar && (
            <Avatar src={avatar} username={userName} size={72} className="notif_avatar" />
          )}
          <View className="comment_content_wrapper">
            <View className="comment_word_container">
              <View className="comment_user_info">
                <Text className="comment_user_name">{userName}</Text>
              </View>

              <View className="comment_action_wrapper">
                <Text className="comment_action_text">回复：{reply || ''}</Text>
              </View>

              <View
                className={`comment_original ${!originalComment ? 'comment_original_empty' : ''}`}
              >
                <Text className="comment_original_text">{originalComment || '无'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="comment_footer">
          <Text className="comment_footer_text">回复TA:)</Text>
        </View>
      </View>
    );
  };
