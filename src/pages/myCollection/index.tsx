/* eslint-disable no-console */
/* eslint-disable import/first */
import { Input, View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

// eslint-disable-next-line import/first
import CollectionCourse from '@/components/CollectionCourse/CollectionCourse';

// eslint-disable-next-line import/first
import { get } from '@/api/get';

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

const MyCollection: React.FC = () => {
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
        console.log(response);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        setCollection(response.data);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchCollection();
  }, []);

  return (
    <View className="MyCollection">
      <View className="mycollection_searchbar">
        <Input className="mycollection_search_input" placeholder="搜索课程名/老师名" />
        <AtIcon
          className="mycollection_search_button"
          value="search"
          color="#3A3A3A"
          onClick={() => {
            //
          }}
        />
      </View>
      <View className="mycollection_text">我的收藏 ({collection.length})</View>
      <View className="mycollection_collections">
        {collection.map((course) => (
          <CollectionCourse
            key={course.id}
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

export default MyCollection;
