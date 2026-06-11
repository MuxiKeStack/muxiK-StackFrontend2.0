import { Progress, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import { useUserStore } from '@/store/user';

import { Avatar, TitleButton } from '@/common/components';
import { ROUTES } from '@/common/constants/routes';

const TITLE_MAP: Record<string, string> = {
  CaringSenior: '知心学长',
  KeStackPartner: '课栈合伙人',
  CCNUWithMe: '华师有我',
};

const Header: React.FC = memo(() => {
  const [user, setUser] = useState({
    level: 1,
    points: 0,
    nextLevel: 0,
    avatarUrl: '',
    nickName: '昵称昵称昵称',
    selectedTitle: 'None',
    newUser: false,
  });

  const translateTitle = useMemo(() => (title: string) => TITLE_MAP[title] || title, []);
  const navigatedRef = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const store = useUserStore.getState();
        const [profile, points] = await Promise.all([
          store.ensureProfile(),
          store.ensurePoints(),
        ]);

        if (!profile && !points) {
          setUser({
            level: 1,
            points: 0,
            nextLevel: 0,
            avatarUrl: '',
            nickName: '未登录',
            selectedTitle: 'None',
            newUser: false,
          });
          return;
        }

        setUser((prev) => ({
          level: points?.level ?? prev.level,
          points: points?.points ?? prev.points,
          nextLevel: points?.next_level_points ?? prev.nextLevel,
          avatarUrl: profile?.avatar ?? prev.avatarUrl,
          nickName: profile?.nickname ?? prev.nickName,
          selectedTitle: profile?.using_title
            ? translateTitle(profile.using_title)
            : 'None',
          newUser: profile?.new ?? prev.newUser,
        }));
      } catch (e) {
        console.error('获取用户信息失败:', e);
      }
    };
    void fetchUserData();
  }, [translateTitle]);

  useEffect(() => {
    if (user.newUser && !navigatedRef.current) {
      navigatedRef.current = true;
      void Taro.navigateTo({ url: ROUTES.profile.editUser });
    }
  }, [user.newUser]);

  return (
    <View className="profile_header">
      <View
        className="profile_header_container"
        onClick={() => {
          void Taro.navigateTo({ url: ROUTES.profile.editUser });
        }}
      >
        <Avatar src={user.avatarUrl || ''} username={user.nickName} size="20vw" />
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
              percent={user.nextLevel > 0 ? (user.points / user.nextLevel) * 100 : 0}
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
