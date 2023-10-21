import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

export default function EvaluateCourseHistory() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="EvaluateCourseHistory">EvaluateCourseHistory</View>;
}
