import { Text, View } from '@tarojs/components';
import React, { useEffect } from 'react';

import './index.scss';

import { useUserStore } from '@/store/user';

import { Avatar } from '@/common/components';
import { formatDate } from '@/common/utils';

interface IPublishHeaderProps {
  publisher?: {
    avatar?: string;
    nickname?: string;
  };
  timestamp?: number;
}

const PublishHeader: React.FC<IPublishHeaderProps> = ({ publisher, timestamp }) => {
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (!publisher && !profile) {
      useUserStore
        .getState()
        .ensureProfile()
        .catch(() => {});
    }
  }, [publisher, profile]);

  const resolved = publisher || profile;
  const avatarUrl = resolved?.avatar ?? '';
  const nickName = resolved?.nickname ?? '匿名用户';
  const date = timestamp ? formatDate(timestamp) : '';

  return (
    <View className="publish-header">
      <Avatar src={avatarUrl} username={nickName} size={90.58} className="ph_avatar" />
      <View className="nameDate">
        <Text className="nickname">{nickName}</Text>
        <View className="currentDate">{date}</View>
      </View>
    </View>
  );
};

export default PublishHeader;
