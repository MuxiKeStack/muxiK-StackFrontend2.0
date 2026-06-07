import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback } from 'react';

import './index.scss';

import { Avatar } from '@/common/components';
import { MessageItemProps } from '@/pages/notification/type';
import { getNotificationUrl } from '@/pages/notification/utils';

const MessageItem: React.FC<MessageItemProps> = memo(
  ({
    title,
    timeStamp,
    userName,
    avatar,
    type,
    description,
    originalComment,
    reply,
    images,
    biz,
    bizId,
  }) => {
    const truncateText = (text: string | undefined, maxLength: number): string => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    const handleClick = useCallback(() => {
      const url = getNotificationUrl({ type, biz, bizId } as MessageItemProps);
      if (url) void Taro.navigateTo({ url });
    }, [type, biz, bizId]);

    return (
      <View className="message_container" onClick={handleClick}>
        <View className="message_header">
          <Text className="message_title">{truncateText(title, 24)}</Text>
          <Text className="message_time">{timeStamp}</Text>
        </View>

        <View className="message_body">
          {avatar && (
            <Avatar src={avatar} username={userName} size={72} className="notif_avatar" />
          )}
          <View className="message_content_wrapper">
            <View className="message_word_cotainer">
              <View className="message_user_info">
                <Text
                  className={`message_user_name ${type === 'official' ? 'official_user' : ''}`}
                >
                  {userName}
                </Text>
              </View>

              {type !== 'official' && (
                <View className="message_action_wrapper">
                  <Text className="message_action_text">
                    {type === 'support' && '赞了你的评论'}
                    {type === 'comment' && `回复: ${truncateText(reply || '', 24)}`}
                  </Text>
                </View>
              )}

              <View className="message_content">
                {originalComment || description ? (
                  <>
                    {originalComment && (
                      <Text className="message_content_text">
                        {truncateText(originalComment, 30)}
                      </Text>
                    )}
                    {description && (
                      <Text className="message_content_text">
                        {truncateText(description, 30)}
                      </Text>
                    )}
                  </>
                ) : (
                  type !== 'official' && (
                    <Text className="message_content_text message_content_empty">无</Text>
                  )
                )}
              </View>
            </View>
            {images && images.length > 0 && (
              <View className="message_image_container">
                <Image src={images[0]} className="message_image" />
              </View>
            )}
          </View>
        </View>
        {reply && (
          <View className="message_footer">
            <View className="message_reply_container">
              <Text className="message_reply_text">回复TA：</Text>
            </View>
          </View>
        )}
      </View>
    );
  }
);

export const renderMessageItem: React.FC<{
  id: string;
  index: number;
  data: MessageItemProps[];
}> = ({ id, index, data }) => {
  const message = data[index];
  return <MessageItem key={id} {...message} />;
};
