import { getUserCourses } from '@/api/getUserCourses';
import { Picker, Text, View } from '@tarojs/components';
import { useEffect, useState } from 'react';
import './myclass.scss';

interface CouresProps {
  name: string;
  teacher: string;
  evaluated: boolean;
  year: string;
  term: string;
  id: number;
}

export default function Myclass() {
  const [yearSelector] = useState([
    '2022-2023学年',
    '2023-2024学年',
    '2024-2025学年',
    '2025-2026学年',
  ]);
  const [year, setYear] = useState('2024-2025学年');
  const [semSelector] = useState(['第一学期', '第二学期', '第三学期', '全部学期']);
  const [sem, setSem] = useState('第一学期');

  const [myclasses, setMyclasses] = useState<CouresProps[]>([]);

  const onTimeChange = (e) => {
    const { detail } = e;
    setYear(yearSelector[detail.value]);
  };

  const onSemChange = (e) => {
    const { detail } = e;
    setSem(semSelector[detail.value]);
  };

  useEffect(() => {
    async function fetchClasses() {
      try {
        // 获取年份的前四位
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
        setMyclasses(classes);
      } catch (error) {
        console.error('Error fetching user courses:', error);
      }
    }
    fetchClasses();
  }, [year, sem]);

  return (
    <View>
      <View className="select">
        <Picker range={yearSelector} onChange={onTimeChange} mode="selector">
          <View className="selector1">
            <Text className="text">{year}</Text>
            <View className="sjx"></View>
          </View>
        </Picker>
        <Picker range={semSelector} onChange={onSemChange} mode="selector">
          <View className="selector2">
            <Text className="text">{sem}</Text>
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
