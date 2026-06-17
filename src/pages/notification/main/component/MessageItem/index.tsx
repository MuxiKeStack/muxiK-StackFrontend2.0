import { Image, Text, View } from '@tarojs/components';
import { memo, useCallback } from 'react';

import './index.scss';

import { Avatar, EllipsisText } from '@/common/components';
import { MessageItemProps } from '@/pages/notification/type';
import { openNotificationTarget } from '../../../load';

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
    const handleClick = useCallback(() => {
      openNotificationTarget({ type, biz, bizId } as MessageItemProps);
    }, [type, biz, bizId]);

    return (
      <View className="message_container" onClick={handleClick}>
        <View className="message_header">
          <EllipsisText className="message_title">{title}</EllipsisText>
          <Text className="message_time">{timeStamp}</Text>
        </View>

        <View className="message_body">
          {avatar && (
            <Avatar src={avatar} username={userName} size={72} className="notif_avatar" />
          )}
          <View className="message_content_wrapper">
            <View className="message_word_cotainer">
              <View className="message_user_info">
                <EllipsisText
                  className={`message_user_name ${type === 'official' ? 'official_user' : ''}`}
                >
                  {userName}
                </EllipsisText>
              </View>

              {type !== 'official' && (
                <View className="message_action_wrapper">
                  <EllipsisText className="message_action_text" lines={2}>
                    {type === 'support' && '赞了你的评论'}
                    {type === 'comment' && `回复: ${reply || ''}`}
                  </EllipsisText>
                </View>
              )}

              <View className="message_content">
                {originalComment || description ? (
                  <>
                    {originalComment && (
                      <EllipsisText className="message_content_text" lines={2}>
                        {originalComment}
                      </EllipsisText>
                    )}
                    {description && (
                      <EllipsisText className="message_content_text" lines={2}>
                        {description}
                      </EllipsisText>
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
