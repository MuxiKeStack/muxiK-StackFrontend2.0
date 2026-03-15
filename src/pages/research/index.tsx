/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
import {
  deleteSearchHistory,
  getSearchHistory,
  searchCourses,
} from '@/common/api/research';
import { deleteIcon } from '@/common/assets/img/icons';
import { SearchInput } from '@/common/components';
import CourseLabel from '@/common/components/CourseLabel';
import SearchLabel from '@/common/components/Searchlabel';
import { getErrorMessage } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';
import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import './style.scss';

export interface Course {
  id: number;
  keyword: string;
}

export interface ClassInfo {
  id: number;
  name: string;
  teacher: string;
  composite_score: number; // 确保这个字段是number类型
  features: string[]; // 这个字段是一个字符串数组
  assessments?: object; // 使用?表示这个属性是可选的
}

interface ConditionalRenderProps {
  isSpread: boolean;
  classes: ClassInfo[];
  hrs: Course[];
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
  return isSpread ? (
    <View className="course_list_container">
      {classes.map((each) => (
        <CourseLabel key={each.id} {...each} />
      ))}
    </View>
  ) : (
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
};

const Page: React.FC = () => {
  const [hrs, setHrs] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isSpread, setSpread] = useState<boolean>(false);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  useLoad(async () => {
    console.log('Page loaded.');

    const query = {
      search_location: 'Home',
    };

    try {
      const res = await getSearchHistory(query);
      console.log('获取到历史搜索信息', res);

      if (res.code === 0) {
        setHrs(res.data);
      } else {
        const errorMsg = getErrorMessage(res, '获取历史搜索失败');
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('获取历史搜索异常:', error);

      Taro.showToast({
        title: '获取历史搜索异常，请稍后重试',
        icon: 'error',
        duration: 2000,
      });
    }
  });

  const handleSearchToggle = () => {
    // setSpread(isSearchActive);
    // Taro.navigateTo({
    //   url: '/pages/research/index',
    // });
    setSpread(false);
  };

  const handleDelete = async () => {
    const body = {
      remove_all: true,
      remove_history_ids: [],
      search_location: 'Home',
    };
    try {
      const res = await deleteSearchHistory(body);
      console.log(res);
      if (res.code === 0) {
        setHrs([]);
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        });
      } else {
        const errorMsg = getErrorMessage(res, '删除历史记录失败');
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('删除历史记录失败:', error);
      Taro.showToast({
        title: '删除失败,请稍后再试',
        icon: 'error',
      });
    }
  };

  // const handleSearch = (searchText: string) => {
  //   Taro.showLoading({
  //     title: '搜索中',
  //   });
  //   // console.log('搜索文本:', searchText);
  //   setSpread(true);
  //   get(`/search?biz=Course&keyword=${searchText}&search_location=Home`)
  //     .then((res) => {
  //       setClasses(res.data);
  //       console.log(res.data);

  //       Taro.hideLoading();
  //       if (res.data.length === 0) {
  //         Taro.showToast({
  //           title: '暂无内容',
  //           icon: 'error',
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       Taro.hideLoading();
  //       Taro.showToast({
  //         title: '搜索失败',
  //         icon: 'error',
  //       });
  //     });
  // };

  const handleSearch = async (searchText: string) => {
    setGlobalSearchText(searchText);
    setHrs((prev) => [{ id: Date.now(), keyword: searchText }, ...prev]);
    Taro.showLoading({
      title: '搜索中',
    });
    setSpread(true);
    const query = {
      biz: 'Course',
      keyword: searchText,
      search_location: 'Home',
    };
    try {
      const res = await searchCourses(query);

      if (res.code === 0) {
        if (res.data.length === 0) {
          Taro.showToast({
            title: '暂无内容',
            icon: 'error',
          });
        }
        // 临时：为每个课程添加模拟的 features 数据

        const mockFeatures = [
          '课程简单易学',
          '作业量适中',
          '老师讲解清晰',
          '给分很好',
          '课堂氛围轻松',
          '有点名但不多',
          '期末有论文',
          '小组合作项目',
          '适合零基础',
          '干货满满',
        ];

        // 课程类型数组
        const courseTypes = [
          '专业主干课',
          '通识选修课',
          '专业选修课',
          '公共必修课',
          '通识核心课',
          '专业实习',
        ];

        const enhancedData = res.data.map((course: ClassInfo, index: number) => ({
          ...course,
          // 添加课程类型，随机从数组中选取
          courseType: courseTypes[Math.floor(Math.random() * courseTypes.length)],
          features: [
            mockFeatures[index % mockFeatures.length],
            mockFeatures[(index + 2) % mockFeatures.length],
            mockFeatures[(index + 4) % mockFeatures.length],
          ].slice(0, Math.floor(Math.random() * 6) + 1), // 随机取1-3个标签
        }));

        setClasses(enhancedData);
      } else {
        const errorMsg = getErrorMessage(res, '搜索失败');
        throw new Error(errorMsg);
      }
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

  useEffect(() => {
    console.log('课程已经被更新');
  }, [classes]);

  return (
    <View className="search_page_container">
      <NavigationBar title="搜索查询" isBackToPage />
      <View className="search_input_wrapper">
        <SearchInput
          style={{ height: '30rpx' }}
          onSearch={handleSearch} // 传递搜索逻辑
          onSearchToggle={handleSearchToggle}
          searchText={globalSearchText}
          setSearchText={setGlobalSearchText}
          // disabled
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
        classes={classes}
        hrs={hrs}
        handleSearch={handleSearch}
        handleDelete={handleDelete}
      />
    </View>
  );
};

export default Page;
