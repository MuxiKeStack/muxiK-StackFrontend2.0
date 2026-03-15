/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Button,
  Form,
  Image,
  Radio,
  ScrollView,
  Text,
  Textarea,
  View,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import { Icon, TopBackground } from '@/common/assets/img/login';
import FeatureLabel from '@/common/components/FeatureLabel';
import Star from '@/common/components/star/star';
import { post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';
import { NavigationBar } from '@/modules/navigation';

export interface StatusResponse {
  code: number;
  data: {
    status: boolean;
  };
  msg: string;
}

const Page: React.FC = () => {
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
  const testways = [
    { value: 'OpenBookExamination', text: '开卷考试' },
    { value: 'ClosedBookExamination', text: '闭卷考试' },
    { value: 'ThesisExamination', text: '论文考核' },
    { value: 'GroupReporting', text: '小组汇报' },
    { value: 'NoAssessment', text: '无考核' },
  ];

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const handleFeaturesChecked = (value: string) => {
    const currentIndex = selectedFeatureValues.indexOf(value);
    if (currentIndex > -1) {
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
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;

        setTest(res.data.status);

        const instance = Taro.getCurrentInstance();
        const params = instance?.router?.params || {};

        setId(params.id ? Number(params.id) : null);
        setName(
          params.name ? decodeURIComponent(params.name) : '只能评价自己学过的课程哦'
        );
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    void getParams();
  }, []);
  useEffect(() => {
    console.log('test status updated:', test);
  }, [test]);

  const postEvaluation = () => {
    if (selectedStarIndex === -1) {
      void Taro.showToast({
        title: '请为课程选择星级',
        icon: 'none',
      });
      return;
    }
    void Taro.showLoading({
      title: '提交中',
    });
    const evaluationobj = {
      star_rating: selectedStarIndex,
      content: comment,
      course_id: courseId,
      assessments: selectedValues,
      features: selectedFeatureValues,
      id: 0,
      status: 'Public',
      is_anonymous: isAnonymous,
    };
    console.log(evaluationobj);
    if (!comment) {
      void Taro.showToast({
        title: '内容不能为空',
        icon: 'none',
      });
      return;
    }
    post(`/evaluations/save`, evaluationobj)
      .then((res) => {
        if (res.code === 0) {
          void Taro.navigateBack().then(() => {
            void Taro.showToast({
              title: '课评发布成功',
              icon: 'none',
            });
          });
        } else {
          void Taro.showToast({
            title: res.msg,
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        console.error('发布课评请求失败:', error);
      })
      .finally(() => {
        void Taro.hideLoading();
      });
  };
  const [selectedStarIndex, setSelectedStarIndex] = useState(-1);

  const onStarClick = (index) => {
    setSelectedStarIndex(index + 1);
  };

  const onLableClick = () => {
    if (courseName == '只能评价自己学过的课程哦') {
      void Taro.navigateTo({
        url: '/pages/myclass/index',
      });
    }
  };
  return !test ? (
    <View className="evaluate_page_unauthorized_container">
      <Image
        src={TopBackground as string}
        className="evaluate_page_background_image"
      ></Image>
      <View className="evaluate_page_unauthorized_content">
        <View className="evaluate_page_unauthorized_icon_wrapper">
          <Image src={Icon as string} className="evaluate_page_unauthorized_icon"></Image>
        </View>
        <Text className="evaluate_page_unauthorized_text">木犀课栈</Text>
      </View>
    </View>
  ) : (
    <ScrollView
      className="evaluate_page_container"
      scrollY
      enhanced
      showScrollbar={false}
    >
      <Form className="evaluate_page_form">
        <NavigationBar title="评课" isBackToPage />
        <View className="evaluate_page_section">
          <Text className="evaluate_page_label">课程名字 :</Text>
          <Text>{courseName}</Text>
        </View>
        <View className="evaluate_page_section">
          <Text className="evaluate_page_label">评价星级 :</Text>
          <Star onStarClick={onStarClick} />
        </View>
        <View className="evaluate_page_section">
          <Text className="evaluate_page_label">考核方式 :</Text>
          <View className="evaluate_page_ways_container">
            {testways.map((item) => (
              <Radio
                key={item.value}
                className="evaluate_page_radio"
                checked={selectedValues.includes(item.value)}
                value={item.value}
                color="transparent"
                onClick={() => handleRadioChange(item.value)}
              >
                {item.text}
              </Radio>
            ))}
          </View>
        </View>
        <View className="evaluate_page_section">
          <Text className="evaluate_page_label">课程特点 :</Text>
          <View className="evaluate_page_features_container">
            {features.map((item) => {
              return (
                <FeatureLabel
                  key={item.value}
                  id={item.value} // 确保 FeatureLabel 组件可以访问到 id
                  content={item.content}
                  style={{
                    width: '150rpx',
                    textAlign: 'center',
                  }}
                  checked={selectedFeatureValues.includes(item.value)} // 判断是否包含该项的 id
                  handleChecked={() => handleFeaturesChecked(item.value)} // 传递 handleChecked 函数
                />
              );
            })}
          </View>
        </View>
        <View className="evaluate_textarea_container">
          <Textarea
            maxlength={450}
            onInput={countContent}
            placeholderStyle="font-size: 25rpx;"
            placeholder="输入课程评价"
            className="evaluate_page_textarea"
          ></Textarea>
          <Text className="evaluate_page_word_limit">字数限制{textLength}/450</Text>
        </View>
        <View className="evaluate_page_anonymous_section">
          <Radio
            value="anonymous"
            className="evaluate_page_anonymous_radio"
            checked={isAnonymous}
            onClick={() => setIsAnonymous(!isAnonymous)}
            color="transparent"
          ></Radio>
          <Text className="evaluate_page_anonymous_text">匿名</Text>
        </View>
        <Button className="evaluate_page_submit_button" onClick={postEvaluation}>
          发布
        </Button>
      </Form>
    </ScrollView>
  );
};

export default Page;
