import { ArrowDown } from '@taroify/icons';
import { Text, View } from '@tarojs/components';
import { memo } from 'react';

interface SelectorProps {}

const Selector: React.FC<SelectorProps> = memo(() => {
  return (
    <View className="flex w-full items-center justify-between px-2">
      <View className="flex w-1/3 flex-col gap-2">
        <Text className="pl-2 text-xs">选择学年</Text>
        <View className="flex w-full justify-between rounded-lg bg-[#f9f9f2] px-2 py-1">
          <Text className="text-xs">全部</Text>
          <ArrowDown className="text-xs" style={{ color: '#f18900' }} />
        </View>
      </View>
      <View className="flex w-1/3 flex-col gap-2">
        <Text className="pl-2 text-xs">选择学期</Text>
        <View className="flex w-full justify-between rounded-lg bg-[#f9f9f2] px-2 py-1">
          <Text className="text-xs">全部</Text>
          <ArrowDown className="text-xs" style={{ color: '#f18900' }} />
        </View>
      </View>
    </View>
  );
});

export default Selector;
