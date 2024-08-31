import { Text, View } from '@tarojs/components';
import { memo } from 'react';
import { AtIcon } from 'taro-ui';

import uniqueKeyUtil from '@/common/utils/keyGen';

interface TabBarProps {
  tab: string;
  setTab: (tab: string) => void;
}

const Tabs: { name: string; icon: string }[] = [
  {
    name: '提问',
    icon: 'clock',
  },
  {
    name: '点赞',
    icon: 'clock',
  },
  {
    name: '官方',
    icon: 'clock',
  },
];

const TabBar: React.FC<TabBarProps> = memo(({ tab, setTab }) => (
  <View className="mb-2 flex w-full justify-evenly">
    {Tabs.map((item) => (
      <View key={uniqueKeyUtil.nextKey()} className="flex flex-col items-center gap-2">
        <View className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f9f9f2] shadow-lg">
          <AtIcon
            value={item.icon}
            size="35"
            color={tab === item.name ? '#f18900' : '#FFD777'}
            onClick={() => {
              setTab(item.name);
            }}
          ></AtIcon>
        </View>
        <Text>{item.name}</Text>
      </View>
    ))}
  </View>
));

export default TabBar;
