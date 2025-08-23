import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import useActiveButtonStore, { ActiveButtonType } from '@/common/hooks/useActiveNav';
import { uniqueKey } from '@/common/utils';

const TAB_LIST: Array<{ pagePath: string; name: string; icon?: string }> = [
  { pagePath: '/pages/main/index', name: 'Home', icon: 'streaming' },
  { pagePath: '/pages/guide/index', name: 'Guide', icon: 'download-cloud' },
  { pagePath: '/pages/evaluate/index', name: '+' },
  { pagePath: '/pages/notification/index', name: 'Massage', icon: 'message' },
  { pagePath: '/pages/profile/index', name: 'Profile', icon: 'user' },
];

const TabBar: React.FC = memo(() => {
  const { activeButton, setActiveButton } = useActiveButtonStore();

  return (
    <View className="guild_line">
      {TAB_LIST.map((item) => (
        <>
          {item.name === '+' ? (
            <View className="add_button">
              <View
                className="add_sign"
                onClick={() => {
                  void Taro.navigateTo({ url: '/pages/evaluate/index' });
                }}
              >
                +
              </View>
            </View>
          ) : (
            <AtIcon
              key={uniqueKey.nextKey()}
              value={item.icon as string}
              size="35"
              color={activeButton === item.name ? '#f18900' : '#FFD777'}
              onClick={() => {
                void Taro.switchTab({ url: item.pagePath });
                setActiveButton(item.name as ActiveButtonType);
              }}
            ></AtIcon>
          )}
        </>
      ))}
    </View>
  );
});

export default TabBar;
