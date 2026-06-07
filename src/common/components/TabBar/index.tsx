import { Text, View } from '@tarojs/components';
import { memo } from 'react';

import './index.scss';

import IconFont from '@/common/components/iconfont';
import { TabBarProps } from '@/common/types/tabBarType';
import { uniqueKey } from '@/common/utils';

const TabBar: React.FC<TabBarProps> = memo(({ tabs, onTabClick }) => (
  <View className="tab_bar_container">
    {tabs.map((item) => (
      <View
        key={uniqueKey.nextKey()}
        className="tab_bar_button"
        onClick={() => {
          onTabClick(item.key);
        }}
      >
        <View className="tab_bar_icon_wrapper">
          <IconFont
            /* @ts-expect-error 轮子问题 */
            name={item.icon}
            size={35}
            color="#FE9F00"
          ></IconFont>
        </View>
        <Text className="tab_bar_text">{item.name}</Text>
      </View>
    ))}
  </View>
));

export default TabBar;
