import { Text, View } from '@tarojs/components';
import { useCallback } from 'react';

import './index.scss';

import { Avatar, EllipsisText } from '@/common/components';
import { SupportMessageProps } from '@/pages/notification/type';
import { openNotificationTarget } from '../../../../load';

export const SupportMessageItem: React.FC<SupportMessageProps> = ({
  timeStamp,
  userName,
  avatar,
  originalComment,
  biz,
  bizId,
}) => {
  const handleClick = useCallback(() => {
    openNotificationTarget({ type: 'support', biz, bizId });
  }, [biz, bizId]);

  return (
    <View className="message_support_container" onClick={handleClick}>
      <View className="header">
        <Text className="header_time">{timeStamp}</Text>
      </View>

      <View className="body">
        {avatar && (
          <Avatar src={avatar} username={userName} size={72} className="notif_avatar" />
        )}
        <View className="content_wrapper">
          <View className="word_cotainer">
            <View className="user_info">
              <EllipsisText className="user_name">{userName}</EllipsisText>
            </View>

            <View className="action_wrapper">
              <Text className="action_text">赞了你</Text>
            </View>

            <View className="content">
              <EllipsisText className="content_text" lines={2}>
                {originalComment}
              </EllipsisText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
