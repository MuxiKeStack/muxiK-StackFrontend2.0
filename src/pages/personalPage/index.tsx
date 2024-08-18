import { Image, Progress, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { AtList, AtListItem } from 'taro-ui';

import './index.scss';

import { GuildLine } from '@/components';

import {
  BookIcon,
  ClockIcon,
  MailIcon,
  MessageIcon,
  StarIcon,
  TopBackground,
} from '@/img/personalPage';

type PersonalPageProps = object;

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
  return (
    <>
      <Image src={TopBackground} className="personalPage_top_background"></Image>
      <View className="personalPage_user_container">
        {/* 用户头像 */}
        <View className="personalPage_user_photo"></View>
        <View className="personalPage_user_details">
          {/* 用户名 */}
          <View className="personalPage_username">昵称</View>
          {/* 经验 */}
          <View className="personalPage_exp_value">12/20</View>
          <View className="personalPage_progress_line">
            <View className="personalPage_exp_text">Exp&nbsp;&nbsp;</View>
            <Progress
              percent={75}
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
          Taro.navigateTo({ url: '/pages/myclass/myclass' });
        }}
      />
      <AtListItem
        title="我的收藏"
        arrow="right"
        thumb={StarIcon}
        onClick={() => {
          Taro.navigateTo({ url: '/pages/myCollection/index' });
        }}
      />
      <AtListItem
        title="评课历史"
        arrow="right"
        thumb={ClockIcon}
        onClick={() => {
          Taro.navigateTo({ url: '/pages/evaluateCourseHistory/index' });
        }}
      />
      <AtListItem
        title="消息提醒"
        arrow="right"
        thumb={MessageIcon}
        onClick={() => {
          Taro.navigateTo({ url: '/pages/messageNotification/index' });
        }}
      />
      <AtListItem
        title="官方消息"
        arrow="right"
        thumb={MessageIcon}
        onClick={() => {
          Taro.navigateTo({ url: '/pages/officialNotification/index' });
        }}
      />
      <AtListItem
        title="意见反馈"
        arrow="right"
        thumb={MailIcon}
        onClick={() => {
          Taro.navigateTo({ url: '/pages/feedback/index' });
        }}
      />
    </AtList>
  );
};

export default PersonalPage;
