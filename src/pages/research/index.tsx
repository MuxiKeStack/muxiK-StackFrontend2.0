/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useState } from 'react';

import './index.scss';

import { useResearchStore } from '@/store';

import { deleteIcon } from '@/common/assets/img/icons';
import { SearchInput } from '@/common/components';
import CourseLabel from '@/common/components/CourseLabel';
import { SearchLabel } from '@/common/components';
import {
  translateAssessments,
  translateCourseProperty,
  translateFeatures,
} from '@/common/constants/courseLabels';
import { NavigationBar } from '@/modules/navigation';

import type { SearchHistoryItem, SearchResultCourse } from './types';

interface ConditionalRenderProps {
  isSpread: boolean;
  classes: SearchResultCourse[];
  hrs: SearchHistoryItem[];
  handleSearch: (searchText: string) => void;
  handleDelete: () => void;
}

const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  isSpread,
  classes,
  hrs,
  handleSearch,
  handleDelete,
}) => {
  if (!isSpread) {
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

  if (classes.length === 0) {
    return (
      <View className="search_empty_container">
        <Text className="search_empty_text">没有找到相关课程</Text>
        <Text className="search_empty_hint">换个关键词试试吧</Text>
      </View>
    );
  }

  return (
    <View className="course_list_container">
      {classes.map((each) => (
        <CourseLabel key={each.id} course={each} />
      ))}
    </View>
  );
};

const Page: React.FC = () => {
  const history = useResearchStore((s) => s.history);
  const searchResults = useResearchStore((s) => s.searchResults);
  const loadHistory = useResearchStore((s) => s.loadHistory);
  const clearHistory = useResearchStore((s) => s.clearHistory);
  const search = useResearchStore((s) => s.search);

  const [isSpread, setSpread] = useState<boolean>(false);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  useLoad(() => {
    void loadHistory().catch((error) => {
      console.error('获取历史搜索异常:', error);
      Taro.showToast({
        title: '获取历史搜索异常，请稍后重试',
        icon: 'error',
        duration: 2000,
      });
    });
  });

  const handleSearchToggle = () => {
    setSpread(false);
  };

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

  const enhanceCourses = (courses: SearchResultCourse[]) =>
    courses.map((course) => ({
      ...course,
      courseType: translateCourseProperty(
        (course as { type?: string; property?: string }).type ??
          (course as { property?: string }).property
      ),
      features: translateFeatures(course.features as string[]),
      assessments: translateAssessments(course.assessments as string[]),
    }));

  const handleSearch = async (searchText: string) => {
    if (!searchText || !searchText.trim()) {
      Taro.showToast({ title: '请输入搜索内容', icon: 'error' });
      return;
    }

    const keyword = searchText.trim();
    setGlobalSearchText(keyword);
    useResearchStore.setState((s) => {
      const filtered = s.history.filter((item) => item.keyword !== keyword);
      return { history: [{ id: Date.now(), keyword }, ...filtered].slice(0, 20) };
    });

    Taro.showLoading({ title: '搜索中' });
    setSpread(true);
    try {
      const data = await search(keyword);
      useResearchStore.setState({ searchResults: enhanceCourses(data) });
    } catch (error) {
      console.error('搜索失败:', error);
      Taro.showToast({
        title: '搜索失败',
        icon: 'error',
      });
    } finally {
      Taro.hideLoading();
    }
  };

  return (
    <View className="search_page_container">
      <NavigationBar title="搜索查询" isBackToPage />
      <View className="search_input_wrapper">
        <SearchInput
          style={{ height: '30rpx' }}
          onSearch={handleSearch}
          onSearchToggle={handleSearchToggle}
          searchText={globalSearchText}
          setSearchText={setGlobalSearchText}
          searchPlaceholder="搜索课程名/老师名"
          searchPlaceholderStyle="color:#9F9F9C"
          searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
          suffix={{
            text: '搜索',
          }}
        />
      </View>

      <ConditionalRender
        isSpread={isSpread}
        classes={isSpread ? searchResults : []}
        hrs={history}
        handleSearch={handleSearch}
        handleDelete={handleDelete}
      />
    </View>
  );
};

export default Page;
