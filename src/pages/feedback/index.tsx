import { Textarea, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React from 'react';

import './index.scss';

type FeedbackProps = object;

const Feedback: React.FC<FeedbackProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  const copyText = '要复制的字符串';

  const handleCopy = () => {
    void Taro.setClipboardData({
      data: copyText,
      success: () => {
        void Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000,
        });
      },
      fail: () => {
        Taro.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  };

  return (
    <View className="Feedback">
      <Textarea
        className="feedback_input"
        placeholder="欢迎为课栈提建议or私聊和我们说悄悄话呀~"
        maxlength={500}
      />
      <View className="feedback_contact_us">
        <View className="feedback_qq_team">课栈交流群：799651462</View>
        <View className="feedback_copy" onClick={handleCopy}>
          点击复制
        </View>
      </View>
    </View>
  );
};

export default Feedback;
