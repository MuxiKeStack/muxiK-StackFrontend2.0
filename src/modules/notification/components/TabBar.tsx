import { Text, View } from '@tarojs/components';
import { memo } from 'react';

import IconFont from '@/common/components/iconfont';
import { uniqueKey } from '@/common/utils';
import './TabBar.scss';

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
  <View className="tab_bar_container">
    {Tabs.map((item) => (
      <View
        key={uniqueKey.nextKey()}
        className="tab_bar_button"
        onClick={() => {
          setTab(item.name);
        }}
      >
        <View className="tab_bar_icon_wrapper">
          <IconFont
            /* @ts-expect-error 轮子问题 */
            name={item.icon}
            size={35}
            color={tab === item.name ? '#f18900' : '#FFD777'}
          ></IconFont>
        </View>
        <Text className="tab_bar_text">{item.name}</Text>
      </View>
    ))}
  </View>
));

export default TabBar;
