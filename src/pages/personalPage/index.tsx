import { Image, Progress, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { AtList, AtListItem } from 'taro-ui';

import './index.scss';

// eslint-disable-next-line import/first
import { GuildLine } from '@/components';

import {
  BookIcon,
  ClockIcon,
  MailIcon,
  MessageIcon,
  StarIcon,
  TopBackground,
} from '@/img/personalPage';
// eslint-disable-next-line import/first
import { get } from '@/api/get';

type PersonalPageProps = object;
export interface Response {
  code?: number;
  data: WebPointInfoVo;
  msg?: string;
}
export interface WebPointInfoVo {
  level: number;
  next_level_points: number;
  points: number;
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
  useEffect(() => {
    const fetchExp = async () => {
      try {
        const url = '/points/users/mine';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: Response = await get(url);
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
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image src={TopBackground} className="personalPage_top_background"></Image>
      <View className="personalPage_user_container">
        {/* 用户头像 */}
        <View className="personalPage_user_photo"></View>
        <View className="personalPage_user_details">
          {/* 用户名 */}
          <View className="personalPage_username">昵称</View>
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
