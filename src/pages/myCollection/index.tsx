/* eslint-disable no-console */
/* eslint-disable import/first */
import { Input, Text, View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { AtIcon } from 'taro-ui';

import { NavigationBar } from '@/modules/navigation';

import './style.scss';

import { get } from '@/common/api/get';
import CollectionCourse from '@/common/components/CollectionCourse/CollectionCourse';

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

const Page: React.FC = () => {
  const [collection, setCollection] = useState<CollectionProps[]>([]);

  useLoad(() => {
    console.log('Page loaded.');
  });

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const url = '/courses/collections/list/mine?cur_collection_id=0&limit=10';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response = await get(url);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        setCollection(response.data);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchCollection();
  }, []);

  return (
    <View className="MyCollection mt-24">
      <NavigationBar title="我的收藏" isBackToPage />
      <View className="mycollection_searchbar flex w-full items-center justify-around">
        <View className="h-full w-[78vw]">
          <Input
            className="mycollection_search_input h-full rounded-3xl bg-[#FFFAEC]"
            placeholder="搜索课程名/老师名"
          />
          <AtIcon
            className="mycollection_search_button"
            value="search"
            color="#8C8C8C"
            onClick={() => {
              //
            }}
          />
        </View>
        <Text className="h-full text-base text-[#8C8C8C]" style={{ lineHeight: '72rpx' }}>
          搜索
        </Text>
      </View>
      <View className="mycollection_text">我的收藏 ({collection.length})</View>
      <View className="mycollection_collections">
        {collection.map((course) => (
          <CollectionCourse
            key={course.id}
            courseId={course.course_id}
            courseType={course.type}
            courseName={course.name || ''}
            courseRate={course.composite_score || 0}
            courseTeacher={course.teacher || '未知'}
            isCollected={course.is_collected ?? false}
          />
        ))}
      </View>
    </View>
  );
};

export default Page;
