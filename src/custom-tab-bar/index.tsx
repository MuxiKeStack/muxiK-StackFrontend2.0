import { View } from '@tarojs/components';

// 这边说一下，tabbar的样式没办法用tailwindcss，所以只能写原生
import './index.scss';

// eslint-disable-next-line import/first
import useActiveButtonStore from '@/common/hooks/useActiveNav';

const TAB_LIST: Array<{ pagePath: string; text?: string }> = [
  { pagePath: '/pages/123/index', text: '123' },
  { pagePath: '/pages/456/index', text: '456' },
];

const TabBar: React.FC = () => {
  const { activeButton, setActiveButton } = useActiveButtonStore();

  return <View className="tabBar">test</View>;
};

export default TabBar;
