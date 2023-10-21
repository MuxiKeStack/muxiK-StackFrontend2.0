import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

export default function MessageNotification() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="MessageNotification">MessageNotification</View>;
}
