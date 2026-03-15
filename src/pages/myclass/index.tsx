/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Picker, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import { getUserCourses } from '@/common/api/getUserCourses';
import { generateSemesterOptions } from '@/common/utils/generateSemesterOptions';
import { NavigationBar } from '@/modules/navigation';

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
  const [yearSelector, setYearSelector] = useState<string[]>([]);
  const [semSelector] = useState(['第一学期', '第二学期', '第三学期', '全部学期']);
  const [year, setYear] = useState<string>('');
  const [sem, setSem] = useState<string>('');

  const [myclasses, setMyclasses] = useState<CouresProps[]>([]);

  const onYearChange = (e) => {
    const yearIndex = e.detail.value;
    setYear(yearSelector[yearIndex]);
  };

  const onSemChange = (e) => {
    const semIndex = e.detail.value;
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

      const classes = await getUserCourses(yearValue, semValue);
      setMyclasses(classes || []);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      setMyclasses([]);
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
    void generateSemesterOptions().then(({ yearOptions, currentSemester }) => {
      console.log(yearOptions, currentSemester);
      setYearSelector(yearOptions);
      setYear(currentSemester.year);
      setSem(currentSemester.sem);
    });
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
    <View className="myclass_page_container">
      <NavigationBar
        title="我的课程"
        isBackToPage
        style={{ backgroundColor: '#FFFFFF' }}
      />

      <View className="myclass_filter_container">
        <Picker
          mode="selector"
          range={yearSelector}
          value={yearSelector.indexOf(year) === -1 ? 0 : yearSelector.indexOf(year)}
          onChange={onYearChange}
        >
          <View className="myclass_year_selector">
            <Text className="myclass_year_text">{year}</Text>
            <View className="myclass_arrow_icon"></View>
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={semSelector}
          value={semSelector.indexOf(sem) === -1 ? 0 : semSelector.indexOf(sem)}
          onChange={onSemChange}
        >
          <View className="myclass_semester_selector">
            <Text className="myclass_semester_text">{sem}</Text>
            <View className="myclass_arrow_icon"></View>
          </View>
        </Picker>
      </View>

      <View className="myclass_list_container">
        {myclasses && myclasses.length > 0 ? (
          myclasses.map((each, index) => (
            <View
              key={index}
              className="myclass_item"
              onClick={() => handleClassClick(each)}
            >
              <View className="myclass_item_left">
                <View className="myclass_item_circle"></View>
                <View
                  className="myclass_item_info"
                  onClick={() => handleNavToCourseInfo(each)}
                >
                  <Text className="myclass_item_name" overflow="ellipsis">
                    {each.name}
                  </Text>
                  <Text className="myclass_item_teacher">{'(' + each.teacher + ')'}</Text>
                </View>
              </View>
              <View className="myclass_item_right">
                <Text className="myclass_item_status">
                  {each.evaluated ? '已评课' : '未评课'}
                </Text>
                <Text className="myclass_item_icon"> {each.evaluated ? '✔' : '➜'}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="myclass_empty">暂无课程</View>
        )}
      </View>
    </View>
  );
};

export default Page;
