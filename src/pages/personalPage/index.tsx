/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */
/* eslint-disable import/first */
import { Image, Progress, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { AtList, AtListItem } from 'taro-ui';

import './index.scss';

import { get } from '@/common/api/get';
import {
  BookIcon,
  ClockIcon,
  MailIcon,
  MessageIcon,
  StarIcon,
  TopBackground,
} from '@/common/assets/img/personalPage';
import { GuildLine } from '@/common/components';

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
const PersonalPage: React.FC<PersonalPageProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  return (
    <View className="PersonalPage">
      <Head />
      <List />
      <GuildLine />
    </View>
  );
};

const Head = () => {
  const [level, setLevel] = useState(1);
  const [nextLevel, setNextLevel] = useState(0);
  const [points, setPoints] = useState(0);
  // const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [newUser, setNewUser] = useState(false);
  useEffect(() => {
    const fetchExp = async () => {
      try {
        const url = '/points/users/mine';
        const response: ResponseLevel = await get(url);
        console.log(response);
        setLevel(response.data.level);
        setPoints(response.data.points);
        setNextLevel(response.data.next_level_points);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchExp();
  }, []);
  useEffect(() => {
    const fetchNew = async () => {
      try {
        const url = '/users/profile';
        const response: ResponseUser = await get(url);
        console.log('用户信息');
        console.log(response);
        setNewUser(response.data.new);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchNew();
  }, []);
  if (newUser) {
    void Taro.navigateTo({ url: '/pages/editUser/index' });
  }

  return (
    <>
      {}
      <Image src={TopBackground} className="personalPage_top_background"></Image>
      <View className="personalPage_user_container">
        <View className="personalPage_user_photo">
          {/*  <Image src={userInfo.avatarUrl} className="avatar" />*/}
        </View>
        <View className="personalPage_user_details">
          <View className="personalPage_username">昵称</View>
          <View
            className="personalPage_icon"
            onClick={() => {
              void Taro.navigateTo({ url: '/pages/editUser/index' });
            }}
          >
            &gt;
          </View>
          {/* 经验 */}
          <View className="personalPage_exp_value">
            {points}/{nextLevel}
          </View>
          <View className="personalPage_progress_line">
            <View className="personalPage_exp_text">Exp{level}&nbsp;&nbsp;</View>
            <Progress
              percent={(points / nextLevel) * 100}
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
};

const List = () => {
  return (
    <AtList className="personalPage_list">
      <AtListItem
        title="我的课程"
        arrow="right"
        thumb={BookIcon}
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/myclass/myclass' });
        }}
      />
      <AtListItem
        title="我的收藏"
        arrow="right"
        thumb={StarIcon}
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/myCollection/index' });
        }}
      />
      <AtListItem
        title="评课历史"
        arrow="right"
        thumb={ClockIcon}
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/evaluateCourseHistory/index' });
        }}
      />
      <AtListItem
        title="消息提醒"
        arrow="right"
        thumb={MessageIcon}
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/messageNotification/index' });
        }}
      />
      <AtListItem
        title="官方消息"
        arrow="right"
        thumb={MessageIcon}
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/officialNotification/index' });
        }}
      />
      <AtListItem
        title="意见反馈"
        arrow="right"
        thumb={MailIcon}
        onClick={() => {
          void Taro.navigateTo({ url: '/pages/feedback/index' });
        }}
      />
    </AtList>
  );
};

export default PersonalPage;
