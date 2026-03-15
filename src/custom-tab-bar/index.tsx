import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import useActiveButtonStore, { ActiveButtonType } from '@/common/hooks/useActiveNav';
import { uniqueKey } from '@/common/utils';

const TAB_LIST: Array<{
  pagePath: string;
  name: string;
  icon?: string;
  content?: string;
}> = [
  { pagePath: '/pages/main/index', name: 'Home', icon: 'streaming', content: '广场' },
  {
    pagePath: '/pages/guide/index',
    name: 'Guide',
    icon: 'download-cloud',
    content: '手册',
  },
  { pagePath: '/pages/evaluate/index', name: '+' },
  {
    pagePath: '/pages/notification/main/index',
    name: 'Massage',
    icon: 'message',
    content: '消息',
  },
  { pagePath: '/pages/profile/index', name: 'Profile', icon: 'user', content: '我的' },
];

const TabBar: React.FC = memo(() => {
  const { activeButton, setActiveButton } = useActiveButtonStore();

  return (
    <View className="guild_line">
      {TAB_LIST.map((item) => (
        <>
          {item.name === '+' ? (
            <View
              className="add_button"
              onClick={() => {
                void Taro.navigateTo({ url: '/pages/evaluate/index' });
              }}
            ></View>
          ) : (
            <View className="tab-item-wrapper">
              <AtIcon
                key={uniqueKey.nextKey()}
                value={item.icon as string}
                size="30"
                color={activeButton === item.name ? '#f18900' : '#999999'}
                onClick={() => {
                  void Taro.switchTab({ url: item.pagePath });
                  setActiveButton(item.name as ActiveButtonType);
                }}
              />
              <Text className={`tab-text ${activeButton === item.name ? 'active' : ''}`}>
                {item.content}
              </Text>
            </View>
          )}
        </>
      ))}
    </View>
  );
});

export default TabBar;

// import { Image, View } from '@tarojs/components';
// import Taro from '@tarojs/taro';
// import React, { memo } from 'react';

// import './index.scss';

// import {
//   ManualIcon,
//   ProfileIcon,
//   SquareIcon,
//   noticeIcon,
// } from '@/common/assets/img/tabBar';
// import useActiveButtonStore, { ActiveButtonType } from '@/common/hooks/useActiveNav';
// import { uniqueKey } from '@/common/utils';

// const TAB_LIST: Array<{ pagePath: string; name: string; icon: string }> = [
//   { pagePath: '/pages/main/index', name: 'Home', icon: SquareIcon },
//   { pagePath: '/pages/guide/index', name: 'Guide', icon: ManualIcon },
//   { pagePath: '/pages/evaluate/index', name: '+', icon: '' },
//   { pagePath: '/pages/notification/index', name: 'Massage', icon: noticeIcon },
//   { pagePath: '/pages/profile/index', name: 'Profile', icon: ProfileIcon },
// ];

// const TabBar: React.FC = memo(() => {
//   const { activeButton, setActiveButton } = useActiveButtonStore();

//   return (
//     <View className="guild_line">
//       {TAB_LIST.map((item) => (
//         <>
//           {item.name === '+' ? (
//             <View className="add_button">
//               <View
//                 className="add_sign"
//                 onClick={() => {
//                   void Taro.navigateTo({ url: '/pages/evaluate/index' });
//                 }}
//               >
//                 +
//               </View>
//             </View>
//           ) : (
//             <Image
//               key={uniqueKey.nextKey()}
//               src={item.icon}
//               style={{
//                 width: '35px',
//                 height: '35px',
//                 color: activeButton === item.name ? '#f18900' : '#FFD777',
//               }}
//               onClick={() => {
//                 void Taro.switchTab({ url: item.pagePath });
//                 setActiveButton(item.name as ActiveButtonType);
//               }}
//             />
//           )}
//         </>
//       ))}
//     </View>
//   );
// });

// export default TabBar;
