import { Text, View } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { useMyCollectionsStore, useResearchStore } from '@/store';

import { SearchInput, VirtualList } from '@/common/components';
import CourseLabel from '@/common/components/CourseLabel';
import { CollectionProps } from '@/common/types/collectionsType';
import { NavigationBar } from '@/modules/navigation';

const Page: React.FC = () => {
  const [currCollections, setCurrCollections] = useState<CollectionProps[]>([]);
  const totalCollections = useMyCollectionsStore((s) => s.collectionsCache);
  const loadCollections = useMyCollectionsStore((s) => s.load);
  const searchCourses = useResearchStore((s) => s.search);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchCollectionList = useCallback(
    async (params: { cur_collection_id: number; limit: number }) => {
      setCollectionLoading(true);
      try {
        await loadCollections(params);
      } catch {
        //
      } finally {
        setCollectionLoading(false);
      }
    },
    [loadCollections]
  );

  const fetchSearchCourses = useCallback(
    (keyword: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const list = await searchCourses(keyword, { search_location: 'Collections' });
          setCurrCollections(
            list.map((c) => ({
              ...c,
              course_id: c.id,
              id: c.id,
            })) as unknown as CollectionProps[]
          );
        } catch {
          //
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [searchCourses]
  );

  useEffect(() => {
    setCurrCollections(totalCollections);
  }, [totalCollections]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  useDidShow(() => {
    void fetchCollectionList({
      cur_collection_id: 0,
      limit: 20,
    });
  });

  const handleisLoading = useCallback(
    (listLoading: boolean, searchLoadingState: boolean) => {
      if (searchLoadingState) return true;
      return listLoading && currCollections.length === 0;
    },
    [currCollections.length]
  );

  const isLoading = handleisLoading(collectionLoading, searchLoading);

  const handleSearch = useCallback(
    (value: string) => {
      fetchSearchCourses(value);
    },
    [fetchSearchCourses]
  );

  const renderCourseItem = ({
    data,
    index,
  }: {
    data: CollectionProps[];
    index: number;
  }) => {
    const course = data[index];
    return <CourseLabel key={course.id} course={{ ...course, id: course.course_id }} />;
  };

  return (
    <View className="MyCollection">
      <NavigationBar title="我的收藏" isBackToPage />
      <View className="mycollection_searchbar">
        <SearchInput
          style={{ height: '30rpx' }}
          onSearch={handleSearch}
          searchPlaceholder="搜索课程名/老师名"
          searchPlaceholderStyle="color:#9F9F9C"
          searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
          suffix={{ text: '搜索' }}
        />
      </View>

      <View className="mycollection_info_container">
        <Text className="mycollection_info_text">
          我的收藏 ({currCollections.length})
        </Text>
      </View>
      <View className="mycollection_list_container">
        <VirtualList
          height="70vh"
          width="100%"
          item={renderCourseItem}
          itemCount={currCollections.length}
          itemData={currCollections}
          itemSize={369}
          hasMore={false}
          bottomPadding={20}
          onLoadMore={() => {}}
          getItemKey={(item) => item.id}
          initialLoading={isLoading}
          EmptyChildren="暂无收藏"
        />
      </View>
    </View>
  );
};

export default Page;
