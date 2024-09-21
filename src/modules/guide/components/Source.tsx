import { Text, View } from '@tarojs/components';
import { memo } from 'react';
import { AtIcon } from 'taro-ui';

const SourceItem: React.FC<{ text: string }> = memo(({ text }) => (
  <View className="flex w-full items-center gap-4 p-2 hover:bg-gray-200">
    <AtIcon value="file-generic" size="35" color="#f18900" />
    <Text className="text-sm">{text}</Text>
  </View>
));

const Source: React.FC = memo(() => {
  return (
    <View className="h-auto min-h-[75vh] w-full rounded-lg bg-[#f9f9f2] px-4 py-2">
      <SourceItem text="2022-2023第一学期选课手册" />
      <SourceItem text="2022-2023第一学期选课手册(2)" />
      <SourceItem text="2022-2023第一学期选课手册(3)" />
    </View>
  );
});

export default Source;
