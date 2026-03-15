import { SupportMessageProps } from '@/pages/notification/type';
import { Image, Text, View } from '@tarojs/components';
import { memo } from 'react';
import './index.scss';

export const SupportMessageItem: React.FC<SupportMessageProps> = memo(
  ({ timeStamp, userName, avatar, originalComment }) => (
    <View className="message_support_container">
      <View className="header">
        <Text className="header_time">{timeStamp}</Text>
      </View>

      <View className="body">
        {avatar && (
          <View className="avatar_wrapper">
            <Image src={avatar} className="avatar_image" />
          </View>
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
  )
);
