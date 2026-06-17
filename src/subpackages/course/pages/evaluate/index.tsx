/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Radio, ScrollView, Text, Textarea, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';

import './index.scss';

import type { PublishEvaluationBody } from '@/subpackages/course/pages/evaluate/publish';
import { publishEvaluationAndBroadcast } from '@/subpackages/course/pages/evaluate/publish';

import { GateScreen, StarRating } from '@/common/components';
import FeatureLabel from '@/common/components/FeatureLabel';
import { ASSESSMENT_MAP, COURSE_FEATURE_MAP } from '@/common/constants/courseLabels';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { BusinessError } from '@/common/request/errors/BusinessError';
import { hideLoadingThenToast } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

function readCourseIdFromRoute(): number {
  const pages = Taro.getCurrentPages();
  const current = pages[pages.length - 1] as
    | { options?: Record<string, string> }
    | undefined;
  const id = Number(current?.options?.id);
  return id > 0 ? id : 0;
}

function readCourseNameFromRoute(): string | null {
  const pages = Taro.getCurrentPages();
  const current = pages[pages.length - 1] as
    | { options?: Record<string, string> }
    | undefined;
  const name = current?.options?.name;
  return name ? decodeURIComponent(name) : null;
}

function publishErrorMessage(error: unknown): string {
  if (error instanceof BusinessError) {
    return error.message || `发布失败(${error.code})`;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.length > 24 ? `${error.message.slice(0, 24)}…` : error.message;
  }
  return '发布失败，请稍后重试';
}

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
  const [selectedStarIndex, setSelectedStarIndex] = useState<number>(-1);

  const [courseId, setId] = useState<number | undefined>(undefined);
  const [courseName, setName] = useState<string | null>('只能评价自己学过的课程哦');
  const gate = useGateGuard();
  const { guard } = useAuthGuard();

  const syncCourseFromRoute = useCallback(() => {
    const id = readCourseIdFromRoute();
    const name = readCourseNameFromRoute();
    if (id > 0) setId(id);
    if (name) setName(name);
  }, []);

  useEffect(() => {
    syncCourseFromRoute();
  }, [syncCourseFromRoute]);

  useDidShow(() => {
    syncCourseFromRoute();
  });

  const postEvaluation = () => {
    if (!guard()) return;
    if (!courseId || courseId <= 0) {
      void Taro.showToast({
        title: '课程信息缺失，请返回重试',
        icon: 'none',
      });
      return;
    }
    if (selectedStarIndex === -1) {
      void Taro.showToast({
        title: '请为课程选择星级',
        icon: 'none',
      });
      return;
    }
    const content = comment.trim();
    if (!content) {
      void Taro.showToast({
        title: '内容不能为空',
        icon: 'none',
      });
      return;
    }
    const evaluationobj: PublishEvaluationBody = {
      star_rating: selectedStarIndex,
      content,
      course_id: courseId,
      assessments: selectedValues,
      features: selectedFeatureValues,
      id: 0,
      status: 'Public',
      is_anonymous: isAnonymous,
    };

    void Taro.showLoading({
      title: '提交中',
    });
    publishEvaluationAndBroadcast(evaluationobj)
      .then(() => {
        void Taro.hideLoading();
        void Taro.navigateBack().then(() => {
          void Taro.showToast({
            title: '课评发布成功',
            icon: 'none',
          });
        });
      })
      .catch((error) => {
        hideLoadingThenToast({
          title: publishErrorMessage(error),
          icon: 'none',
        });
      });
  };

  const onStarClick = (index) => {
    setSelectedStarIndex(index + 1);
  };

  const countContent = (e: any) => {
    const { value } = e.detail;
    setComment(value);
    setLength(value.length);
  };

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen title="评课" />;
  return (
    <View className="evaluate_page_shell">
      <NavigationBar title="评课" isBackToPage />
      <ScrollView className="evaluate_page_scroll" scrollY showScrollbar={false}>
        <View className="evaluate_page_form">
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
              adjustPosition
              cursorSpacing={80}
              showConfirmBar={false}
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
          <View className="evaluate_page_submit_button" onClick={postEvaluation}>
            发布
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
