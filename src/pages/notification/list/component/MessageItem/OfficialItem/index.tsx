import { OfficialMessageProps } from '@/pages/notification/type';
import { Image, Text, View } from '@tarojs/components';
import { memo } from 'react';
import './index.scss';

// todos: 暂用
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w-400';

export const OfficialMessageItem: React.FC<OfficialMessageProps> = memo(
  ({ title, timeStamp, description, images }) => (
    <View className="message_official_container">
      {timeStamp && (
        <View className="IMtime_container">
          <Text className="IMtime">{timeStamp}</Text>
        </View>
      )}
      <View className="info_container">
        <View className="image_container">
          <Image
            src={images && images[0] ? images[0] : DEFAULT_IMAGE}
            className="image"
          />
        </View>

        <View className="text_container">
          <View className="title_container">
            <Text className="title">{title}</Text>
          </View>
          <View className="content_container">
            <Text className="content">{description}</Text>
          </View>
        </View>
      </View>
    </View>
  )
);
