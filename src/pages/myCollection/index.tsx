/* eslint-disable no-console */
import CourseLabel from '@/common/components/CourseLabel';
import { Text, View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { mockCollectionData } from './mock';
import './style.scss';

import { SearchInput } from '@/common/components';
import { NavigationBar } from '@/modules/navigation';

interface CollectionProps {
  id: number;
  name: string;
  teacher: string;
  composite_score: number;
  courseType: string;
  features?: string[];
  is_collected?: boolean;
}

const Page: React.FC = () => {
  const [collection, setCollection] = useState<CollectionProps[]>([]);

  useLoad(() => {
    console.log('Page loaded.');
  });

  useEffect(() => {
    setCollection(mockCollectionData);
  }, []);

  const handleSearch = (value: string) => {
    console.log('搜索:', value);
  };

  const handleSearchToggle = () => {};

  return (
    <View className="MyCollection">
      <NavigationBar title="我的收藏" isBackToPage />
      <View className="mycollection_searchbar">
        <SearchInput
          style={{ height: '30rpx' }}
          onSearch={handleSearch}
          onSearchToggle={handleSearchToggle}
          searchPlaceholder="搜索课程名/老师名"
          searchPlaceholderStyle="color:#9F9F9C"
          searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
          suffix={{
            text: '搜索',
          }}
        />
      </View>
      <View className="mycollection_info_container">
        <Text className="mycollection_info_text">我的收藏 ({collection.length})</Text>
      </View>
      <View className="mycollection_collections">
        {collection.map((course) => (
          <CourseLabel
            key={course.id}
            id={course.id}
            name={course.name}
            teacher={course.teacher}
            composite_score={course.composite_score}
            features={course.features}
            courseType={course.courseType}
          />
        ))}
      </View>
    </View>
  );
};

export default Page;
