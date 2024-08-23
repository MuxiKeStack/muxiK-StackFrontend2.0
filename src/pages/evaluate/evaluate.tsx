/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable import/first */
import {
  Button,
  Form,
  Radio,
  RadioGroup,
  Text,
  Textarea,
  View,
} from '@tarojs/components';
import { useState } from 'react';

import './evaluate.scss';

import Label3 from '@/components/label3/label3';
import Star from '@/components/star/star';

export default function evaluate() {
  function generateUniqueID() {
    const timestamp = Date.now().toString(36); // 时间戳转换为36进制
    const randomString = Math.random().toString(36).substr(2, 5); // 随机数转换为36进制并截取部分字符

    const uniqueID = timestamp + randomString;
    return uniqueID;
  }

  // 示例用法
  //const uniqueID = generateUniqueID();

  const [testways] = useState([
    { value: '开卷考试', text: '开卷考试', checked: false },
    { value: '闭卷考试', text: '闭卷考试', checked: false },
    { value: '论文考核', text: '论文考核', checked: false },
    { value: '小组汇报', text: '小组汇报', checked: false },
    { value: '无考核', text: '无考核', checked: false },
  ]);

  const [myclass] = useState([{ content: '只能评价自己学过的课程哦' }]);

  const [features, setFeatures] = useState([
    { id: generateUniqueID(), content: '老师风趣幽默', checked: false },
    { id: generateUniqueID(), content: '课程干货满满', checked: false },
    { id: generateUniqueID(), content: '老师严谨负责', checked: false },
    { id: generateUniqueID(), content: '课程很有挑战', checked: false },
    { id: generateUniqueID(), content: '课程简单易学', checked: false },
    { id: generateUniqueID(), content: '老师温柔随和', checked: false },
    { id: generateUniqueID(), content: '平时作业少', checked: false },
    { id: generateUniqueID(), content: '期末划重点', checked: false },
    { id: generateUniqueID(), content: '云课堂资料全', checked: false },
  ]);

  const [textLength, setLength] = useState(0);

  const handleChecked = (id) => {
    const newFeatures = features.map((e) => {
      if (e.id === id) return { ...e, checked: !e.checked };
      else return e;
    });
    setFeatures(newFeatures);
  };

  const countContent = (e) => {
    const { value } = e.detail;
    const length = value.length;
    setLength(length);
  };

  return (
    <Form className="view">
      <View className="p">
        <Text> 选择课程 : </Text>
        {myclass.map((each) => {
          return <Label3 {...each} />;
        })}
      </View>
      <View className="p">
        <Text>评价星级 :</Text>
        <Star></Star>
      </View>
      <View className="p">
        <Text>考核方式 :</Text>
        <View className="ways">
          <RadioGroup>
            {testways.map((item) => {
              return (
                <Radio
                  className="myradio"
                  checked={item.checked}
                  value={item.value}
                  color="transparent"
                >
                  {item.text}
                </Radio>
              );
            })}
          </RadioGroup>
        </View>
      </View>
      <View className="p">
        <Text>评价星级 :</Text>
        <View className="fea">
          {features.map((item) => {
            return <Label3 handleChecked={handleChecked} {...item} />;
          })}
        </View>
      </View>
      <Textarea
        maxlength={450}
        onInput={countContent}
        placeholderStyle="font-size: 25rpx;"
        placeholder="输入课程评价"
        className="myComment"
      ></Textarea>
      <Text className="zsxz">字数限制{textLength}/450</Text>
      <Button>发布</Button>
    </Form>
  );
}
