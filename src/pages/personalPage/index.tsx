import Taro from "@tarojs/taro";
import { View, Image, Progress } from "@tarojs/components";
import { AtList, AtListItem } from "taro-ui";
import { useLoad } from "@tarojs/taro";

import "./index.scss";
import top_background from "@/img/personalPage/top_background.png";
import book_icon from "@/img/personalPage/book_icon.png";
import star_icon from "@/img/personalPage/star_icon.png";
import clock_icon from "@/img/personalPage/clock_icon.png";
import message_icon from "@/img/personalPage/message_icon.png";
import mail_icon from "@/img/personalPage/mail_icon.png";
import GuildLine from "@/components/GuildLine/GuildLine";

export default function PersonalPage() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return (
    <View className="PersonalPage">
      <Head />
      <List />
      <GuildLine />
    </View>
  );
}

const Head = () => {
  return (
    <>
      <Image
        src={top_background}
        className="personalPage_top_background"
      ></Image>
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
        thumb={book_icon}
        onClick={() => {
          Taro.navigateTo({ url: "" });
        }}
      />
      <AtListItem
        title="我的收藏"
        arrow="right"
        thumb={star_icon}
        onClick={() => {
          Taro.navigateTo({ url: "/pages/myCollection/index" });
        }}
      />
      <AtListItem
        title="评课历史"
        arrow="right"
        thumb={clock_icon}
        onClick={() => {
          Taro.navigateTo({ url: "/pages/evaluateCourseHistory/index" });
        }}
      />
      <AtListItem
        title="消息提醒"
        arrow="right"
        thumb={message_icon}
        onClick={() => {
          Taro.navigateTo({ url: "/pages/messageNotification/index" });
        }}
      />
      <AtListItem
        title="意见反馈"
        arrow="right"
        thumb={mail_icon}
        onClick={() => {
          Taro.navigateTo({ url: "/pages/feedback/index" });
        }}
      />
    </AtList>
  );
};
