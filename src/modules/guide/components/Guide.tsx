import { Text, View } from '@tarojs/components';
import { memo } from 'react';

import { NavigationBar } from '@/modules/navigation';

const Guide: React.FC = memo(() => {
  return (
    <View className="flex h-screen w-full flex-col items-center justify-center">
      <NavigationBar title="选课手册" isTabPage />
      <Text className="mt-20 text-2xl font-bold" style={{ color: '#999999' }}>
        敬请期待
      </Text>
    </View>
  );
});

export default Guide;
