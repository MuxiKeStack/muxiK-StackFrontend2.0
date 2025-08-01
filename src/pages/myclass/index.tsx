/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Picker, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import { NavigationBar } from '@/modules/navigation';

import './style.scss';

// eslint-disable-next-line import/first
import { getUserCourses } from '@/common/api/getUserCourses';

interface CouresProps {
  name: string;
  teacher: string;
  evaluated: boolean;
  year: string;
  term: string;
  id: number;
}

const Page: React.FC = () => {
  //待优化点 别写死了
  const [yearSelector] = useState<string[]>([
    '2022-2023学年',
    '2023-2024学年',
    '2024-2025学年',
    '2025-2026学年',
  ]);
  const [semSelector] = useState(['第一学期', '第二学期', '第三学期', '全部学期']);
  const [year, setYear] = useState('2024-2025学年');
  const [sem, setSem] = useState('第二学期');

  const [myclasses, setMyclasses] = useState<CouresProps[]>([]);

  const onTimeSemChange = (e) => {
    const [yearIndex, semIndex] = e.detail.value;
    setYear(yearSelector[yearIndex]);
    setSem(semSelector[semIndex]);
  };
  async function fetchClasses() {
    try {
      const yearValue = year.split('-')[0];
      const semValue =
        sem === '第一学期'
          ? '1'
          : sem === '第二学期'
            ? '2'
            : sem === '第三学期'
              ? '3'
              : '0';
      const classes: Array<CouresProps> = await getUserCourses(yearValue, semValue);
      setMyclasses(classes);
    } catch (error) {
      console.error('Error fetching user courses:', error);
    }
  }
  const fetchCourses = () => {
    void Taro.showLoading({
      title: '加载中',
    });
    void fetchClasses()
      .then(() => {
        Taro.hideLoading();
      })
      .catch(() => {
        Taro.hideLoading();
        void Taro.showToast({
          icon: 'error',
          title: '加载失败',
        });
      });
  };
  useEffect(() => {
    fetchCourses();
  }, [year, sem]);
  useDidShow(() => {
    fetchCourses();
  });

  const handleClassClick = (item: CouresProps) => {
    // 拼接查询字符串参数
    const query = `?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`;
    // 使用 navigateTo 跳转到 evaluate 页面，并传递参数
    if (item.evaluated) handleNavToCourseInfo(item);
    else
      void Taro.navigateTo({
        url: `/pages/evaluate/index${query}`,
      });
  };
  const handleNavToCourseInfo = (each) => {
    void Taro.navigateTo({
      url: `/pages/classInfo/index?course_id=${each.id}`,
    });
  };

  return (
    <View className="mt-24 w-full overflow-auto" style={{ height: 'cal(100vh - 96px)' }}>
      <NavigationBar
        title="我的课程"
        isBackToPage
        style={{ backgroundColor: '#FFFFFF' }}
      />
      <View className="select flex-1">
        <Picker
          mode="multiSelector"
          range={[yearSelector, semSelector]}
          value={[yearSelector.indexOf(year), semSelector.indexOf(sem)]}
          onChange={onTimeSemChange}
        >
          <View className="selector">
            <Text className="text">
              {year} {sem}
            </Text>
            <View className="sjx"></View>
          </View>
        </Picker>
      </View>
      <View className="classes">
        {myclasses.map((each, index) => (
          <View key={index} className="eachClass" onClick={() => handleClassClick(each)}>
            <View className="circle"></View>
            <View className="flex flex-col" onClick={() => handleNavToCourseInfo(each)}>
              <Text className="classname" overflow="ellipsis">
                {each.name}
              </Text>
              <Text className="classteacher">{'（' + each.teacher + '）'}</Text>
            </View>
            <Text className="classstatus">{each.evaluated ? '已评课' : '未评课'}</Text>
            <Text className="jt">➜</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Page;
