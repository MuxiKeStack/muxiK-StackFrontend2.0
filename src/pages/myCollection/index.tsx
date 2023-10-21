import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

import "./index.scss";

export default function MyCollection() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return <View className="MyCollection">MyCollection</View>;
}
