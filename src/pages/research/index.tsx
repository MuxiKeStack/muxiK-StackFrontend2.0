/* eslint-disable import/first */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './style.scss';

import Label1 from '@/common/components/label1/label1';
import Label2 from '@/common/components/label2/label2';
import SearchInput from '@/common/components/SearchInput/SearchInput';
import { get } from '@/common/utils';
import { put } from '@/common/utils/fetch';
import { NavigationBar } from '@/modules/navigation';

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
    <View className="tj">
      {classes.map((each) => (
        <Label2 key={each.id} {...each} />
      ))}
    </View>
  ) : (
    <View className="relative flex flex-col items-center">
      <View className="mt-[2vh] flex w-[80vw] flex-row justify-between">
        <Text className="text-lg">历史搜索</Text>
        <View className="button" onTouchEnd={handleDelete}>
          <Image
            style={{ width: '29.37rpx', height: '30.83rpx' }}
            src="https://s2.loli.net/2023/08/26/3XBEGlN2UuJdejv.png"
          />
        </View>
      </View>
      <View
        className="historyResult"
        onTouchEnd={(e) => {
          e.stopPropagation();
        }}
      >
        {hrs.map((hr) => (
          <Label1
            key={hr.id}
            content={hr.keyword}
            onClick={(e) => {
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

  useLoad(() => {
    console.log('Page loaded.');
    get('/search/history?search_location=Home').then((res) => {
      console.log('获取到历史搜索信息');
      // console.log(res);
      setHrs(res.data);
    });
  });

  const handleSearchToggle = () => {
    // setSpread(isSearchActive);
    // Taro.navigateTo({
    //   url: '/pages/research/index',
    // });
    setSpread(false);
  };

  const handleDelete = () => {
    put('/search/history', {
      remove_all: true,
      remove_history_ids: [],
      search_location: 'Home',
    }).then((res) => {
      console.log(res);
      if (res.code === 0) {
        setHrs([]);
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    });
  };

  const handleSearch = (searchText: string) => {
    Taro.showLoading({
      title: '搜索中',
    });
    // console.log('搜索文本:', searchText);
    setSpread(true);
    get(`/search?biz=Course&keyword=${searchText}&search_location=Home`)
      .then((res) => {
        setClasses(res.data);
        Taro.hideLoading();
        if (res.data.length === 0) {
          Taro.showToast({
            title: '暂无内容',
            icon: 'error',
          });
        }
      })
      .catch((err) => {
        Taro.hideLoading();
        Taro.showToast({
          title: '搜索失败',
          icon: 'error',
        });
      });
  };

  useEffect(() => {
    console.log('课程已经被更新');
  }, [classes]);

  return (
    <View
      className="mt-20 flex h-[100vh] w-[100vw] flex-col items-center overflow-auto"
      // onTouchEnd={() => handleClick()}
    >
      <NavigationBar title="搜索查询" isBackToPage />
      <View className="mt-5 flex w-full items-center justify-center gap-2">
        <SearchInput
          style={{ height: '30rpx', width: '500rpx', borderRadius: '30rpx' }}
          onSearch={handleSearch} // 传递搜索逻辑
          onSearchToggle={handleSearchToggle}
          searchText={globalSearchText}
          setSearchText={setGlobalSearchText}
          // disabled
          searchPlaceholder="搜索课程名/老师名"
          searchPlaceholderStyle="color:#9F9F9C"
          searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
        />
        <Text className="text-center text-lg" onTouchEnd={() => handleSearch(searchText)}>
          搜索
        </Text>
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
