import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

type MessageNotificationProps = object;

const MessageNotification: React.FC<MessageNotificationProps> = () => {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="MessageNotification">MessageNotification</View>;
};

export default MessageNotification;
