import { Text, View } from '@tarojs/components';
import { memo } from 'react';
import { AtIcon } from 'taro-ui';

const Contact: React.FC = memo(() => {
  return (
    <View className="fixed bottom-[16vh] right-8 flex flex-col items-center gap-2">
      <View className="flex aspect-square w-14 items-center justify-center rounded-full bg-[#f9f9f2] shadow-xl">
        <AtIcon value="mail" size={30} color="#f18900" />
      </View>
      <Text className="text-xs">教秘通讯录</Text>
    </View>
  );
});

export default Contact;
