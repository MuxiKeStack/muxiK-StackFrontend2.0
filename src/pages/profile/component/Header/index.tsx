/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Progress, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { AtIcon } from 'taro-ui';

import { get } from '@/common/api/get';
import { TitleButton } from '@/common/components';
import './index.scss';

const Header: React.FC = memo(() => {
  const [user, setUser] = useState<{
    level: number;
    points: number;
    nextLevel: number;
    avatarUrl: string;
    nickName: string;
    selectedTitle: string;
    newUser: boolean;
  }>({
    level: 1,
    points: 0,
    nextLevel: 0,
    avatarUrl: '',
    nickName: '昵称昵称昵称',
    selectedTitle: 'None',
    newUser: false,
  });

  const translateTitle = useMemo(() => {
    const titleMap = {
      CaringSenior: '知心学长',
      KeStackPartner: '课栈合伙人',
      CCNUWithMe: '华师有我',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (title: string) => titleMap[title] || title;
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const responseLevel: ResponseLevel = await get('/points/users/mine');
        const responseUser: ResponseUser = await get('/users/profile');
        setUser({
          level: responseLevel.data.level,
          points: responseLevel.data.points,
          nextLevel: responseLevel.data.next_level_points,
          avatarUrl: responseUser.data.avatar,
          nickName: responseUser.data.nickname,
          selectedTitle: responseUser.data.using_title
            ? translateTitle(responseUser.data.using_title)
            : 'None',
          newUser: responseUser.data.new,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchUserData();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('user updated:', user);
  }, [user]);

  if (user.newUser) {
    void Taro.navigateTo({ url: '/pages/editUser/index' });
  }

  return (
    <View className="profile_header">
      <View
        className="profile_header_container"
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/editUser/index' });
        }}
      >
        <View className="profile_header_avatar_wrapper">
          <Image
            src={user.avatarUrl !== null ? user.avatarUrl : ''}
            className="profile_header_avatar"
          />
        </View>
        <View className="profile_header_info">
          <View className="profile_header_name_section">
            <Text className="profile_header_nickname">{user.nickName}</Text>
            {user.selectedTitle !== 'None' && (
              <TitleButton title={user.selectedTitle} isSelected></TitleButton>
            )}
            <AtIcon value="chevron-right" />
          </View>
          <Text className="profile_header_points_text">
            {user.points}/{user.nextLevel}
          </Text>
          <View className="profile_header_progress_section">
            <Text className="profile_header_exp_text">Exp{user.level}&nbsp;&nbsp;</Text>
            <Progress
              percent={(user.points / user.nextLevel) * 100}
              color="orange"
              strokeWidth={6}
              borderRadius={100}
              className="profile_header_progress"
            />
          </View>
        </View>
      </View>
    </View>
  );
});

export default Header;
