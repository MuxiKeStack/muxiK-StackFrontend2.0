import { Input, View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { useState } from 'react';
import { AtIcon } from 'taro-ui';

import { CollectionCourse } from '@/components';
import './index.scss';

type MyCollectionProps = object;

const MyCollection: React.FC<MyCollectionProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  const [collections, setCollections] = useState(5);

  return (
    <View className="MyCollection">
      <View className="mycollection_searchbar">
        <Input className="mycollection_search_input" placeholder="搜索课程名/老师名" />
        <AtIcon
          className="mycollection_search_button"
          value="search"
          color="#3A3A3A"
          onClick={() => {}}
        ></AtIcon>
      </View>
      <View className="mycollection_text">我的收藏 ({collections})</View>
      <View className="mycollection_collections">
        <CollectionCourse />
        <CollectionCourse />
        <CollectionCourse />
        <CollectionCourse />
        <CollectionCourse />
        <CollectionCourse />
        <CollectionCourse />
        <CollectionCourse />
      </View>
    </View>
  );
};

export default MyCollection;
