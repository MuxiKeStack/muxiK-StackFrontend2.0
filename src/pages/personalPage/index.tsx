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
  StarIcon,
  TopBackground,
} from '@/common/assets/img/personalPage';
import TitleButton from '@/common/components/titleButton/titleButton';

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
    </View>
  );
};

const Head = () => {
  const [level, setLevel] = useState(1);
  const [nextLevel, setNextLevel] = useState(0);
  const [points, setPoints] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickName, setNickName] = useState('昵称昵称昵称');
  const [selectedTitle, setSelectedTitle] = useState<string>('None');
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
        setNickName(response.data.nickname);
        setAvatarUrl(response.data.avatar);
        console.log(response.data.using_title);
        let translatedTitle = '';
        switch (response.data.using_title) {
          case 'CaringSenior':
            translatedTitle = '知心学长';
            setSelectedTitle('知心学长');
            break;
          case 'KeStackPartner':
            translatedTitle = '课栈合伙人';
            setSelectedTitle('课栈合伙人');
            break;
          case 'CCNUWithMe':
            translatedTitle = '华师有我';
            setSelectedTitle('华师有我');
            break;
          default:
            translatedTitle = response.data.using_title;
            break;
        }
        setSelectedTitle(translatedTitle);
        console.log(translatedTitle);
        console.log(selectedTitle);
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
          <Image src={avatarUrl} className="personalPage_user_photo" />
        </View>
        <View className="personalPage_user_container1">
          <View className="personalPage_user_details">
            <View className="personalPage_username">{nickName}</View>
            <View className="personalPage_username_title">
          {selectedTitle !== 'None' && <TitleButton title={selectedTitle}></TitleButton>}
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
