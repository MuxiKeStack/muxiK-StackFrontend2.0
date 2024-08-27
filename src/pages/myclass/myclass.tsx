/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Picker, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './myclass.scss';

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

export default function Myclass() {
  const [yearSelector] = useState<string[]>([
    '2022-2023学年',
    '2023-2024学年',
    '2024-2025学年',
    '2025-2026学年',
  ]);
  const [semSelector] = useState(['第一学期', '第二学期', '第三学期', '全部学期']);
  const [year, setYear] = useState('2024-2025学年');
  const [sem, setSem] = useState('第一学期');

  const [myclasses, setMyclasses] = useState<CouresProps[]>([]);

  const onTimeSemChange = (e) => {
    const [yearIndex, semIndex] = e.detail.value;
    setYear(yearSelector[yearIndex]);
    setSem(semSelector[semIndex]);
  };

  useEffect(() => {
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
    void fetchClasses();
  }, [year, sem]);

  const handleClassClick = (id: number, name: string) => {
    // 拼接查询字符串参数
    const query = `?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
    // 使用 navigateTo 跳转到 evaluate 页面，并传递参数
    void Taro.navigateTo({
      url: `/pages/evaluate/evaluate${query}`,
    });
  };

  return (
    <View>
      <View className="select">
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
          <View
            key={index}
            className="eachClass"
            onClick={() => handleClassClick(each.id, each.name)}
          >
            <View className='circle'></View>
            <Text className="classname">{each.name}</Text>
            <Text className="classteacher">{'（'+each.teacher+'）'}</Text>
            <Text className="classstatus">{each.evaluated ? '已评课' : '未评课'}</Text>
            <Text className="jt">➜</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
