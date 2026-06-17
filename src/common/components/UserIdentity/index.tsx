import { Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

import { Avatar, EllipsisText } from '@/common/components';

interface UserIdentityProps {
  avatar: string;
  username: string;
  level?: number;
  title?: string;
  avatarSize?: number;
  avatarClassName?: string;
  className?: string;
}

const UserIdentity: React.FC<UserIdentityProps> = ({
  avatar,
  username,
  level = 1,
  title,
  avatarSize = 48,
  avatarClassName,
  className,
}) => (
  <View className={`user_identity ${className || ''}`}>
    <Avatar
      src={avatar || ''}
      username={username}
      size={avatarSize}
      className={avatarClassName}
    />
    <View className="ui_user_meta">
      <EllipsisText className="ui_user_name">
        {username || '匿名用户'}
        {title && title !== 'None' ? ` (${title})` : ''}
      </EllipsisText>
      <Text className="ui_user_level">Lv{level}</Text>
    </View>
  </View>
);

export default UserIdentity;
