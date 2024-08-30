/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/first */
import { Image, Progress, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AtList, AtListItem } from 'taro-ui';

import './index.scss';

import { get } from '@/common/api/get';
import {
  BookIcon,
  ClockIcon,
  MailIcon,
  StarIcon,
  TopBackground,
} from '@/common/assets/img/personalPage';
import TitleButton from '@/common/components/titleButton/titleButton';
import uniqueKeyUtil from '@/common/utils/keyGen';

export interface UserInfo {
  avatarUrl: string; // 用户头像的URL
  nickName: string; // 用户昵称
}
type PersonalPageProps = object;
export interface ResponseLevel {
  code?: number;
  data: WebPointInfoVo;
  msg?: string;
}
export interface WebPointInfoVo {
  level: number;
  next_level_points: number;
  points: number;
}
export interface ResponseUser {
  code?: number;
  data: WebUserProfileVo;
  msg?: string;
}
export interface WebUserProfileVo {
  avatar: string;
  ctime: number;
  grade_sharing_is_signed?: boolean;
  id: number;
  /**
   * 是否为新用户，新用户尚未编辑过个人信息
   */
  new: boolean;
  nickname: string;
  studentId: string;
  title_ownership: { [key: string]: boolean };
  using_title: string;
  utime?: number;
}

const ListItems: { title: string; icon: string; url: string }[] = [
  { title: '我的课程', icon: BookIcon, url: '/pages/myclass/myclass' },
  { title: '我的收藏', icon: StarIcon, url: '/pages/myCollection/index' },
  {
    title: '评课历史',
    icon: ClockIcon,
    url: '/subpackages/profile/pages/history/index',
  },
  { title: '意见反馈', icon: MailIcon, url: '/pages/feedback/index' },
];

const Page: React.FC<PersonalPageProps> = memo(() => (
  <View className="PersonalPage">
    <Head />
    <List />
  </View>
));

const Head: React.FC = memo(() => {
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
      <Image src={TopBackground} className="personalPage_top_background"></Image>
      <View className="personalPage_user_container">
        <View className="personalPage_user_photo">
          <Image src={user.avatarUrl} className="personalPage_user_photo" />
        </View>
        <View className="personalPage_user_container1">
          <View className="personalPage_user_details">
            <View className="personalPage_username">{user.nickName}</View>
            <View className="personalPage_username_title">
              {user.selectedTitle !== 'None' && (
                <TitleButton title={user.selectedTitle}></TitleButton>
              )}
            </View>
            <View
              className="personalPage_icon"
              onClick={() => {
                void Taro.navigateTo({ url: '/pages/editUser/index' });
              }}
            >
              &gt;
            </View>
          </View>
          {/* 经验 */}
          <View className="personalPage_exp_value">
            {user.points}/{user.nextLevel}
          </View>
          <View className="personalPage_progress_line">
            <View className="personalPage_exp_text">Exp{user.level}&nbsp;&nbsp;</View>
            <Progress
              percent={(user.points / user.nextLevel) * 100}
              color="orange"
              strokeWidth={6}
              borderRadius={100}
              className="personalPage_progress"
            ></Progress>
          </View>
        </View>
      </View>
    </>
  );
});

const List: React.FC = memo(() => {
  const navigate = useCallback((url: string) => void Taro.navigateTo({ url }), []);

  return (
    <AtList className="personalPage_list">
      {ListItems.map((item) => (
        <AtListItem
          key={uniqueKeyUtil.nextKey()}
          title={item.title}
          arrow="right"
          thumb={item.icon}
          onClick={() => navigate(item.url)}
        />
      ))}
    </AtList>
  );
});

export default Page;
