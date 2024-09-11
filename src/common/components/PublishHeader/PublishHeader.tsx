import { Image, Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

interface IPublishHeaderProps {
  avatarUrl: string;
  nickName: string;
  date: string;
}

const PublishHeader: React.FC<IPublishHeaderProps> = ({ avatarUrl, nickName, date }) => {
  return (
    <View className="publish-header">
      <Image src={avatarUrl} className="avatar" />
      <View className="nameDate">
        <Text className="nickname">{nickName}</Text>
        <View className="currentDate">{date}</View>
      </View>
    </View>
  );
};

export default PublishHeader;
