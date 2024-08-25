/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable import/first */
import { Button, Form, Radio, Text, Textarea, View } from '@tarojs/components';
import { useEffect, useState } from 'react';
import './evaluate.scss';

import Label3 from '@/common/components/label3/label3';
import Star from '@/common/components/star/star';
import { post } from '@/common/utils/fetch';
import Taro from '@tarojs/taro';

export default function evaluate() {
  // function generateUniqueID() {
  //   const timestamp = Date.now().toString(36); // 时间戳转换为36进制
  //   const randomString = Math.random().toString(36).substr(2, 5); // 随机数转换为36进制并截取部分字符

  //   const uniqueID = timestamp + randomString;
  //   return uniqueID;
  // }

  // 示例用法
  //const uniqueID = generateUniqueID();

  // 初始化状态，存储所有选中的 Radio 项的值
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // 处理 Radio 变化的函数
  const handleRadioChange = (value: string) => {
    const currentIndex = selectedValues.indexOf(value);
    console.log(currentIndex);
    if (currentIndex > -1) {
      // 如果值已选中，移除它
      const newSelectedValues = selectedValues.filter((v, i) => i !== currentIndex);
      setSelectedValues(newSelectedValues);
    } else {
      // 否则，添加这个值
      setSelectedValues([...selectedValues, value]);
    }
  };

  // 测试方式的数据
  const testways = [
    { value: 'OpenBookExamination', text: '开卷考试' },
    { value: 'ClosedBookExamination', text: '闭卷考试' },
    { value: 'ThesisExamination', text: '论文考核' },
    { value: 'GroupReporting', text: '小组汇报' },
    { value: 'NoAssessment', text: '无考核' },
  ];

  // const [checkedClass,setCheckedClass] = useState([{ content: '只能评价自己学过的课程哦' }]);

  // enum FeatureTag {
  //   EasyToLearn = '课程简单易学',
  //   RichInContent = '课程干货满满',
  //   Challenging = '课程很有挑战',
  //   RigorousAndResponsible = '老师严谨负责',
  //   KindAndEasygoing = '老师温柔随和',
  //   Humorous = '老师风趣幽默',
  //   LessHomework = '平时作业少',
  //   KeyPointsForFinal = '期末划重点',
  //   ComprehensiveOnlineMaterials = '云课堂资料全',
  // }

  const features = [
    { value: 'EasyToLearn', content: '课程简单易学' },
    { value: 'RichInContent', content: '课程干货满满' },
    { value: 'Challenging', content: '课程很有挑战' },
    { value: 'RigorousAndResponsible', content: '老师严谨负责' },
    { value: 'KindAndEasygoing', content: '老师温柔随和' },
    { value: 'Humorous', content: '老师风趣幽默' },
    { value: 'LessHomework', content: '平时作业少' },
    { value: 'KeyPointsForFinal', content: '期末划重点' },
    { value: 'ComprehensiveOnlineMaterials', content: '云课堂资料全' },
  ];

  const [selectedFeatureValues, setSelectedFeatureValues] = useState<string[]>([]);

  const handleFeaturesChecked = (value: string) => {
    const currentIndex = selectedFeatureValues.indexOf(value);
    if (currentIndex > -1) {
      // 如果 id 已选中，移除它
      const newSelectedFeatureValues = selectedFeatureValues.filter(
        (v, i) => i !== currentIndex
      );
      setSelectedFeatureValues(newSelectedFeatureValues);
    } else {
      // 否则，添加这个 id
      setSelectedFeatureValues([...selectedFeatureValues, value]);
    }
  };

  const [textLength, setLength] = useState(0);
  const [comment, setComment] = useState('');

  const countContent = (e) => {
    const { value } = e.detail;
    setComment(value); // 更新状态为当前输入框的值
    const length = value.length;
    setLength(length);
  };

  // const course_id = 1; //暂时先指定一个courseId来测试使用

  // 更新 id 状态为 number 类型
  const [courseId, setId] = useState<number | null>(null);
  const [courseName, setName] = useState<string | null>('只能评价自己学过的课程哦');

  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      // 使用可选链操作符安全访问 router 和 params
      const params = instance?.router?.params || {};

      // 确保 id 是 number 类型
      setId(params.id ? Number(params.id) : null);
      // 解码 name 参数
      setName(params.name ? decodeURIComponent(params.name) : '只能评价自己学过的课程哦');

      console.log(params.id);
    };

    getParams();
  }, []); // 这个 effect 仅在组件挂载时运行一次

  const postEvaluation = () => {
    const evaluationobj = {
      star_rating: selectedStarIndex,
      content: comment,
      course_id: courseId,
      assessments: selectedValues,
      features: selectedFeatureValues,
      id: 0,
      status: 'Public',
    };
    console.log(evaluationobj);
    post(`/evaluations/save`, evaluationobj).then((res) => {
      if (res.code == 0) {
        console.log('发布课评成功');
        // 使用 redirectTo 跳转
        Taro.redirectTo({
          url: '/pages/main/index', // 页面路径
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    });
  };

  //星级部分的代码
  const [selectedStarIndex, setSelectedStarIndex] = useState(-1);

  const onStarClick = (index) => {
    console.log('选中的星级索引:', index);
    setSelectedStarIndex(index + 1);
    // 执行其他需要的逻辑
  };

  return (
    <Form className="view">
      <View className="p">
        <Text> 选择课程 : </Text>
        <Label3 content={courseName}></Label3>
      </View>
      <View className="p">
        <Text>评价星级 :</Text>
        <Star onStarClick={onStarClick} />
      </View>
      <View className="p">
        <Text>考核方式 :</Text>
        <View className="ways">
          {testways.map((item) => (
            <Radio
              key={item.value}
              className="myradio"
              checked={selectedValues.includes(item.value)} // 判断是否包含该项的 value
              value={item.value}
              color="transparent"
              onClick={() => handleRadioChange(item.value)}
            >
              {item.text}
            </Radio>
          ))}
        </View>
      </View>
      <View className="p">
        <Text>课程特点</Text>
        <View className="fea">
          {features.map((item) => {
            return (
              <Label3
                key={item.value}
                id={item.value} // 确保 Label3 组件可以访问到 id
                content={item.content}
                checked={selectedFeatureValues.includes(item.value)} // 判断是否包含该项的 id
                handleChecked={() => handleFeaturesChecked(item.value)} // 传递 handleChecked 函数
              />
            );
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
      <Button onClick={postEvaluation}>发布</Button>
    </Form>
  );
}
