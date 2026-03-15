import { TASIcon } from '@/common/assets/img/icons';
import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo } from 'react';

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
      className="fixed right-8 top-[12vh] flex flex-col items-center gap-2"
      onClick={handleCopy}
    >
      <View className="flex aspect-square w-10 items-center justify-center rounded-lg bg-[#FFFAEC] shadow-xl">
        <Image src={TASIcon} style={{ width: '64rpx', height: '64rpx' }} />
      </View>
      <Text className="text-xs">联系教秘</Text>
    </View>
  );
});

export default Contact;
