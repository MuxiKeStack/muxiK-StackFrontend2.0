import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { AtIcon } from "taro-ui";

import "./index.scss";

type GuildLineProps = object;

const GuildLine: React.FC<GuildLineProps> = () => {
  return (
    <View className="guild_line">
      <AtIcon
        value="clock"
        size="35"
        color="#FFD777"
        onClick={() => {
          Taro.navigateTo({ url: "/pages/main/index" });
        }}
      ></AtIcon>
      <View className="add_button">
        <View className="add_sign">+</View>
      </View>
      <AtIcon
        value="user"
        size="35"
        color="#FFD777"
        onClick={() => {
          Taro.navigateTo({ url: "/pages/personalPage/index" });
        }}
      ></AtIcon>
    </View>
  );
};

export default GuildLine;
