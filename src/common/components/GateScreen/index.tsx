import { Image, Text, View } from '@tarojs/components';

import { Icon, TopBackground } from '@/common/assets/img/login';
import { NavigationBar } from '@/modules/navigation';

import './index.scss';

interface GateScreenProps {
  className?: string;
  message?: string;
  title?: string;
}

const GateScreen: React.FC<GateScreenProps> = ({
  className,
  message = '木犀课栈',
  title = '',
}) => {
  return (
    <View className={`gate_screen ${className ?? ''}`}>
      <NavigationBar title={title} isBackToPage />
      <Image src={TopBackground as string} className="gate_screen_bg" mode="widthFix" />
      <View className="gate_screen_header">
        <View className="gate_screen_logo_wrapper">
          <Image src={Icon as string} className="gate_screen_logo" />
        </View>
        <Text className="gate_screen_title">{message}</Text>
      </View>
      <Text className="gate_screen_hint">敬请期待</Text>
    </View>
  );
};

export default GateScreen;
