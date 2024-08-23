/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable unused-imports/no-unused-vars */
import { Picker, Text, View } from '@tarojs/components';
import { useState } from 'react';

import './myclass.scss';

export default function Myclass() {
  const [yearSelector] = useState([
    '2022-2023学年',
    '2023-2024学年',
    '2024-2025学年',
    '2025-2026学年',
  ]);

  const [, setYear] = useState('2022-2023学年');

  const onTimeChange = (e) => {
    const { detail } = e;
    setYear(detail.value);
  };

  const semSelector = ['第一学期', '第二学期', '第三学期', '全部学期'];

  const [, setSem] = useState('第一学期');

  const onSemChange = (e) => {
    const { detail } = e;
    setSem(detail.value);
  };

  const [myclasses] = useState([
    { name: '人体解剖学 （成良）', status: false },
    { name: '人体解剖学 （成良）', status: false },
    { name: '人体解剖学 （成良）', status: false },
    { name: '人体解剖学 （成良）', status: false },
    { name: '人体解剖学 （成良）', status: false },
  ]);

  return (
    <View>
      <View className="select">
        <Picker range={yearSelector} onChange={onTimeChange} mode="selector">
          <View className="selector1">
            <Text className="text">选择学年</Text>
            <View className="sjx"></View>
          </View>
        </Picker>
        <Picker range={semSelector} onChange={onSemChange} mode="selector">
          <View className="selector2">
            <Text className="text">选择学期</Text>
            <View className="sjx"></View>
          </View>
        </Picker>
      </View>
      <View className="classes">
        {myclasses.map((each) => {
          return (
            <View className="eachClass">
              <View></View>
              <Text className="classname">{each.name}</Text>
              <Text className="classstatus">{each.status ? '已评课' : '未评课'}</Text>
              <Text className="jt">➜</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
