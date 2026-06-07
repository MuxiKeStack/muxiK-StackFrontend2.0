/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Picker, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import { useMyClassStore } from '@/store';

import { Loading } from '@/common/components';
import { ROUTES } from '@/common/constants/routes';
import {
  getSemesterNumber,
  SEMESTER_ALL,
  SEMESTER_NAME_TO_NUM,
  SEMESTER_NAMES,
} from '@/common/constants/semester';
import { MyCourseProps as CourseProps } from '@/common/types/myCourseType';
import { NavigationBar } from '@/modules/navigation';

const Page: React.FC = () => {
  const [yearSelector, setYearSelector] = useState<string[]>([]);
  const [semSelector] = useState([...SEMESTER_NAMES, SEMESTER_ALL]);

  const {
    selectedSemester: sem,
    selectedYear: year,
    setSelectedYearAndSemester,
    load,
  } = useMyClassStore();

  const [myclasses, setMyclasses] = useState<CourseProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateYearOptions = (): string[] => {
    const studentId = Taro.getStorageSync<string>('student_id') || '';
    if (!studentId) return [];

    const entranceYear = parseInt(studentId.substring(0, 4), 10);
    const currentYear = new Date().getFullYear();
    const years: string[] = [];

    for (let i = 0; i < 4; i++) {
      const yearStart = entranceYear + i;
      const yearEnd = yearStart + 1;

      if (yearEnd <= currentYear) years.push(`${yearStart}-${yearEnd}`);
    }
    return years;
  };

  const getCurrentSemesterName = (): string => {
    const month = new Date().getMonth() + 1;
    const num = getSemesterNumber(month);
    return SEMESTER_NAMES[num - 1] || SEMESTER_NAMES[0];
  };

  const onYearChange = (e) => {
    const yearIndex = e.detail.value;
    const selectedYear = yearSelector[yearIndex];

    setSelectedYearAndSemester(selectedYear, sem || '');
  };

  const onSemChange = (e) => {
    const semIndex = e.detail.value;
    const selectedSem = semSelector[semIndex];

    setSelectedYearAndSemester(year || '', selectedSem);
  };

  async function fetchClasses() {
    setIsLoading(true);

    if (!year || !sem) {
      setIsLoading(false);
      return;
    }

    try {
      const yearValue = year.split('-')[0];
      const semValue = String(
        SEMESTER_NAME_TO_NUM[sem as keyof typeof SEMESTER_NAME_TO_NUM] || '0'
      );
      const classes = await load(year, sem, { yearValue, termValue: semValue });
      setMyclasses(classes);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      setMyclasses([]);
      void Taro.showToast({ icon: 'error', title: '加载失败' });
    } finally {
      setIsLoading(false);
    }
  }

  const fetchCourses = () => {
    void fetchClasses().catch(() => {
      Taro.hideLoading();
      void Taro.showToast({ icon: 'error', title: '加载失败' });
    });
  };

  useEffect(() => {
    fetchCourses();
  }, [year, sem]);

  useLoad(() => {
    setIsLoading(true);
    const yearOptions = generateYearOptions();
    setYearSelector(yearOptions);

    if (!year || !sem) {
      const currentSem = getCurrentSemesterName();

      let initialYear: string;
      if (yearOptions.length > 0) {
        initialYear = yearOptions[yearOptions.length - 1];
      } else {
        const y = new Date().getFullYear();
        initialYear = `${y - 1}-${y}`;
      }

      setSelectedYearAndSemester(initialYear, currentSem);
    }
  });

  const handleClassClick = (item: CourseProps) => {
    const query = `?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`;
    if (item.evaluated) handleNavToCourseInfo(item);
    else
      void Taro.navigateTo({
        url: `${ROUTES.course.evaluate}${query}`,
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
          value={
            yearSelector.indexOf(year || '') === -1 ? 0 : yearSelector.indexOf(year || '')
          }
          onChange={onYearChange}
        >
          <View className="myclass_year_selector">
            <Text className="myclass_year_text">{year || '正在加载学年...'}</Text>
            <View className="myclass_arrow_icon"></View>
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={semSelector}
          value={
            semSelector.indexOf(sem || '') === -1 ? 0 : semSelector.indexOf(sem || '')
          }
          onChange={onSemChange}
        >
          <View className="myclass_semester_selector">
            <Text className="myclass_semester_text">{sem || '正在加载学期...'}</Text>
            <View className="myclass_arrow_icon"></View>
          </View>
        </Picker>
      </View>

      <View className="myclass_list_container">
        {isLoading ? (
          <View
            style={{
              height: '60vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Loading
              type="circular"
              size={60}
              textStyle={{ fontSize: '20rpx' }}
              isCenter={false}
            />
          </View>
        ) : myclasses && myclasses.length > 0 ? (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavToCourseInfo(each);
                  }}
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
