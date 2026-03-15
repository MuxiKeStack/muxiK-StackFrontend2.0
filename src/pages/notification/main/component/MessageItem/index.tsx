import { MessageItemProps } from '@/pages/notification/type';
import { Image, Text, View } from '@tarojs/components';
import { memo } from 'react';
import './index.scss';

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
  }) => {
    const truncateText = (text: string | undefined, maxLength: number): string => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    return (
      <View className="message_container">
        <View className="message_header">
          <Text className="message_title">{truncateText(title, 24)}</Text>
          <Text className="message_time">{timeStamp}</Text>
        </View>

        <View className="message_body">
          {avatar && (
            <View className="message_avatar_wrapper">
              <Image src={avatar} className="message_avatar_image" />
            </View>
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
