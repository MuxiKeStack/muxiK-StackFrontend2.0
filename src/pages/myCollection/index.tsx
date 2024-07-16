import React, {useEffect, useState} from "react";
import { View, Input } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { AtIcon } from "taro-ui";

import "./index.scss";
//import { CollectionCourse, GuildLine } from "@/components";
import {get} from "@/api/get";

type MyCollectionProps = object;

interface CollectionProps {
  composite_score?: number;
  course_id?: number;
  credit?: number;
  id?: number;
  is_collected?: boolean;
  name?: string;
  school?: string;
  teacher?: string;
  type?: string;
}

const MyCollection: React.FC<MyCollectionProps> = () => {
  useLoad(() => {
    console.log("Page loaded.");
  });

  const [Collection, setCollection] = useState<CollectionProps[]>([])
  useEffect(() => {
    const getCollection=async () => {
      const url = "/courses/collections/list/mine?cur_collection_id=0&limit=10"
      const response =await get(url)
      const collection =  response.data
      setCollection(await collection)
      console.log("collection: ", collection)
      // console.log(collection)
    }
    getCollection()
  }, []);
  const [collections, setCollections] = useState(5);
  //const  collections=Collection.length
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
      <View className="mycollection_collections">

      </View>
    </View>
  );
};

export default MyCollection;
