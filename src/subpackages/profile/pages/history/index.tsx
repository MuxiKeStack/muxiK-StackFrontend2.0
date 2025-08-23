import { View } from '@tarojs/components';
import { memo } from 'react';

import './index.scss';

import { NavigationBar } from '@/modules/navigation';
import History from '@/subpackages/profile/modules';

const Page: React.FC = memo(() => (
  <>
    <NavigationBar title="评课历史" isBackToPage />
    <View className="mt-24">
      <History />
    </View>
  </>
));

export default Page;
