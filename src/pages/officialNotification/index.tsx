import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

type OfficialNotificationProps = object;

const OfficialNotification: React.FC<OfficialNotificationProps> = () => {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="OfficialNotification">OfficialNotification</View>;
};

export default OfficialNotification;
