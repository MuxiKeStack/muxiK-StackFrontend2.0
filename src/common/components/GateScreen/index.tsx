import { Image, Text, View } from '@tarojs/components';

import { Icon, TopBackground } from '@/common/assets/img/login';

interface GateScreenProps {
  className?: string;
  message?: string;
}

const GateScreen: React.FC<GateScreenProps> = ({ className, message = '木犀课栈' }) => {
  return (
    <View className={`flex flex-col ${className ?? ''}`}>
      <Image src={TopBackground as string} className="w-full" />
      <View className="absolute top-0 mt-[15vh] flex w-full flex-col items-center gap-4">
        <View className="h-40 w-40 overflow-hidden rounded-2xl shadow-xl">
          <Image src={Icon as string} className="h-full w-full" />
        </View>
        <Text className="text-3xl font-semibold tracking-widest text-[#FFD777]">
          {message}
        </Text>
      </View>
    </View>
  );
};

export default GateScreen;
