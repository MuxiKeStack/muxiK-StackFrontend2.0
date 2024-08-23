/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './research.scss';

import Label2 from '@/components/label2/label2';

import { get } from '@/fetch';

import Label1 from '../../components/label1/label1';
import SearchInput from '../../components/SearchInput/SearchInput';

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

const Research: React.FC = () => {
  const [hrs, setHrs] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isSpread, setSpread] = useState<boolean>(false);

  useLoad(() => {
    console.log('Page loaded.');
    get('/search/history?search_location=Home', true).then((res) => {
      console.log('获取到历史搜索信息');
      // console.log(res);
      setHrs(res.data);
    });
  });

  const handleSearchToggle = () => {
    // setSpread(isSearchActive);
    // Taro.navigateTo({
    //   url: '/pages/research/research',
    // });
    console.log(1);
    setSpread(false);
  };

  const handleClick = () => {
    console.log(2);
    Taro.redirectTo({
      url: '/pages/main/index',
    });
  };

  const handleSearch = (searchText: string) => {
    console.log('搜索文本:', searchText);
    setSpread(true);
    // 这里可以添加发送API请求的代码
    get(`/search?biz=Course&keyword=${searchText}&search_location=Home`, true).then(
      (res) => {
        console.log(res);
        setClasses(res.data);
      }
    );
  };

  useEffect(() => {
    console.log('课程已经被更新');
  }, [classes]);

  return (
    <View
      className="index"
      onClick={() => {
        handleClick();
      }}
    >
      <SearchInput
        onSearch={handleSearch} // 传递搜索逻辑
        onSearchToggle={handleSearchToggle}
        searchPlaceholder="搜索课程名/老师名"
        searchPlaceholderStyle="color:#9F9F9C"
        searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
      />
      <ConditionalRender
        isSpread={isSpread}
        classes={classes}
        hrs={hrs}
        handleSearch={handleSearch}
      />
    </View>
  );
};

export default Research;

const ConditionalRender = ({ isSpread, classes, hrs, handleSearch }) => {
  return isSpread ? (
    <View className="tj">
      {classes.map((each) => (
        <Label2 key={each.id} {...each} />
      ))}
    </View>
  ) : (
    <View>
      <Text className="lsss">历史搜索</Text>
      <View className="button">
        <Image
          style={{ width: '29.37rpx', height: '30.83rpx' }}
          src="https://s2.loli.net/2023/08/26/3XBEGlN2UuJdejv.png"
        />
      </View>
      <View className="historyResult">
        {hrs.map((hr) => (
          <Label1
            key={hr.id}
            content={hr.keyword}
            onClick={() => handleSearch(hr.keyword)}
          />
        ))}
      </View>
    </View>
  );
};
