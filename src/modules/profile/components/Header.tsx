/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Progress, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useEffect, useMemo, useState } from 'react';

import { get } from '@/common/api/get';
import { TopBackground } from '@/common/assets/img/personalPage';
import TitleButton from '@/common/components/titleButton/titleButton';
import type { ResponseLevel, ResponseUser } from '@/common/types/userTypes';

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
  }, [translateTitle]);

  if (user.newUser) {
    void Taro.navigateTo({ url: '/pages/editUser/index' });
  }

  return (
    <>
      <Image
        src={TopBackground}
        className="relative top-[-35vh] h-[70vh] w-[115%]"
      ></Image>
      <View className="absolute top-[12vh] flex w-full items-center gap-4 px-[10%]">
        <View className="aspect-square h-[20vw] w-[20vw] rounded-full bg-white">
          <Image
            src={user.avatarUrl}
            className="aspect-square h-[20vw] w-[20vw] rounded-full bg-white"
          />
        </View>
        <View className="flex flex-col gap-2">
          <View className="flex w-2/5 items-center gap-2">
            <Text className="text-md whitespace-nowrap">{user.nickName}</Text>
            {user.selectedTitle !== 'None' && (
              <View className="w-1/5">
                <TitleButton title={user.selectedTitle}></TitleButton>
              </View>
            )}
            <Text
              className="text-md font-bold text-white"
              onClick={() => {
                void Taro.navigateTo({ url: '/pages/editUser/index' });
              }}
            >
              &gt;
            </Text>
          </View>
          <Text className="flex w-full justify-end text-xs font-bold text-orange-400">
            {user.points}/{user.nextLevel}
          </Text>
          <View className="-mt-3 flex items-center gap-1">
            <Text className="text-md flex items-center font-bold text-orange-400">
              Exp{user.level}&nbsp;&nbsp;
            </Text>
            <Progress
              percent={(user.points / user.nextLevel) * 100}
              color="orange"
              strokeWidth={6}
              borderRadius={100}
              className="w-32"
            ></Progress>
          </View>
        </View>
      </View>
    </>
  );
});

export default Header;
