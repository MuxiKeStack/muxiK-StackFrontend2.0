import { Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { memo, useCallback, useEffect, useState } from 'react';

import './index.scss';

import { emptySession, SEARCH_LOCATION, useResearchStore } from '@/pages/research/model';
import { useMyCollectionsStore } from '@/store';

import { SearchInput, VirtualList } from '@/common/components';
import CourseLabel from '@/common/components/CourseLabel';
import { CollectionProps } from '@/common/types/collectionsType';
import { NavigationBar } from '@/modules/navigation';

const COURSE_ITEM_SIZE = 369;

const CollectionCourseItem = memo(
  ({ data, index }: { data: CollectionProps[]; index: number }) => {
    const course = data[index];
    return <CourseLabel course={{ ...course, id: course.course_id }} />;
  }
);

const Page: React.FC = () => {
  const totalCollections = useMyCollectionsStore((s) => s.collectionsCache);
  const loadCollections = useMyCollectionsStore((s) => s.load);
  const searchSession = useResearchStore(
    (s) => s.sessions[SEARCH_LOCATION.COLLECTIONS] ?? emptySession()
  );
  const searchFirst = useResearchStore((s) => s.searchFirst);
  const loadMoreSearch = useResearchStore((s) => s.loadMore);
  const refreshSearch = useResearchStore((s) => s.refreshSearch);
  const resetSearchSession = useResearchStore((s) => s.resetSession);

  const [browseCollections, setBrowseCollections] = useState<CollectionProps[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [collectionLoading, setCollectionLoading] = useState(false);

  const isSearchMode = searchKeyword.trim().length > 0;

  const displayList: CollectionProps[] = isSearchMode
    ? (searchSession.results.map((c) => ({
        ...c,
        course_id: c.id,
        id: c.id,
      })) as unknown as CollectionProps[])
    : browseCollections;

  const fetchCollectionList = useCallback(
    async (
      params: { cur_collection_id: number; limit: number },
      options?: { force?: boolean }
    ) => {
      setCollectionLoading(true);
      try {
        await loadCollections(params, options);
      } catch {
        Taro.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        setCollectionLoading(false);
      }
    },
    [loadCollections]
  );

  useEffect(() => {
    if (!isSearchMode) {
      setBrowseCollections(totalCollections);
    }
  }, [totalCollections, isSearchMode]);

  useDidShow(() => {
    void fetchCollectionList({
      cur_collection_id: 0,
      limit: 20,
    });
  });

  const handleSearch = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      setSearchKeyword(trimmed);

      if (!trimmed) {
        resetSearchSession(SEARCH_LOCATION.COLLECTIONS);
        setBrowseCollections(totalCollections);
        return;
      }

      try {
        await searchFirst(trimmed, { search_location: SEARCH_LOCATION.COLLECTIONS });
      } catch {
        Taro.showToast({ title: '搜索失败', icon: 'none' });
      }
    },
    [resetSearchSession, searchFirst, totalCollections]
  );

  const handleLoadMore = useCallback(async () => {
    if (!isSearchMode) return;
    try {
      await loadMoreSearch({ search_location: SEARCH_LOCATION.COLLECTIONS });
    } catch {
      Taro.showToast({ title: '加载更多失败', icon: 'none' });
    }
  }, [isSearchMode, loadMoreSearch]);

  const handleRefresh = useCallback(async () => {
    try {
      if (isSearchMode) {
        await refreshSearch({ search_location: SEARCH_LOCATION.COLLECTIONS });
      } else {
        await fetchCollectionList({ cur_collection_id: 0, limit: 20 }, { force: true });
      }
    } catch {
      Taro.showToast({ title: '刷新失败', icon: 'none' });
    }
  }, [fetchCollectionList, isSearchMode, refreshSearch]);

  const isLoading = isSearchMode
    ? searchSession.loading
    : collectionLoading && browseCollections.length === 0;

  const hasMore = isSearchMode ? searchSession.hasMore : false;

  return (
    <View className="MyCollection">
      <NavigationBar title="我的收藏" isBackToPage />
      <View className="mycollection_searchbar">
        <SearchInput
          onSearch={handleSearch}
          searchPlaceholder="搜索课程名/老师名"
          searchPlaceholderStyle="color:#9F9F9C"
          searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
          suffix={{ text: '搜索' }}
        />
      </View>

      <View className="mycollection_info_container">
        <Text className="mycollection_info_text">
          {isSearchMode
            ? `搜索结果 (${displayList.length})`
            : `我的收藏 (${displayList.length})`}
        </Text>
      </View>
      <View className="mycollection_list_container">
        <VirtualList
          height="100%"
          width="100%"
          item={CollectionCourseItem}
          itemCount={displayList.length}
          itemData={displayList}
          itemSize={COURSE_ITEM_SIZE}
          hasMore={hasMore}
          bottomPadding={20}
          onLoadMore={handleLoadMore}
          getItemKey={(item) => item.id}
          initialLoading={isLoading}
          onRefresh={handleRefresh}
          EmptyChildren={isSearchMode ? '没有找到相关课程' : '暂无收藏'}
        />
      </View>
    </View>
  );
};

export default Page;
