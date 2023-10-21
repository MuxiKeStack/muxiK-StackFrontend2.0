import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

export default function OfficialNotification() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="OfficialNotification">OfficialNotification</View>;
}
