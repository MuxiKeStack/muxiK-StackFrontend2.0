import { Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React from 'react';

import { NavigationBar } from '@/modules/navigation';

import './style.scss';

const Page: React.FC = React.memo(() => {
  // const [textareaValue, setTextareaValue] = useState('');
  const copyText = '764752182';

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
        void Taro.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  };

  return (
    <>
      <View className="mt-24 flex flex-col items-center gap-2">
        <NavigationBar title="意见反馈" isBackToPage />
        <Textarea
          className="mt-3 h-[20vh] w-4/5 rounded-lg bg-[#FFFAEC] p-4 text-sm"
          placeholder="欢迎为课栈提建议or私聊和我们说悄悄话呀~"
          placeholderStyle="color: #333333"
          maxlength={500}
        />
        <View className="flex w-[90%] items-center justify-between">
          <View className="text-sm text-[#333333]">课栈交流群：764752182</View>
          <View className="text-sm text-[#EDA335] underline" onTouchEnd={handleCopy}>
            点击复制
          </View>
        </View>
      </View>
    </>
  );
});

export default Page;
