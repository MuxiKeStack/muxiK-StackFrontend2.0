import { Text, View } from '@tarojs/components';
import { memo } from 'react';

import IconFont from '@/common/components/iconfont';
import { uniqueKey } from '@/common/utils';

interface TabBarProps {
  tab: string;
  setTab: (tab: string) => void;
}

const Tabs: { name: string; icon: string }[] = [
  {
    name: '提问',
    icon: 'tiwen',
  },
  {
    name: '点赞',
    icon: 'like',
  },
  {
    name: '官方',
    icon: 'guanfangbanben',
  },
];

const TabBar: React.FC<TabBarProps> = memo(({ tab, setTab }) => (
  <View className="mt-20 flex h-28 w-full justify-around">
    {Tabs.map((item) => (
      <View
        key={uniqueKey.nextKey()}
        className="flex flex-col items-center gap-2"
        onTouchEnd={() => {
          setTab(item.name);
        }}
      >
        <View className="flex h-16 w-16 items-center justify-center rounded-md bg-[#FEF6DF] shadow-lg">
          <IconFont
            /* @ts-expect-error 轮子问题 */
            name={item.icon}
            size={35}
            color={tab === item.name ? '#f18900' : '#FFD777'}
          ></IconFont>
        </View>
        <Text className="text-lg">{item.name}</Text>
      </View>
    ))}
  </View>
));

export default TabBar;
