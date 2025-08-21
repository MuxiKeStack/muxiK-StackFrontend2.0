import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo } from 'react';
import { AtIcon } from 'taro-ui';

const Contact: React.FC = memo(() => {
  const handleCopy = () => {
    void Taro.setClipboardData({
      data: 'https://jwc.ccnu.edu.cn/info/1048/9828.htm',
      success: () => {
        void Taro.showToast({
          title: '已复制链接，请在浏览器中打开',
          icon: 'success',
        });
      },
    });
  };
  return (
    <View
      className="fixed bottom-[16vh] right-8 flex flex-col items-center gap-2"
      onTouchEnd={handleCopy}
    >
      <View className="flex aspect-square w-14 items-center justify-center rounded-full bg-[#f9f9f2] shadow-xl">
        <AtIcon value="mail" size={30} color="#f18900" />
      </View>
      <Text className="text-xs">教秘通讯录</Text>
    </View>
  );
});

export default Contact;
