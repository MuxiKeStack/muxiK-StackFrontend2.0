/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable unused-imports/no-unused-vars */
import { Picker, Text, View } from '@tarojs/components';
import { useEffect, useState } from 'react';

import './myclass.scss';

// eslint-disable-next-line import/first
import { getUserCourses } from '@/api/getUserCourses';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
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
          <View key={index} className="eachClass">
            <Text className="classname">{each.name}</Text>
            <Text className="classteacher">{each.teacher}</Text>
            <Text className="classstatus">{each.evaluated ? '已评课' : '未评课'}</Text>
            <Text className="jt">➜</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
