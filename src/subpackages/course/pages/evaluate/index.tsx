/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Button,
  Form,
  Radio,
  ScrollView,
  Text,
  Textarea,
  View,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import { publishEvaluationAndBroadcast } from '@/subpackages/course/pages/evaluate/publish';

import { GateScreen, StarRating } from '@/common/components';
import FeatureLabel from '@/common/components/FeatureLabel';
import { ASSESSMENT_MAP, COURSE_FEATURE_MAP } from '@/common/constants/courseLabels';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { NavigationBar } from '@/modules/navigation';

const Page: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleRadioChange = (value: string) => {
    const currentIndex = selectedValues.indexOf(value);
    if (currentIndex > -1) {
      const newSelectedValues = selectedValues.filter((_, i) => i !== currentIndex);
      setSelectedValues(newSelectedValues);
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };
  const [selectedFeatureValues, setSelectedFeatureValues] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const handleFeaturesChecked = (value: string) => {
    const currentIndex = selectedFeatureValues.indexOf(value);
    if (currentIndex > -1) {
      const newSelectedFeatureValues = selectedFeatureValues.filter(
        (_, i) => i !== currentIndex
      );
      setSelectedFeatureValues(newSelectedFeatureValues);
    } else {
      setSelectedFeatureValues([...selectedFeatureValues, value]);
    }
  };

  const [textLength, setLength] = useState(0);
  const [comment, setComment] = useState('');

  const countContent = (e: any) => {
    const { value } = e.detail;
    setComment(value);
    const length = value.length;
    setLength(length);
  };

  const [courseId, setId] = useState<number | undefined>(undefined);
  const [courseName, setName] = useState<string | null>('只能评价自己学过的课程哦');
  const gate = useGateGuard();
  const { guard } = useAuthGuard();

  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const params = instance?.router?.params || {};

    setId(params.id ? Number(params.id) : undefined);
    setName(params.name ? decodeURIComponent(params.name) : '只能评价自己学过的课程哦');
  }, []);

  const postEvaluation = () => {
    if (!guard()) return;
    if (selectedStarIndex === -1) {
      void Taro.showToast({
        title: '请为课程选择星级',
        icon: 'none',
      });
      return;
    }
    if (!comment) {
      void Taro.showToast({
        title: '内容不能为空',
        icon: 'none',
      });
      return;
    }
    const evaluationobj = {
      star_rating: selectedStarIndex,
      content: comment,
      course_id: courseId,
      assessments: selectedValues,
      features: selectedFeatureValues,
      id: 0,
      status: 'Public' as 'Public' | 'Private',
      is_anonymous: isAnonymous,
    };

    void Taro.showLoading({
      title: '提交中',
    });
    publishEvaluationAndBroadcast(evaluationobj)
      .then(() => {
        void Taro.navigateBack().then(() => {
          void Taro.showToast({
            title: '课评发布成功',
            icon: 'none',
          });
        });
      })
      .catch((error) => {
        console.error('发布课评请求失败:', error);
      })
      .finally(() => {
        void Taro.hideLoading();
      });
  };
  const [selectedStarIndex, setSelectedStarIndex] = useState<number>(-1);

  const onStarClick = (index) => {
    setSelectedStarIndex(index + 1);
  };

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen title="评课" />;
  return (
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
          <StarRating onStarClick={onStarClick} />
        </View>
        <View className="evaluate_page_section">
          <Text className="evaluate_page_label">考核方式 :</Text>
          <View className="evaluate_page_ways_container">
            {Object.entries(ASSESSMENT_MAP).map(([value, text]) => (
              <Radio
                key={value}
                className="evaluate_page_radio"
                checked={selectedValues.includes(value)}
                value={value}
                color="transparent"
                onClick={() => handleRadioChange(value)}
              >
                {text}
              </Radio>
            ))}
          </View>
        </View>
        <View className="evaluate_page_section">
          <Text className="evaluate_page_label">课程特点 :</Text>
          <View className="evaluate_page_features_container">
            {Object.entries(COURSE_FEATURE_MAP).map(([value, content]) => {
              return (
                <FeatureLabel
                  key={value}
                  id={value}
                  content={content}
                  style={{
                    width: '150rpx',
                    textAlign: 'center',
                  }}
                  checked={selectedFeatureValues.includes(value)}
                  handleChecked={() => handleFeaturesChecked(value)}
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
