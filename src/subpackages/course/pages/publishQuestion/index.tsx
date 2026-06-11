import { Button, Image, Radio, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import { publishQuestionAndBroadcast } from '@/subpackages/course/pages/publishQuestion/publish';

import askicon from '@/common/assets/img/publishQuestion/ask.png';
import { CourseInfo, GateScreen, PublishHeader } from '@/common/components';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';

const Page: React.FC = () => {
  const [courseId, setCourseId] = useState<string | null>(null);
  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      const params = instance?.router?.params || {};

      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []);

  const gate = useGateGuard();
  const { guard } = useAuthGuard();
  const [content, setContent] = useState('');
  const [textLength, setTextLength] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const onInput = (e: any) => {
    const { value } = e?.detail ?? {};
    if (typeof value === 'string') {
      setContent(value);
      setTextLength(value.length);
    }
  };

  const postQuestion = () => {
    if (!guard()) return;
    if (!content) {
      void Taro.showToast({
        title: '内容不能为空',
        icon: 'none',
      });
      return;
    }
    const questionobj = {
      biz: 'Course',
      biz_id: Number(courseId),
      content,
      is_anonymous: isAnonymous,
    };
    publishQuestionAndBroadcast(questionobj, {
      content,
      biz_id: Number(courseId),
      biz: 'Course',
      is_anonymous: isAnonymous,
    })
      .then(() => {
        void Taro.showToast({ title: '发布问题成功', icon: 'success' });
        void Taro.navigateBack();
      })
      .catch((error) => {
        void Taro.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
        console.error('发布问题请求失败:', error);
      });
  };
  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen />;
  return (
    <View className="publish_question_page">
      {courseId && <CourseInfo courseId={Number(courseId)} />}
      <View className="publish_question_card">
        <PublishHeader />
        <Image src={askicon} className="publish_question_icon" />
        <View className="publish_question_textarea_wrapper">
          <Textarea
            maxlength={450}
            onInput={onInput}
            placeholderStyle="font-size: 25rpx; color: #cccccc;"
            placeholder="关于课程你有什么要了解的？"
            className="publish_question_textarea"
          />
          <Text className="publish_question_word_count">{textLength}/450</Text>
        </View>
      </View>
      <View className="publish_question_anonymous_section">
        <Radio
          value="anonymous"
          className="publish_question_anonymous_radio"
          checked={isAnonymous}
          onClick={() => setIsAnonymous(!isAnonymous)}
          color="transparent"
        />
        <Text className="publish_question_anonymous_text">匿名提问</Text>
      </View>
      <Button onClick={postQuestion} className="publish_question_submit_btn">
        发布问题
      </Button>
    </View>
  );
};

export default Page;
