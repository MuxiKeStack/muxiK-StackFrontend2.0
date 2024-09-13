import { View } from '@tarojs/components';
import { memo } from 'react';

import Selector from './Selector';
import Source from './Source';

const Guide: React.FC = memo(() => (
  <View className="flex h-screen w-full flex-col items-center gap-4 overflow-y-scroll px-4 pb-[13vh] pt-2">
    <Selector />
    <Source />
  </View>
));

export default Guide;
