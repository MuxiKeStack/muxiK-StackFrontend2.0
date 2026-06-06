import { Avatar } from '@/common/components';
import { SupportMessageProps } from '@/pages/notification/type';
import { getNotificationUrl } from '@/pages/notification/utils';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback } from 'react';
import './index.scss';

export const SupportMessageItem: React.FC<SupportMessageProps> = ({ timeStamp, userName, avatar, originalComment, biz, bizId }) => {
    const handleClick = useCallback(() => {
      const url = getNotificationUrl({ type: 'support', biz, bizId });
      if (url) void Taro.navigateTo({ url });
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
                <Text className="user_name">{userName}</Text>
              </View>

              <View className="action_wrapper">
                <Text className="action_text">赞了你</Text>
              </View>

              <View className="content">
                <Text className="content_text">{originalComment}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
};
