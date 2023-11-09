import { useState } from "react";
import { View, Input } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { AtIcon } from "taro-ui";

import "./index.scss";

type MyCollectionProps = object;

const MyCollection: React.FC<MyCollectionProps> = () => {
  useLoad(() => {
    console.log("Page loaded.");
  });

  const [collections, setCollections] = useState(5);

  return (
    <View className="MyCollection">
      <View className="mycollection_searchbar">
        <Input
          className="mycollection_search_input"
          placeholder="搜索课程名/老师名"
        />
        <AtIcon
          className="mycollection_search_button"
          value="search"
          color="#3A3A3A"
          onClick={() => {}}
        ></AtIcon>
      </View>
      <View className="mycollection_text">我的收藏 ({collections})</View>
      <View></View>
    </View>
  );
};

export default MyCollection;
