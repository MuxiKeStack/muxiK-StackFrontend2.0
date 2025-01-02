import { Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React from 'react';

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
      <View className="flex flex-col items-center gap-2">
        <Textarea
          className="mt-10 h-[20vh] w-4/5 rounded-lg bg-[#f9f9f9] p-4 text-sm"
          placeholder="欢迎为课栈提建议or私聊和我们说悄悄话呀~"
          maxlength={500}
        />
        <View className="flex w-[90%] items-center justify-between">
          <View className="text-sm text-[#646464]">课栈交流群：764752182</View>
          <View className="text-sm text-orange-400 underline" onClick={handleCopy}>
            点击复制
          </View>
        </View>
      </View>
    </>
  );
});

export default Page;
