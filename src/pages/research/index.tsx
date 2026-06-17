/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { memo, useCallback } from 'react';

import './index.scss';

import {
  emptySession,
  SEARCH_LOCATION,
  useResearchStore,
} from '@/pages/research/model';

import { deleteIcon } from '@/common/assets/img/icons';
import { SearchInput, SearchLabel, VirtualList } from '@/common/components';
import CourseLabel from '@/common/components/CourseLabel';
import { hideLoadingThenToast } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

import type { SearchHistoryItem, SearchResultCourse } from './types';

const COURSE_ITEM_SIZE = 369;

const SearchCourseItem = memo(
  ({ data, index }: { data: SearchResultCourse[]; index: number }) => {
    const course = data[index];
    return <CourseLabel course={course} />;
  }
);

interface ConditionalRenderProps {
  showResults: boolean;
  session: ReturnType<typeof emptySession>;
  hrs: SearchHistoryItem[];

  handleSearch: (searchText: string) => void;
  handleDelete: () => void;
  onLoadMore: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
}

const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  showResults,
  session,
  hrs,
  handleSearch,
  handleDelete,
  onLoadMore,
  onRefresh,
}) => {
  if (!showResults) {
    return (
      <View className="history_section">
        <View className="history_header">
          <Text className="history_title">历史搜索</Text>
          <View className="clear_history_button" onTouchEnd={handleDelete}>
            <Image className="delete_icon" src={deleteIcon} />
          </View>
        </View>
        <View
          className="history_result_container"
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
        >
          {hrs.map((hr) => (
            <SearchLabel
              key={hr.id}
              content={hr.keyword}
              onClick={() => {
                handleSearch(hr.keyword);
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="course_list_container">
      <VirtualList
        height="100%"
        width="100%"
        item={SearchCourseItem}
        itemCount={session.results.length}
        itemData={session.results}
        itemSize={COURSE_ITEM_SIZE}
        hasMore={session.hasMore}
        bottomPadding={20}
        onLoadMore={onLoadMore}
        onRefresh={onRefresh}
        getItemKey={(item) => item.id}
        initialLoading={session.loading}
        EmptyChildren="没有找到相关课程"
      />
    </View>
  );
};

const Page: React.FC = () => {
  const history = useResearchStore((s) => s.history);
  const session = useResearchStore((s) => s.sessions[SEARCH_LOCATION.HOME] ?? emptySession());
  const keyword = useResearchStore((s) => s.keyword);
  const showResults = useResearchStore((s) => s.showResults);
  const loadHistory = useResearchStore((s) => s.loadHistory);
  const clearHistory = useResearchStore((s) => s.clearHistory);
  const setKeyword = useResearchStore((s) => s.setKeyword);
  const collapseResults = useResearchStore((s) => s.collapseResults);
  const searchHome = useResearchStore((s) => s.searchHome);
  const loadMore = useResearchStore((s) => s.loadMore);
  const refreshSearch = useResearchStore((s) => s.refreshSearch);

  useLoad(() => {
    setKeyword('');
    collapseResults();
    void loadHistory().catch((error) => {
      console.error('获取历史搜索异常:', error);
      Taro.showToast({
        title: '获取历史搜索异常，请稍后重试',
        icon: 'error',
        duration: 2000,
      });
    });
  });

  const handleDelete = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有搜索历史吗？',
      success: async (modalRes) => {
        if (!modalRes.confirm) return;
        try {
          await clearHistory();
          Taro.showToast({ title: '删除成功', icon: 'success' });
        } catch (error) {
          console.error('删除历史记录失败:', error);
          Taro.showToast({ title: '删除失败,请稍后再试', icon: 'error' });
        }
      },
    });
  };

  const handleSearch = async (searchText: string) => {
    if (!searchText || !searchText.trim()) {
      Taro.showToast({ title: '请输入搜索内容', icon: 'error' });
      return;
    }

    Taro.showLoading({ title: '搜索中' });
    try {
      await searchHome(searchText);
      Taro.hideLoading();
    } catch (error) {
      console.error('搜索失败:', error);
      hideLoadingThenToast({
        title: '搜索失败',
        icon: 'error',
      });
    }
  };

  const handleLoadMore = useCallback(async () => {
    try {
      await loadMore({ search_location: SEARCH_LOCATION.HOME });
    } catch (error) {
      console.error('加载更多失败:', error);
      Taro.showToast({ title: '加载更多失败', icon: 'none' });
    }
  }, [loadMore]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshSearch({ search_location: SEARCH_LOCATION.HOME });
    } catch (error) {
      console.error('刷新搜索失败:', error);
      Taro.showToast({ title: '刷新失败', icon: 'none' });
    }
  }, [refreshSearch]);

  return (
    <View
      className={`search_page_container ${showResults ? 'search_page_container--results' : ''}`}
    >
      <NavigationBar title="搜索查询" isBackToPage />
      <View className="search_input_wrapper">
        <SearchInput
          onSearch={handleSearch}
          onSearchToggle={collapseResults}
          searchText={keyword}
          setSearchText={setKeyword}
          searchPlaceholder="搜索课程名/老师名"
          searchPlaceholderStyle="color:#9F9F9C"
          searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
          suffix={{
            text: '搜索',
          }}
        />
      </View>

      <ConditionalRender
        showResults={showResults}
        session={session}
        hrs={history}
        handleSearch={handleSearch}
        handleDelete={handleDelete}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

export default Page;
