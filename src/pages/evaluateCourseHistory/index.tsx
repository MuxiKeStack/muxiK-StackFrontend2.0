import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

type evaluateCourseHistoryProps = object;

const evaluateCourseHistory: React.FC<evaluateCourseHistoryProps> = () => {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="evaluateCourseHistory">evaluateCourseHistory</View>;
};

export default evaluateCourseHistory;
